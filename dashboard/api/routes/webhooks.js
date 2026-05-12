import express from 'express';
import SocialConfig from '../../../src/models/SocialConfig.js';
import logger from '../../../src/utils/logger.js';
import Parser from 'rss-parser';

const router = express.Router();
const rssParser = new Parser();

/**
 * Endpoint for external social webhooks (Instagram, TikTok, X, etc.)
 * URL: POST /api/webhooks/socials/:guildId/:platform?token=YOUR_TOKEN
 */
router.post('/socials/:guildId/:platform', async (req, res) => {
    try {
        const { guildId, platform } = req.params;
        const { token } = req.query;
        const { title, url, author, thumbnail, description } = req.body;

        if (!guildId || !platform || !token) {
            return res.status(400).json({ success: false, error: 'Missing parameters' });
        }

        // Validate platform
        const validPlatforms = ['instagram', 'tiktok', 'twitter'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({ success: false, error: 'Invalid platform for webhooks' });
        }

        // Fetch config
        const config = await SocialConfig.findOne({ guildId });
        if (!config) {
            return res.status(404).json({ success: false, error: 'Config not found' });
        }

        const platformConfig = config.platforms[platform];
        if (!platformConfig) {
            return res.status(404).json({ success: false, error: 'Platform not configured' });
        }

        // Verify token
        if (platformConfig.webhookToken !== token) {
            return res.status(401).json({ success: false, error: 'Invalid webhook token' });
        }

        // Check if enabled
        if (!platformConfig.enabled) {
            return res.status(403).json({ success: false, error: 'Platform disabled' });
        }

        // Process notification via Discord Client
        const client = req.discordClient;
        if (!client) {
            return res.status(500).json({ success: false, error: 'Discord client not available' });
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ success: false, error: 'Guild not found in bot cache' });
        }

        const channel = guild.channels.cache.get(platformConfig.notificationChannelId);
        if (!channel) {
            return res.status(404).json({ success: false, error: 'Notification channel not found' });
        }

        // Format and send message
        const customEmbed = platformConfig.embed || {};
        
        const formatText = (text) => text
            ? text.replace(/{streamer}/g, author || 'Account')
                  .replace(/{title}/g, title || 'Nuovo Post')
                  .replace(/{url}/g, url || '')
                  .replace(/{description}/g, description || '')
            : '';

        const embedData = {
            title: formatText(customEmbed.title),
            description: formatText(customEmbed.description),
            color: customEmbed.color ? parseInt(customEmbed.color.replace('#', ''), 16) : 0x6366f1,
            footer: { text: formatText(customEmbed.footer) }
        };

        if (thumbnail || customEmbed.image) {
            embedData.image = { url: thumbnail || customEmbed.image };
        } else if (customEmbed.thumbnail) {
            embedData.thumbnail = { url: customEmbed.thumbnail };
        }

        const content = platformConfig.mentionEveryone ? '@everyone' : (platformConfig.roleId ? `<@&${platformConfig.roleId}>` : null);
        
        await channel.send({ 
            content, 
            embeds: [embedData] 
        });

        logger.info(`[Webhook/Socials] Processed ${platform} post for guild ${guildId}`);
        res.json({ success: true, message: 'Notification sent' });

    } catch (error) {
        logger.error('[Webhook/Socials] Error processing webhook:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * YouTube WebSub Verification Endpoint (GET)
 * Google sends a challenge here to verify we own the URL before starting push notifications.
 */
router.get('/youtube/:channelId', (req, res) => {
    const mode = req.query['hub.mode'];
    const topic = req.query['hub.topic'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && topic && challenge) {
        logger.info(`[WebSub] Verified subscription for topic: ${topic}`);
        return res.status(200).send(challenge);
    }
    
    return res.status(400).send('Bad Request');
});

/**
 * YouTube WebSub Payload Endpoint (POST)
 * Google sends the new video XML here instantly upon upload.
 */
router.post('/youtube/:channelId', express.text({ type: ['application/atom+xml', 'application/xml', 'text/xml'] }), async (req, res) => {
    try {
        const { channelId } = req.params;
        const xmlBody = req.body;
        
        // Always return 2xx quickly to acknowledge receipt to Google
        res.status(200).send('OK');

        if (!xmlBody || typeof xmlBody !== 'string') return;
        
        // If it's a delete/update notification without a video, ignore
        if (xmlBody.includes('<at:deleted-entry')) return;

        const feed = await rssParser.parseString(xmlBody);
        if (!feed || !feed.items || feed.items.length === 0) return;

        const latestVideo = feed.items[0];
        const videoId = latestVideo.id.replace('yt:video:', '');

        // Find all guilds that are tracking this channelId
        const configs = await SocialConfig.find({ 'platforms.youtube.enabled': true });
        if (!configs.length) return;

        const client = req.discordClient || req.app.get('client'); // Depends on how Express attaches the client, req.discordClient is set in dashboardManager
        if (!client || !client.socialManager) {
            logger.error('[WebSub] Discord client or socialManager not available in request context');
            return;
        }

        for (const config of configs) {
            const platformConfig = config.platforms.youtube;
            if (!platformConfig || !platformConfig.accounts) continue;

            const trackingAccount = platformConfig.accounts.find(acc => acc.username.includes(channelId));
            if (!trackingAccount) continue;

            // Multi-bot protection
            if (client.multiBotManager && !client.multiBotManager.shouldHandle(config.guildId, client)) continue;

            // Avoid duplicates
            if (trackingAccount.lastPostId === latestVideo.id) continue;

            logger.info(`[WebSub] Received push notification for ${channelId} in guild ${config.guildId}`);

            // Fetch profile image if missing
            if (!trackingAccount.cachedProfileImage) {
                trackingAccount.cachedProfileImage = await client.socialManager.fetchYouTubeProfileImage(channelId);
            }

            await client.socialManager.handleSocialPost(config.guildId, platformConfig, trackingAccount, {
                title: latestVideo.title,
                url: latestVideo.link,
                author: feed.title || latestVideo.author || trackingAccount.username,
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                fallbackThumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                profileImage: trackingAccount.cachedProfileImage
            }, 'YouTube');

            trackingAccount.lastPostId = latestVideo.id;
            await config.save();
        }
    } catch (error) {
        logger.error('[WebSub] Error processing push notification:', error.message);
    }
});

export default router;
