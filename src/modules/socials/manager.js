import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import mongoose from 'mongoose';
import SocialConfig from '../../models/SocialConfig.js';
import { getStreams, getUsers } from '../../utils/twitchHelper.js';
import logger from '../../utils/logger.js';
import messageService from '../../utils/messageService.js';
import placeholderHelper from '../../utils/placeholderHelper.js';
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
            // Find all configs that have at least one platform enabled
            const configs = await SocialConfig.find({});
            if (!configs.length) return;

            for (const config of configs) {
                const guildId = config.guildId;
                let configChanged = false;

                // 1. Check Twitch
                if (config.platforms?.twitch?.enabled && config.platforms.twitch.accounts?.length > 0) {
                    const platformConfig = config.platforms.twitch;
                    const usernames = platformConfig.accounts.map(s => s.username);
                    logger.debug(`[Socials/Twitch] Checking ${usernames.length} streamers for guild ${guildId}: ${usernames.join(', ')}`);
                    
                    const liveStreams = await getStreams(usernames);
                    const userData = await getUsers(usernames) || []; // Default to empty if API fails

                    if (liveStreams === null) {
                        logger.warn(`[Socials/Twitch] API error for guild ${guildId}, skipping this check.`);
                        continue;
                    }
                    
                    logger.debug(`[Socials/Twitch] Found ${liveStreams.length} live streams.`);

                    const changed = await this.checkTwitch(guildId, platformConfig, liveStreams, userData);
                    if (changed) configChanged = true;
                }

                // 2. Check YouTube
                if (config.platforms?.youtube?.enabled && config.platforms.youtube.accounts?.length > 0) {
                    const changed = await this.checkYouTube(guildId, config.platforms.youtube);
                    if (changed) configChanged = true;
                }

                // 3. Check Twitter (X)
                if (config.platforms?.twitter?.enabled && config.platforms.twitter.accounts?.length > 0) {
                    const changed = await this.checkGenericRSS(guildId, config.platforms.twitter, 'Twitter', 'https://nitter.poast.org/{username}/rss');
                    if (changed) configChanged = true;
                }

                // 4. Check Instagram
                if (config.platforms?.instagram?.enabled && config.platforms.instagram.accounts?.length > 0) {
                    const changed = await this.checkGenericRSS(guildId, config.platforms.instagram, 'Instagram', 'https://rssbridge.io/?action=display&bridge=Instagram&u={username}&format=Mrss');
                    if (changed) configChanged = true;
                }

                // 5. Check TikTok
                if (config.platforms?.tiktok?.enabled && config.platforms.tiktok.accounts?.length > 0) {
                    const changed = await this.checkGenericRSS(guildId, config.platforms.tiktok, 'TikTok', 'https://rssbridge.io/?action=display&bridge=TikTokUser&u={username}&format=Mrss');
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

    async checkTwitch(guildId, platformConfig, liveStreams, userData = []) {
        if (!liveStreams) return false;
        let changed = false;
        try {
            for (const streamer of platformConfig.accounts) {
                const cleanName = (streamer.username || '').includes('twitch.tv/') 
                    ? streamer.username.split('/').pop().split('?')[0].toLowerCase()
                    : (streamer.username || '').toLowerCase();

                const stream = liveStreams.find(s => s.user_login.toLowerCase() === cleanName);
                const user = userData.find(u => u.login.toLowerCase() === cleanName);
                
                if (stream) {
                    // Streamer is LIVE
                    if (!streamer.isLive || (stream.id !== streamer.lastPostId)) {
                        // NEW LIVE detected
                        await this.handleSocialPost(guildId, platformConfig, streamer, {
                            title: stream.title,
                            url: `https://twitch.tv/${stream.user_login}`,
                            author: stream.user_name,
                            thumbnail: stream.thumbnail_url?.replace('{width}', '1280').replace('{height}', '720'),
                            profileImage: user?.profile_image_url
                        }, 'Twitch');
                        streamer.isLive = true;
                        streamer.lastPostId = stream.id;
                        changed = true;
                    } else if (platformConfig.liveRoleId && streamer.discordUserId) {
                        // ALREADY LIVE but maybe newly linked or bot restart
                        await this.ensureSocialRole(guildId, platformConfig.liveRoleId, streamer.discordUserId);
                    }
                } else {
                    // Streamer is OFFLINE
                    if (streamer.isLive) {
                        // NEW OFF detected
                        logger.info(`[Socials/Twitch] ${streamer.username} went offline in guild ${guildId}.`);
                        streamer.isLive = false;
                        changed = true;
                    }
                    
                    // Self-healing: Always ensure role is removed if streamer is offline
                    if (platformConfig.liveRoleId && streamer.discordUserId) {
                        await this.removeSocialRole(guildId, platformConfig, streamer);
                    }
                }
            }
        } catch (error) {
            logger.error(`[Socials/Twitch] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    async checkYouTube(guildId, platformConfig) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                let username = account.username || '';
                if (username.includes('youtube.com/')) {
                    username = username.split('/').pop().split('?')[0];
                }

                let feedUrl = username.startsWith('@') 
                    ? `https://www.youtube.com/feeds/videos.xml?user=${username.replace('@', '')}`
                    : `https://www.youtube.com/feeds/videos.xml?channel_id=${username}`;

                try {
                    const feed = await rssParser.parseURL(feedUrl);
                    if (feed && feed.items && feed.items.length > 0) {
                        const latestVideo = feed.items[0];
                        
                        if (latestVideo.id !== account.lastPostId) {
                            // NEW VIDEO detected
                            await this.handleSocialPost(guildId, platformConfig, account, {
                                title: latestVideo.title,
                                url: latestVideo.link,
                                author: feed.title,
                                thumbnail: `https://i.ytimg.com/vi/${latestVideo.id.replace('yt:video:', '')}/maxresdefault.jpg`
                            }, 'YouTube');
                            account.lastPostId = latestVideo.id;
                            changed = true;
                        }
                    }
                } catch (feedErr) {
                    logger.warn(`[Socials/YouTube] Could not fetch feed for ${account.username}`);
                }
            }
        } catch (error) {
            logger.error(`[Socials/YouTube] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    async checkGenericRSS(guildId, platformConfig, platformName, urlTemplate) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                let username = account.username || '';
                // Extract username if a full URL was provided
                if (username.includes('.com/')) {
                    username = username.split('/').filter(p => p && !p.includes('.com')).pop().split('?')[0];
                }

                const feedUrl = urlTemplate.replace('{username}', username);

                try {
                    const feed = await rssParser.parseURL(feedUrl);
                    if (feed && feed.items && feed.items.length > 0) {
                        const latestItem = feed.items[0];
                        
                        // ID comparison to avoid duplicates
                        const itemId = latestItem.id || latestItem.guid || latestItem.link;

                        if (itemId !== account.lastPostId) {
                            // NEW POST detected
                            logger.info(`[Socials/${platformName}] New post detected for ${username} in ${guildId}`);
                            
                            await this.handleSocialPost(guildId, platformConfig, account, {
                                title: latestItem.title || 'Nuovo post!',
                                url: latestItem.link,
                                author: feed.title || username,
                                description: latestItem.contentSnippet || latestItem.content || '',
                                thumbnail: latestItem.enclosure?.url || ''
                            }, platformName);

                            account.lastPostId = itemId;
                            changed = true;
                        }
                    }
                } catch (feedErr) {
                    logger.debug(`[Socials/${platformName}] Could not fetch feed for ${username} (${feedUrl}): ${feedErr.message}`);
                }
            }
        } catch (error) {
            logger.error(`[Socials/${platformName}] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    async handleSocialPost(guildId, platformConfig, account, postData, platform) {
        try {
            const guild = await this.client.guilds.fetch(guildId).catch(() => null);
            if (!guild) {
                logger.warn(`[Socials] Guild ${guildId} not found during notification.`);
                return;
            }

            const channelId = platformConfig.notificationChannelId;
            if (!channelId) return;

            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (!channel) {
                logger.warn(`[Socials] Notification channel ${channelId} not found in guild ${guildId}.`);
                return;
            }

            logger.info(`[Socials] Sending ${platform} notification for ${postData.author || account.username} to #${channel.name}`);
            
            // Dynamically build embed using user's config
            const customEmbed = platformConfig.embed || {};
            
            const formatText = (text) => text
                ? placeholderHelper.replace(text, {
                    streamer: postData.author || account.username,
                    title: postData.title,
                    url: postData.url,
                    description: postData.description || ''
                })
                : '';

            // Default titles and descriptions based on platform
            const defaultTitles = {
                'Twitch': `📡 ${postData.author || account.username} è in diretta!`,
                'YouTube': `🎥 Nuovo video di ${postData.author || account.username}!`,
                'Twitter': `🐦 Nuovo Tweet di ${postData.author || account.username}`,
                'Instagram': `📸 Nuovo post di ${postData.author || account.username}`,
                'TikTok': `🎵 Nuovo TikTok di ${postData.author || account.username}`
            };

            const defaultDescs = {
                'Twitch': `### ${postData.title}\n\nEhi! **${postData.author || account.username}** ha appena acceso la camera su Twitch. Non perderti lo show!`,
                'YouTube': `### ${postData.title}\n\nÈ appena uscito un nuovo video sul canale! Corri a lasciare un like.`,
                'Twitter': `${postData.description || postData.title}`,
                'Instagram': `### ${postData.title}\n\nNuovo contenuto caricato su Instagram! Passa a dare un'occhiata.`,
                'TikTok': `### ${postData.title}\n\nÈ appena stato pubblicato un nuovo video su TikTok! Guarda subito.`
            };

            const defaultColors = {
                'Twitch': 0x6441a5,
                'YouTube': 0xff0000,
                'Twitter': 0x1da1f2,
                'Instagram': 0xe1306c,
                'TikTok': 0x000000
            };

            const embedData = {
                title: formatText(customEmbed.title) || defaultTitles[platform] || 'Nuovo post!',
                url: postData.url,
                description: formatText(customEmbed.description) || defaultDescs[platform] || postData.title,
                color: customEmbed.color ? parseInt(customEmbed.color.replace('#', ''), 16) : (defaultColors[platform] || 0xffffff),
                footer: { text: formatText(customEmbed.footer) || 'Social Notifications | Verix' }
            };

            if (postData.profileImage) {
                embedData.thumbnail = { url: postData.profileImage };
            }

            if (postData.thumbnail) {
                embedData.image = { url: postData.thumbnail };
            }

            const buttonLabels = {
                'Twitch': 'Guarda la Live',
                'YouTube': 'Guarda il Video',
                'Twitter': 'Leggi il Tweet',
                'Instagram': 'Vedi il Post',
                'TikTok': 'Guarda il TikTok'
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(buttonLabels[platform] || 'Apri Link')
                        .setStyle(ButtonStyle.Link)
                        .setURL(postData.url)
                );

            const content = platformConfig.mentionEveryone ? '@everyone' : (platformConfig.roleId ? `<@&${platformConfig.roleId}>` : null);
            
            await channel.send({ 
                content, 
                embeds: [embedData],
                components: [row]
            }).catch(err => {
                logger.error(`[Socials] Failed to send notification in ${channel.id}:`, err.message);
            });

            // 2. Add Role (if Twitch and user is linked)
            if (platformConfig.liveRoleId && account.discordUserId) {
                await this.ensureSocialRole(guildId, platformConfig.liveRoleId, account.discordUserId);
            }
        } catch (error) {
            logger.error('[Socials] Error handling social post:', error);
        }
    }

    async ensureSocialRole(guildId, roleId, userId) {
        try {
            const guild = await this.client.guilds.fetch(guildId).catch(() => null);
            if (!guild) return;

            const member = await guild.members.fetch(userId).catch(() => null);
            if (member && !member.roles.cache.has(roleId)) {
                await member.roles.add(roleId).catch(err => {
                    logger.error(`[Socials] Failed to add role to ${member.id}:`, err.message);
                });
            }
        } catch (error) {
            logger.error('[Socials] Error ensuring social role:', error);
        }
    }

    async removeSocialRole(guildId, platformConfig, account) {
        try {
            const guild = await this.client.guilds.fetch(guildId).catch(() => null);
            if (!guild) return;

            if (platformConfig.liveRoleId && account.discordUserId) {
                const member = await guild.members.fetch(account.discordUserId).catch(() => null);
                if (member && member.roles.cache.has(platformConfig.liveRoleId)) {
                    logger.info(`[Socials] Removing live role from ${member.user.tag} (${member.id}) in guild ${guild.name}`);
                    await member.roles.remove(platformConfig.liveRoleId).catch(err => {
                        logger.error(`[Socials] Failed to remove role from ${member.id}:`, err.message);
                    });
                }
            }
        } catch (error) {
            logger.error('[Socials] Error removing social role:', error);
        }
    }
}
