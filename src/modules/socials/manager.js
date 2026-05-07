import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import mongoose from 'mongoose';
import SocialConfig from '../../models/SocialConfig.js';
import GlobalConfig from '../../models/GlobalConfig.js';
import { getStreams, getUsers } from '../../utils/twitchHelper.js';
import logger from '../../utils/logger.js';
import messageService from '../../utils/messageService.js';
import placeholderHelper from '../../utils/placeholderHelper.js';
import Parser from 'rss-parser';
import Guild from '../../models/Guild.js';
import { t } from '../../locales/t.js';

import axios from 'axios';

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

                // --- MULTI-BOT PROTECTION ---
                if (this.client.multiBotManager && !this.client.multiBotManager.shouldHandle(guildId, this.client)) {
                    continue;
                }

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
                    const changed = await this.checkGenericRSS(guildId, config.platforms.twitter, 'Twitter', 'http://localhost:3005/?action=display&bridge=TwitterBridge&context=By+username&u={username}&format=Mrss');
                    if (changed) configChanged = true;
                }

                // 4. Check Instagram
                if (config.platforms?.instagram?.enabled && config.platforms.instagram.accounts?.length > 0) {
                    const changed = await this.checkGenericRSS(guildId, config.platforms.instagram, 'Instagram', 'http://localhost:3005/?action=display&bridge=InstagramBridge&context=Username&u={username}&format=Mrss');
                    if (changed) configChanged = true;
                }

                // 5. Check TikTok
                if (config.platforms?.tiktok?.enabled && config.platforms.tiktok.accounts?.length > 0) {
                    const changed = await this.checkGenericRSS(guildId, config.platforms.tiktok, 'TikTok', 'http://localhost:3005/?action=display&bridge=TikTokBridge&context=By+user&username={username}&format=Mrss');
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

                let feedUrl = '';
                if (username.startsWith('UC')) {
                    feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${username}`;
                } else {
                    // Try to resolve handle (@username) to Channel ID
                    const channelId = await this.resolveYouTubeHandle(username);
                    if (channelId) {
                        feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
                        // Optionally update account.username to the resolved ID for faster subsequent checks
                        // account.username = channelId; 
                    } else {
                        // Fallback to legacy username format
                        const cleanUsername = username.replace('@', '');
                        feedUrl = `https://www.youtube.com/feeds/videos.xml?user=${cleanUsername}`;
                    }
                }

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

                // Strip leading @ if present (common for TikTok/Instagram)
                if (username.startsWith('@')) {
                    username = username.substring(1);
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
                            // 1. Filter out RSS-Bridge errors (Twitter/Instagram blocks)
                            const title = latestItem.title || '';
                            const errorKeywords = ['404', 'Bridge Error', 'HttpException', 'Not Found', 'Rate limit', 'Details:'];
                            if (errorKeywords.some(kw => title.includes(kw))) {
                                logger.debug(`[Socials/${platformName}] Skipping item due to potential error: ${title}`);
                                continue;
                            }

                            // 2. Extract thumbnail more aggressively
                            let thumbnail = latestItem.enclosure?.url || latestItem.thumbnail || '';
                            
                            // Check media fields if available
                            if (!thumbnail && latestItem['media:content']) {
                                thumbnail = Array.isArray(latestItem['media:content']) 
                                    ? latestItem['media:content'][0]?.$.url 
                                    : latestItem['media:content']?.$.url;
                            }

                            if (!thumbnail) {
                                const content = latestItem.content || latestItem.contentSnippet || '';
                                // Support both double and single quotes in img src, and handle potential data-src
                                const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i) || content.match(/<img[^>]+data-src=["']([^"']+)["']/i);
                                if (imgMatch) thumbnail = imgMatch[1];
                            }
                            
                            // Last resort for Instagram: if we have a link, try to use a proxy for the image if it's missing
                            if (!thumbnail && platformName === 'Instagram' && latestItem.link) {
                                // Some bridges provide the image URL in the link if optimized
                                if (latestItem.link.includes('ddinstagram.com')) {
                                    thumbnail = latestItem.link.replace('ddinstagram.com', 'ddinstagram.com/images'); // Just a guess, but let's stick to extraction
                                }
                            }

                            await this.handleSocialPost(guildId, platformConfig, account, {
                                title: latestItem.title || 'Nuovo post!',
                                url: latestItem.link,
                                author: feed.title || username,
                                description: latestItem.contentSnippet || latestItem.content?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
                                thumbnail: thumbnail
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

            const guildConfig = await GlobalConfig.findOne({ guildId });
            const lang = guildConfig?.language || 'en';

            const channelId = platformConfig.notificationChannelId;
            if (!channelId) return;

            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (!channel) {
                logger.warn(`[Socials] Notification channel ${channelId} not found in guild ${guildId}.`);
                return;
            }

            // Dynamically build embed using user's config
            const customEmbed = platformConfig.embed || {};

            // Optimize URL for preview/shareability
            let optimizedUrl = postData.url || '';
            if (optimizedUrl.includes('twitter.com')) optimizedUrl = optimizedUrl.replace('twitter.com', 'fxtwitter.com');
            else if (optimizedUrl.includes('x.com')) optimizedUrl = optimizedUrl.replace('x.com', 'fxtwitter.com');
            else if (optimizedUrl.includes('instagram.com')) optimizedUrl = optimizedUrl.replace('instagram.com', 'ddinstagram.com');

            const formatText = (text) => text
                ? placeholderHelper.replace(text, {
                    streamer: postData.author || account.username,
                    title: postData.title,
                    url: optimizedUrl,
                    description: (postData.description || '')
                        .replace(/Vedi su Instagram/gi, '')
                        .replace(/Guarda il TikTok/gi, '')
                        .replace(/Guarda ora/gi, '')
                        .trim()
                })
                : '';

            // Default titles and descriptions based on platform
            const defaultTitles = {
                'Twitch': `📡 {streamer} è in diretta!`,
                'YouTube': `🎥 Nuovo video di {streamer}!`,
                'Twitter': `🐦 Nuovo Tweet di {streamer}`,
                'Instagram': `📸 Nuovo post di {streamer}`,
                'TikTok': `🎵 Nuovo TikTok di {streamer}`
            };

            const defaultDescs = {
                'Twitch': `### {title}\n\nEhi! **{streamer}** ha appena acceso la camera su Twitch. Non perderti lo show!\n\n[Entra in Live]({url})`,
                'YouTube': `### {title}\n\nÈ appena uscito un nuovo video sul canale! Corri a lasciare un like.`,
                'Twitter': `{description}`,
                'Instagram': `### {title}\n\nNuovo contenuto caricato su Instagram! Passa a dare un'occhiata.`,
                'TikTok': `### {title}\n\nÈ appena stato pubblicato un nuovo video su TikTok! Guarda subito.`
            };

            // Default settings based on platform (Verified Icons8 CDN)
            const platformStyles = {
                'Twitch': { color: 0x6441a5, icon: 'https://img.icons8.com/color/512/twitch.png', label: 'Twitch Live' },
                'YouTube': { color: 0xff0000, icon: 'https://img.icons8.com/color/512/youtube-play.png', label: 'YouTube Video' },
                'Twitter': { color: 0x1da1f2, icon: 'https://img.icons8.com/color/512/twitter--v1.png', label: 'Twitter (X)' },
                'Instagram': { color: 0xe1306c, icon: 'https://img.icons8.com/color/512/instagram-new--v1.png', label: 'Instagram' },
                'TikTok': { color: 0x000000, icon: 'https://img.icons8.com/color/512/tiktok.png', label: 'TikTok' }
            };

            const style = platformStyles[platform] || { color: 0x7289da, icon: '', label: platform };

            // Clean up author name (strip " - Instagram" etc)
            let authorName = postData.author || account.username;
            if (authorName.includes(' - ')) authorName = authorName.split(' - ')[0];
            if (authorName.includes(' | ')) authorName = authorName.split(' | ')[0];

            const embedData = new EmbedBuilder()
                .setTitle(formatText(customEmbed.title) || formatText(defaultTitles[platform]) || 'Nuovo post!')
                .setURL(optimizedUrl)
                .setDescription(formatText(customEmbed.description) || formatText(defaultDescs[platform]) || postData.description || postData.title)
                .setColor(customEmbed.color ? parseInt(customEmbed.color.replace('#', ''), 16) : style.color)
                .setTimestamp()
                .setFooter({ 
                    text: formatText(customEmbed.footer) || 'Social Notifications | Verix', 
                    iconURL: this.client.user.displayAvatarURL() 
                });

            embedData.setAuthor({ 
                name: style.label, 
                iconURL: style.icon || guild.iconURL() 
            });

            // For Instagram, we keep the icon in thumbnail as well as it looks premium
            if (style.icon) {
                embedData.setThumbnail(style.icon);
            }

            if (postData.thumbnail) {
                embedData.setImage(postData.thumbnail);
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

    async resolveYouTubeHandle(handle) {
        try {
            const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
            const url = `https://www.youtube.com/${cleanHandle}`;
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            // Regex to find "channelId":"UC..."
            const match = response.data.match(/\"channelId\":\"(UC[a-zA-Z0-9_-]+)\"/);
            if (match && match[1]) {
                logger.info(`[YouTubeResolver] Resolved ${handle} to ${match[1]}`);
                return match[1];
            }
            return null;
        } catch (error) {
            logger.debug(`[YouTubeResolver] Failed to resolve handle ${handle}: ${error.message}`);
            return null;
        }
    }
}
