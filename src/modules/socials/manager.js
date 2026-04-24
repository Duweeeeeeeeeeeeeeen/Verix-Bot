import mongoose from 'mongoose';
import SocialConfig from '../../models/SocialConfig.js';
import { getStreams } from '../../utils/twitchHelper.js';
import logger from '../../utils/logger.js';
import messageService from '../../utils/messageService.js';
import Parser from 'rss-parser';

const rssParser = new Parser();

export class SocialManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    init() {
        logger.info('[Socials] Manager initialized.');
        this.start(180000); // Poll every 3 minutes
    }

    start(ms) {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.checkSocials(), ms);
        // Initial check after a short delay
        setTimeout(() => this.checkSocials(), 10000);
    }

    async checkSocials() {
        if (mongoose.connection.readyState !== 1) {
            logger.warn('[Socials] Skipping checkSocials: Database not connected.');
            return;
        }
        try {
            // Only load guild configs that have at least one platform active
            const configs = await SocialConfig.find({
                $or: [
                    { 'platforms.twitch.enabled': true },
                    { 'platforms.youtube.enabled': true }
                ]
            });
            if (!configs.length) return;

            for (const config of configs) {
                const guild = this.client.guilds.cache.get(config.guildId);
                if (!guild) continue;

                let configChanged = false;

                // 1. Check Twitch
                if (config.platforms?.twitch?.enabled && config.platforms.twitch.accounts?.length > 0) {
                    const changed = await this.checkTwitch(guild, config.platforms.twitch);
                    if (changed) configChanged = true;
                }

                // 2. Check YouTube
                if (config.platforms?.youtube?.enabled && config.platforms.youtube.accounts?.length > 0) {
                    const changed = await this.checkYouTube(guild, config.platforms.youtube);
                    if (changed) configChanged = true;
                }

                // Save if any state changed
                if (configChanged) {
                    await config.save();
                }
            }
        } catch (error) {
            logger.error('[Socials] Error in checkSocials loop:', error);
        }
    }

    async checkTwitch(guild, platformConfig) {
        let changed = false;
        try {
            const usernames = platformConfig.accounts.map(s => s.username);
            const liveStreams = await getStreams(usernames);

            for (const streamer of platformConfig.accounts) {
                const stream = liveStreams.find(s => s.user_login.toLowerCase() === streamer.username.toLowerCase());
                
                if (stream) {
                    // Streamer is LIVE
                    if (!streamer.isLive || (stream.id !== streamer.lastPostId)) {
                        // NEW LIVE detected
                        await this.handleSocialPost(guild, platformConfig, streamer, {
                            title: stream.title,
                            url: `https://twitch.tv/${stream.user_login}`,
                            author: stream.user_name,
                            thumbnail: stream.thumbnail_url?.replace('{width}', '1280').replace('{height}', '720')
                        });
                        streamer.isLive = true;
                        streamer.lastPostId = stream.id;
                        changed = true;
                    }
                } else {
                    // Streamer is OFFLINE
                    if (streamer.isLive) {
                        // NEW OFF detected
                        streamer.isLive = false;
                        changed = true;
                        await this.removeSocialRole(guild, platformConfig, streamer);
                    }
                }
            }
        } catch (error) {
            logger.error(`[Socials/Twitch] Error checking guild ${guild.id}:`, error);
        }
        return changed;
    }

    async checkYouTube(guild, platformConfig) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                // Determine if input is a handle (@name) or channel ID
                let feedUrl = '';
                if (account.username.startsWith('@')) {
                    // Requires scraping or YouTube API v3 to get ID from handle. 
                    // Using a public RSS proxy or simply expecting standard ID format.
                    // For now, if it's not a standard UC... ID, we'll try standard user feed:
                    feedUrl = `https://www.youtube.com/feeds/videos.xml?user=${account.username.replace('@', '')}`;
                } else {
                    feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${account.username}`;
                }

                try {
                    // Timeout guard: don't let a slow feed hang the whole loop
                    const feed = await Promise.race([
                        rssParser.parseURL(feedUrl),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('RSS_TIMEOUT')), 5000)
                        )
                    ]);
                    if (feed && feed.items && feed.items.length > 0) {
                        const latestVideo = feed.items[0];
                        
                        if (latestVideo.id !== account.lastPostId) {
                            // NEW VIDEO detected
                            await this.handleSocialPost(guild, platformConfig, account, {
                                title: latestVideo.title,
                                url: latestVideo.link,
                                author: feed.title,
                                thumbnail: `https://i.ytimg.com/vi/${latestVideo.id.replace('yt:video:', '')}/maxresdefault.jpg`
                            });
                            account.lastPostId = latestVideo.id;
                            changed = true;
                        }
                    }
                } catch (feedErr) {
                    // If fetching fails for one user, skip to next
                    logger.warn(`[Socials/YouTube] Could not fetch feed for ${account.username}`);
                }
            }
        } catch (error) {
            logger.error(`[Socials/YouTube] Error checking guild ${guild.id}:`, error);
        }
        return changed;
    }

    async handleSocialPost(guild, platformConfig, account, postData) {
        try {
            logger.info(`[Socials] Sending notification for ${account.username} on guild ${guild.name}`);
            
            // 1. Send Notification
            const channel = guild.channels.cache.get(platformConfig.notificationChannelId);
            if (channel) {
                // Dynamically build embed using user's config
                const customEmbed = platformConfig.embed || {};
                
                const formatText = (text) => text
                    ? text.replace(/{streamer}/g, postData.author)
                          .replace(/{title}/g, postData.title)
                          .replace(/{url}/g, postData.url)
                    : '';

                const embedData = {
                    title: formatText(customEmbed.title),
                    description: formatText(customEmbed.description),
                    color: customEmbed.color ? parseInt(customEmbed.color.replace('#', ''), 16) : 0x6366f1,
                    footer: { text: formatText(customEmbed.footer) }
                };

                if (postData.thumbnail) {
                    embedData.image = { url: postData.thumbnail };
                }

                const content = platformConfig.mentionEveryone ? '@everyone' : (platformConfig.roleId ? `<@&${platformConfig.roleId}>` : null);
                
                await channel.send({ 
                    content, 
                    embeds: [embedData] 
                }).catch(err => {
                    logger.error(`[Socials] Failed to send notification in ${channel.id}:`, err.message);
                });
            }

            // 2. Add Role (if Twitch and user is linked)
            if (platformConfig.roleId && account.discordUserId) {
                const member = await guild.members.fetch(account.discordUserId).catch(() => null);
                if (member) {
                    await member.roles.add(platformConfig.roleId).catch(err => {
                        logger.error(`[Socials] Failed to add role to ${member.id}:`, err.message);
                    });
                }
            }
        } catch (error) {
            logger.error('[Socials] Error handling social post:', error);
        }
    }

    async removeSocialRole(guild, platformConfig, account) {
        try {
            if (platformConfig.roleId && account.discordUserId) {
                const member = await guild.members.fetch(account.discordUserId).catch(() => null);
                if (member) {
                    await member.roles.remove(platformConfig.roleId).catch(err => {
                        logger.error(`[Socials] Failed to remove role from ${member.id}:`, err.message);
                    });
                }
            }
        } catch (error) {
            logger.error('[Socials] Error removing social role:', error);
        }
    }
}
