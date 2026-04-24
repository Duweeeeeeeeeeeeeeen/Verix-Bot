import express from 'express';
import SocialConfig from '../../../src/models/SocialConfig.js';
import logger from '../../../src/utils/logger.js';

const router = express.Router();

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

export default router;
