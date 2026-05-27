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
import { axiosWithRetry } from '../../utils/httpClient.js';
import { applyBrandingToFooter } from '../../utils/embedHelper.js';

const rssParser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['media:group', 'mediaGroup']
        ]
    }
});
const BRIDGE_ERROR_LOG_INTERVAL_MS = 60 * 60 * 1000;
const BRIDGE_ERROR_BASE_BACKOFF_MS = 5 * 60 * 1000;
const BRIDGE_ERROR_MAX_BACKOFF_MS = 30 * 60 * 1000;
const BRIDGE_ERROR_KEYWORDS = [
    '404',
    'bridge error',
    'bridge returned error',
    'httpexception',
    'not found',
    'rate limit',
    'too many requests',
    'details:'
];
const RSS_BRIDGE_INSTANCES = [
    'http://localhost:3005',
    'https://rss-bridge.org/bridge01',
    'https://rssbridge.noblogs.org',
    'https://rss-bridge.sans-nuage.fr',
    'https://rss-bridge.cheredeprince.net'
];
const RSS_TIMEOUT_MS = 8000;
const TWITTER_NATIVE_TIMEOUT_MS = 10000;
const TWITTER_NATIVE_MIN_CHECK_MS = 15 * 60 * 1000;
const WEB_SUB_TIMEOUT_MS = 8000;
const YOUTUBE_RESOLVE_TIMEOUT_MS = 7000;
const SOCIAL_SEEN_HISTORY_LIMIT = 100;
const SOCIAL_RECENT_WINDOW_MS = 48 * 60 * 60 * 1000;

async function parseRssUrl(url) {
    const response = await axiosWithRetry({
        method: 'GET',
        url,
        responseType: 'text',
        headers: {
            'User-Agent': 'VerixBot/1.0 (+https://verixbot.com)'
        },
        timeout: RSS_TIMEOUT_MS
    });
    const xml = String(response.data || '');
    try {
        return await rssParser.parseString(xml);
    } catch (error) {
        if (!/Invalid character in entity name/i.test(error.message || '')) {
            throw error;
        }

        const sanitizedXml = xml.replace(/&(?!#\d+;|#x[\da-fA-F]+;|[a-zA-Z][a-zA-Z\d]+;)/g, '&amp;');
        return rssParser.parseString(sanitizedXml);
    }
}

export class SocialManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
        this.webSubInterval = null;
        this.isChecking = false;
        this.youtubeIdCache = new Map();
        this.youtubeAvatarCache = new Map();
    }

    init() {
        logger.info('[Socials] Manager initialized.');
        this.start(180000); // Poll every 3 minutes
    }

    start(ms) {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.checkSocials(), ms);

        // Initial check after a short delay
        setTimeout(() => {
            this.checkSocials();
            this.maintainWebSubSubscriptions();
        }, 10000);

        // Maintain WebSub subscriptions every 24 hours
        if (this.webSubInterval) clearInterval(this.webSubInterval);
        this.webSubInterval = setInterval(() => this.maintainWebSubSubscriptions(), 24 * 60 * 60 * 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.webSubInterval) {
            clearInterval(this.webSubInterval);
            this.webSubInterval = null;
        }
    }

    async checkSocials() {
        if (this.isChecking) {
            logger.debug('[Socials] Previous check still running, skipping overlapping cycle.');
            return;
        }
        if (mongoose.connection.readyState !== 1) {
            logger.warn('[Socials] Skipping checkSocials: Database not connected.');
            return;
        }
        this.isChecking = true;
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
                    const changed = await this.checkTwitterNative(guildId, config.platforms.twitter);
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

                // 6. Check Reddit
                if (config.platforms?.reddit?.enabled && config.platforms.reddit.accounts?.length > 0) {
                    const changed = await this.checkReddit(guildId, config.platforms.reddit);
                    if (changed) configChanged = true;
                }

                // 7. Check Steam
                if (config.platforms?.steam?.enabled && config.platforms.steam.accounts?.length > 0) {
                    const changed = await this.checkSteam(guildId, config.platforms.steam);
                    if (changed) configChanged = true;
                }

                // 8. Check Kick
                if (config.platforms?.kick?.enabled && config.platforms.kick.accounts?.length > 0) {
                    const changed = await this.checkKick(guildId, config.platforms.kick);
                    if (changed) configChanged = true;
                }

                // 9. Check GitHub
                if (config.platforms?.github?.enabled && config.platforms.github.accounts?.length > 0) {
                    const changed = await this.checkGitHub(guildId, config.platforms.github);
                    if (changed) configChanged = true;
                }

                // 10. Check custom RSS feeds
                if (config.platforms?.rss?.enabled && config.platforms.rss.accounts?.length > 0) {
                    const changed = await this.checkCustomRSS(guildId, config.platforms.rss);
                    if (changed) configChanged = true;
                }

                // 11. Check Telegram channels
                if (config.platforms?.telegram?.enabled && config.platforms.telegram.accounts?.length > 0) {
                    const changed = await this.checkTelegram(guildId, config.platforms.telegram);
                    if (changed) configChanged = true;
                }

                // Save if any state changed
                if (configChanged) {
                    await config.save();
                }
            }
        } catch (error) {
            logger.error('[Socials] Error in checkSocials loop:', error);
        } finally {
            this.isChecking = false;
        }
    }

    getPostId(item) {
        const rawId = item?.id || item?.guid || item?.link || null;
        if (!rawId) return null;

        const value = String(rawId).trim();
        const ytMatch = value.match(/(?:yt:video:|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (ytMatch) return `yt:video:${ytMatch[1]}`;

        try {
            const parsed = new URL(value);
            parsed.hash = '';
            for (const key of [...parsed.searchParams.keys()]) {
                if (/^(utm_|fbclid|gclid|igshid|si$|feature$)/i.test(key)) {
                    parsed.searchParams.delete(key);
                }
            }
            return parsed.toString().replace(/\/$/, '');
        } catch {
            return value;
        }
    }

    getPostTime(item) {
        const value = item?.isoDate || item?.pubDate || item?.published || item?.updated;
        const time = value ? new Date(value).getTime() : 0;
        return Number.isFinite(time) ? time : 0;
    }

    isRecentPost(item) {
        const pubTime = this.getPostTime(item);
        return !pubTime || (Date.now() - pubTime < SOCIAL_RECENT_WINDOW_MS);
    }

    ensureSeenState(account) {
        if (!Array.isArray(account.seenPostIds)) {
            account.seenPostIds = [];
            return true;
        }
        return false;
    }

    rememberSeen(account, ids) {
        const current = Array.isArray(account.seenPostIds) ? account.seenPostIds : [];
        let changed = false;
        for (const id of ids.filter(Boolean)) {
            if (!current.includes(id)) {
                current.push(id);
                changed = true;
            }
        }
        while (current.length > SOCIAL_SEEN_HISTORY_LIMIT) {
            current.shift();
            changed = true;
        }
        account.seenPostIds = current;
        return changed;
    }

    getLatestUnseenItem(account, items) {
        const feedItems = Array.isArray(items) ? items : [];
        const seen = new Set(account.seenPostIds || []);
        return feedItems.find(item => {
            const id = this.getPostId(item);
            return id && id !== account.lastPostId && !seen.has(id) && this.isRecentPost(item);
        }) || null;
    }

    extractThumbnail(item) {
        let thumbnail = item.enclosure?.url || item.thumbnail || '';

        if (!thumbnail) {
            const mContent = item.mediaContent || item['media:content'];
            if (mContent) {
                thumbnail = Array.isArray(mContent) ? mContent[0]?.$.url : mContent?.$.url;
            }
        }

        if (!thumbnail) {
            const mThumbnail = item.mediaThumbnail || item['media:thumbnail'];
            if (mThumbnail) {
                thumbnail = Array.isArray(mThumbnail) ? mThumbnail[0]?.$.url : mThumbnail?.$.url;
            }
        }

        if (!thumbnail) {
            const mGroup = item.mediaGroup || item['media:group'];
            if (mGroup) {
                const media = mGroup.mediaContent || mGroup['media:content'] || mGroup.mediaThumbnail || mGroup['media:thumbnail'];
                if (media) {
                    thumbnail = Array.isArray(media) ? media[0]?.$.url : media?.$.url;
                }
            }
        }

        if (!thumbnail) {
            const content = item.content || item.contentSnippet || '';
            const imgMatch = content.match(/<img[^>]+(?:src|data-src|original-src)=["']([^"']+)["']/i);
            if (imgMatch) thumbnail = imgMatch[1];
        }

        if (!thumbnail) {
            const content = item.content || item['content:encoded'] || item.summary || '';
            const ogMatch = content.match(/(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i);
            if (ogMatch) thumbnail = ogMatch[1];
        }

        if (!thumbnail && item.link) {
            if (item.link.includes('instagram.com')) {
                thumbnail = item.link.replace('instagram.com', 'ddinstagram.com').replace('/p/', '/p/show/').replace('/reel/', '/reel/show/');
            } else if (item.link.includes('twitter.com') || item.link.includes('x.com')) {
                thumbnail = item.link.replace(/(twitter\.com|x\.com)/, 'fixupx.com').replace('/status/', '/status/show/');
            }
        }

        return this.normalizeImageUrl(thumbnail);
    }

    normalizeImageUrl(value = '') {
        let url = String(value || '').trim();
        if (!url) return '';
        url = this.decodeHtmlEntities(url);
        if (url.startsWith('//')) url = `https:${url}`;
        if (!/^https?:\/\//i.test(url)) return '';
        return url;
    }

    async checkTwitch(guildId, platformConfig, liveStreams, userData = []) {
        if (!liveStreams) return false;
        let changed = false;
        try {
            for (const streamer of platformConfig.accounts) {
                const cleanName = (streamer.username || '').includes('twitch.tv/')
                    ? streamer.username.split('/').pop().split('?')[0].toLowerCase()
                    : (streamer.username || '').toLowerCase();
                streamer.lastCheckAt = new Date();
                changed = true;

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
                            profileImage: user?.profile_image_url || `https://static-cdn.jtvnw.net/jtv_user_pictures/${cleanName}-profile_image-300x300.png`
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
                account.lastCheckAt = new Date();
                changed = true;

                if (username.includes('youtube.com/')) {
                    username = username.split('/').pop().split('?')[0];
                }
                if (!username) continue;
                if (this.isBridgeBackoffActive(account)) continue;

                let feedUrl = '';
                if (username.startsWith('UC')) {
                    feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${username}`;
                } else {
                    // Try to resolve handle (@username) to Channel ID via persistent/in-memory cache or API
                    let channelId = account.resolvedId;
                    if (!channelId && this.youtubeIdCache && this.youtubeIdCache.has(username)) {
                        channelId = this.youtubeIdCache.get(username);
                    }

                    if (!channelId) {
                        channelId = await this.resolveYouTubeHandle(username);
                        if (channelId) {
                            account.resolvedId = channelId;
                            if (this.youtubeIdCache) this.youtubeIdCache.set(username, channelId);
                            changed = true;
                        }
                    }

                    if (channelId) {
                        feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
                    } else {
                        // Fallback to legacy username format or direct handle search
                        const cleanUsername = username.replace('@', '');
                        feedUrl = `https://www.youtube.com/feeds/videos.xml?user=${cleanUsername}`;
                    }
                }

                try {
                    const feed = await parseRssUrl(feedUrl);
                    if (feed && feed.items && feed.items.length > 0) {
                        if (this.ensureSeenState(account)) changed = true;
                        if (account.lastPostId && account.seenPostIds.length === 0) {
                            account.seenPostIds.push(account.lastPostId);
                            changed = true;
                        }

                        const feedIds = feed.items.map(item => this.getPostId(item)).filter(Boolean);

                        if (!account.lastPostId) {
                            const latestVideo = feed.items[0];
                            const latestId = this.getPostId(latestVideo);
                            logger.info(`[Socials/YouTube] Initialized lastPostId for ${account.username} to ${latestId} without notification`);
                            account.lastPostId = latestId;
                            account.seenPostIds = feedIds;
                            changed = true;
                            continue;
                        }

                        const latestUnseen = this.getLatestUnseenItem(account, feed.items);
                        if (latestUnseen) {
                            const latestUnseenId = this.getPostId(latestUnseen);
                            if (!account.cachedProfileImage) {
                                account.cachedProfileImage = await this.fetchYouTubeProfileImage(username);
                            }

                            const videoId = latestUnseenId.replace('yt:video:', '');
                            logger.info(`[Socials/YouTube] New video detected: ${latestUnseen.title} (${latestUnseenId}) for guild ${guildId}`);

                            await this.handleSocialPost(guildId, platformConfig, account, {
                                title: latestUnseen.title,
                                url: latestUnseen.link,
                                author: feed.title,
                                thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                                profileImage: account.cachedProfileImage
                            }, 'YouTube');

                            account.lastPostId = latestUnseenId;
                            changed = true;
                        }

                        if (this.rememberSeen(account, feedIds)) changed = true;
                        if (this.clearBridgeErrorState(account)) changed = true;
                    }
                } catch (feedErr) {
                    if (this.recordBridgeError(account, 'YouTube', account.username, feedErr.message)) changed = true;
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
                let username = (account.username || '').trim();
                account.lastCheckAt = new Date();
                changed = true;

                // Extract username if a full URL was provided
                if (username.includes('.com/')) {
                    username = username.split('/').filter(p => p && !p.includes('.com')).pop().split('?')[0];
                }

                // Strip leading @ if present (common for TikTok/Instagram)
                if (username.startsWith('@')) {
                    username = username.substring(1);
                }

                if (!username) continue;

                if (this.isBridgeBackoffActive(account)) {
                    continue;
                }

                const feedUrl = urlTemplate.replace('{username}', username);
                const queryIndex = feedUrl.indexOf('?');
                const queryString = queryIndex !== -1 ? feedUrl.substring(queryIndex) : '';

                try {
                    let feed = null;
                    let lastError = null;

                    // Dynamic RSS-Bridge Failover Loop
                    for (const instance of RSS_BRIDGE_INSTANCES) {
                        const finalFeedUrl = queryIndex !== -1 ? `${instance}${queryString}` : feedUrl;
                        try {
                            feed = await parseRssUrl(finalFeedUrl);
                            if (feed && feed.items && feed.items.length > 0) {
                                break;
                            }
                        } catch (err) {
                            lastError = err;
                            logger.debug(`[Socials/Bridge] Failover: ${instance} failed for ${username}: ${err.message}`);
                        }
                    }

                    if (!feed) {
                        throw new Error(lastError ? lastError.message : 'All RSS-Bridge instances failed');
                    }

                    if (feed && feed.items && feed.items.length > 0) {
                        if (this.ensureSeenState(account)) changed = true;
                        if (account.lastPostId && account.seenPostIds.length === 0) {
                            account.seenPostIds.push(account.lastPostId);
                            changed = true;
                        }

                        const feedIds = feed.items.map(item => this.getPostId(item)).filter(Boolean);
                        const latestItem = feed.items[0];

                        if (this.isBridgeErrorItem(latestItem)) {
                            if (this.recordBridgeError(account, platformName, username, latestItem.title)) {
                                changed = true;
                            }
                            continue;
                        }

                        if (this.clearBridgeErrorState(account)) {
                            changed = true;
                        }

                        if (!account.lastPostId) {
                            const latestId = this.getPostId(latestItem);
                            logger.info(`[Socials/${platformName}] Initialized lastPostId for ${username} to ${latestId} without notification`);
                            account.lastPostId = latestId;
                            account.seenPostIds = feedIds;
                            changed = true;
                            continue;
                        }

                        const item = this.getLatestUnseenItem(account, feed.items);
                        if (item) {
                            const itemId = this.getPostId(item);
                            let thumbnail = this.extractThumbnail(item, platformName);

                            if (!thumbnail) {
                                logger.debug(`[Socials/${platformName}] Could not find thumbnail for item: ${item.title}`);
                            }

                            const isVideo = item.enclosure?.type?.includes('video') ||
                                          item.content?.includes('<video') ||
                                          item.link?.includes('/video/') ||
                                          item.title?.toLowerCase().includes('video') ||
                                          item.title?.toLowerCase().includes('reel');

                            logger.info(`[Socials/${platformName}] New post detected: ${item.title} (${itemId}) for guild ${guildId}`);

                            await this.handleSocialPost(guildId, platformConfig, account, {
                                title: item.title || 'New post!',
                                url: item.link,
                                author: feed.title || username,
                                description: item.contentSnippet || item.content?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
                                thumbnail: thumbnail,
                                isVideo: isVideo,
                                profileImage: feed.image?.url || feed.itunes?.image
                            }, platformName);

                            account.lastPostId = itemId;
                            changed = true;
                        }

                        if (this.rememberSeen(account, feedIds)) changed = true;
                    }
                } catch (feedErr) {
                    if (this.recordBridgeError(account, platformName, username, feedErr.message)) {
                        changed = true;
                    }
                }
            }
        } catch (error) {
            logger.error(`[Socials/${platformName}] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    cleanTwitterUsername(value = '') {
        let username = String(value || '').trim();
        if (!username) return '';

        username = username
            .replace(/^https?:\/\//i, '')
            .replace(/^www\./i, '')
            .replace(/^(twitter\.com|x\.com)\//i, '')
            .split('/')[0]
            .split('?')[0]
            .replace(/^@/, '')
            .trim();

        return username;
    }

    decodeHtmlEntities(value = '') {
        return String(value || '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'");
    }

    async fetchTwitterNativeTimeline(username) {
        const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(username)}`;
        const response = await axiosWithRetry({
            method: 'GET',
            url,
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36 VerixBot/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': 'https://publish.twitter.com/'
            },
            timeout: TWITTER_NATIVE_TIMEOUT_MS
        });

        const html = typeof response.data === 'string' ? response.data : String(response.data || '');
        if (!html || html.toLowerCase().includes('rate limit exceeded')) {
            throw new Error('X embedded timeline rate limit exceeded');
        }

        const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (!match) {
            throw new Error('X embedded timeline payload not found');
        }

        const data = JSON.parse(match[1]);
        const entries = data?.props?.pageProps?.timeline?.entries || [];
        const profileImage = data?.props?.pageProps?.timeline?.user?.profile_image_url_https ||
            data?.props?.pageProps?.timeline?.user?.profile_image_url ||
            null;

        const items = entries
            .filter(entry => entry?.type === 'tweet' && entry?.content?.tweet)
            .map(entry => {
                const tweet = entry.content.tweet;
                const entryId = String(entry.entry_id || '').replace(/^tweet-/, '');
                const id = tweet.id_str || tweet.rest_id || entryId || tweet.conversation_id_str || String(tweet.id || '');
                const author = tweet.user?.name || tweet.user?.screen_name || username;
                const screenName = tweet.user?.screen_name || username;
                const media = tweet.extended_entities?.media || tweet.entities?.media || [];
                const photo = media.find(item => item.media_url_https || item.media_url);
                const url = `https://x.com/${screenName}/status/${id}`;
                const text = this.decodeHtmlEntities(tweet.full_text || tweet.text || '')
                    .replace(/\s*https:\/\/t\.co\/\S+/g, '')
                    .trim();
                const createdAt = tweet.created_at ? new Date(tweet.created_at) : null;
                const isoDate = createdAt && Number.isFinite(createdAt.getTime()) ? createdAt.toISOString() : null;

                return {
                    id,
                    guid: id,
                    link: url,
                    title: text ? text.slice(0, 120) : `New post from ${screenName}`,
                    contentSnippet: text,
                    content: text,
                    isoDate,
                    pubDate: tweet.created_at,
                    author,
                    thumbnail: photo?.media_url_https || photo?.media_url || '',
                    profileImage: tweet.user?.profile_image_url_https || tweet.user?.profile_image_url || profileImage || this.platformIcon('x'),
                    isVideo: media.some(item => item.type === 'video' || item.type === 'animated_gif')
                };
            })
            .filter(item => item.id && item.link)
            .sort((a, b) => this.getPostTime(b) - this.getPostTime(a));

        if (!items.length) {
            throw new Error('X embedded timeline returned no posts');
        }

        return {
            title: `X / ${username}`,
            image: { url: items[0]?.profileImage || this.platformIcon('x') },
            items
        };
    }

    async checkTwitterNative(guildId, platformConfig) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                const username = this.cleanTwitterUsername(account.username);
                const previousTwitterFetchAt = account.lastTwitterFetchAt ? new Date(account.lastTwitterFetchAt).getTime() : 0;
                account.lastCheckAt = new Date();
                changed = true;

                if (!username) continue;

                if (this.isBridgeBackoffActive(account)) {
                    continue;
                }

                if (
                    previousTwitterFetchAt &&
                    Number.isFinite(previousTwitterFetchAt) &&
                    Date.now() - previousTwitterFetchAt < TWITTER_NATIVE_MIN_CHECK_MS
                ) {
                    continue;
                }

                try {
                    account.lastTwitterFetchAt = new Date();
                    changed = true;

                    const feed = await this.fetchTwitterNativeTimeline(username);
                    if (this.ensureSeenState(account)) changed = true;
                    if (account.lastPostId && account.seenPostIds.length === 0) {
                        account.seenPostIds.push(account.lastPostId);
                        changed = true;
                    }

                    const feedIds = feed.items.map(item => this.getPostId(item)).filter(Boolean);
                    const latestItem = feed.items[0];

                    if (this.clearBridgeErrorState(account)) {
                        changed = true;
                    }

                    if (!account.lastPostId) {
                        const latestId = this.getPostId(latestItem);
                        logger.info(`[Socials/Twitter] Initialized lastPostId for ${username} to ${latestId} without notification`);
                        account.lastPostId = latestId;
                        account.seenPostIds = feedIds;
                        account.cachedProfileImage = latestItem.profileImage || account.cachedProfileImage;
                        changed = true;
                        continue;
                    }

                    const item = this.getLatestUnseenItem(account, feed.items);
                    if (item) {
                        const itemId = this.getPostId(item);
                        logger.info(`[Socials/Twitter] New post detected: ${item.title} (${itemId}) for guild ${guildId}`);

                        await this.handleSocialPost(guildId, platformConfig, account, {
                            title: item.title || 'New post!',
                            url: item.link,
                            author: item.author || username,
                            description: item.contentSnippet || '',
                            thumbnail: item.thumbnail || '',
                            isVideo: item.isVideo,
                            profileImage: item.profileImage || account.cachedProfileImage || this.platformIcon('x')
                        }, 'Twitter');

                        account.lastPostId = itemId;
                        account.cachedProfileImage = item.profileImage || account.cachedProfileImage;
                        changed = true;
                    }

                    if (this.rememberSeen(account, feedIds)) changed = true;
                } catch (feedErr) {
                    if (this.recordBridgeError(account, 'Twitter', username, feedErr.message)) {
                        changed = true;
                    }
                }
            }
        } catch (error) {
            logger.error(`[Socials/Twitter] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    async checkReddit(guildId, platformConfig) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                let username = (account.username || '').trim();
                account.lastCheckAt = new Date();
                changed = true;

                if (username.includes('reddit.com/r/')) {
                    username = username.split('reddit.com/r/').pop().split('/')[0].split('?')[0];
                } else if (username.includes('/r/')) {
                    username = username.split('/r/').pop().split('/')[0].split('?')[0];
                }

                if (!username) continue;
                if (this.isBridgeBackoffActive(account)) continue;

                const feedUrl = `https://www.reddit.com/r/${username}/new.rss`;

                try {
                    const feed = await parseRssUrl(feedUrl);
                    if (feed && feed.items && feed.items.length > 0) {
                        if (this.ensureSeenState(account)) changed = true;
                        if (account.lastPostId && account.seenPostIds.length === 0) {
                            account.seenPostIds.push(account.lastPostId);
                            changed = true;
                        }

                        const feedIds = feed.items.map(item => this.getPostId(item)).filter(Boolean);

                        if (!account.lastPostId) {
                            const latestItem = feed.items[0];
                            const latestId = this.getPostId(latestItem);
                            logger.info(`[Socials/Reddit] Initialized lastPostId for r/${username} to ${latestId} without notification`);
                            account.lastPostId = latestId;
                            account.seenPostIds = feedIds;
                            changed = true;
                            continue;
                        }

                        const item = this.getLatestUnseenItem(account, feed.items);
                        if (item) {
                            const itemId = this.getPostId(item);
                            
                            let thumbnail = '';
                            const content = item.content || item.contentSnippet || '';
                            const imgMatch = content.match(/<img[^>]+(?:src|data-src|original-src)=["']([^"']+)["']/i);
                            if (imgMatch && imgMatch[1]) {
                                thumbnail = imgMatch[1];
                            }
                            if (thumbnail && (thumbnail.includes('redditstatic.com') || thumbnail.includes('reddit.com/static'))) {
                                thumbnail = '';
                            }

                            const author = item.author || item.creator || 'u/RedditUser';
                            let cleanAuthor = author;
                            if (cleanAuthor.name) cleanAuthor = cleanAuthor.name;
                            if (typeof cleanAuthor === 'string') {
                                cleanAuthor = cleanAuthor.replace(/^\/u\//, 'u/');
                                if (!cleanAuthor.startsWith('u/')) {
                                    cleanAuthor = `u/${cleanAuthor}`;
                                }
                            }

                            logger.info(`[Socials/Reddit] New Reddit post detected: ${item.title} (${itemId}) for guild ${guildId}`);

                            let desc = item.contentSnippet || '';
                            if (!desc && item.content) {
                                desc = item.content.replace(/<[^>]*>/g, '').trim();
                            }
                            if (desc.length > 500) {
                                desc = desc.substring(0, 500) + '...';
                            }

                            await this.handleSocialPost(guildId, platformConfig, account, {
                                title: item.title || 'New Post!',
                                url: item.link,
                                author: cleanAuthor,
                                description: desc,
                                thumbnail: thumbnail,
                                profileImage: this.normalizeImageUrl(item.authorImage || item.creatorImage || feed.image?.url)
                            }, 'Reddit');

                            account.lastPostId = itemId;
                            changed = true;
                        }

                        if (this.rememberSeen(account, feedIds)) changed = true;
                        if (this.clearBridgeErrorState(account)) changed = true;
                    }
                } catch (feedErr) {
                    if (this.recordBridgeError(account, 'Reddit', username, feedErr.message)) changed = true;
                }
            }
        } catch (error) {
            logger.error(`[Socials/Reddit] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    async checkSteam(guildId, platformConfig) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                let username = (account.username || '').trim();
                account.lastCheckAt = new Date();
                changed = true;

                let gameId = username;
                if (gameId.includes('steamcommunity.com/games/')) {
                    gameId = gameId.split('steamcommunity.com/games/').pop().split('/')[0].split('?')[0];
                } else if (gameId.includes('steamcommunity.com/app/')) {
                    gameId = gameId.split('steamcommunity.com/app/').pop().split('/')[0].split('?')[0];
                } else if (gameId.includes('store.steampowered.com/app/')) {
                    gameId = gameId.split('store.steampowered.com/app/').pop().split('/')[0].split('?')[0];
                }

                if (!gameId) continue;
                if (this.isBridgeBackoffActive(account)) continue;

                const feedUrl = `https://store.steampowered.com/feeds/news/app/${gameId}/?cc=US&l=en`;

                try {
                    const feed = await parseRssUrl(feedUrl);
                    if (feed && feed.items && feed.items.length > 0) {
                        if (this.ensureSeenState(account)) changed = true;
                        if (account.lastPostId && account.seenPostIds.length === 0) {
                            account.seenPostIds.push(account.lastPostId);
                            changed = true;
                        }

                        const feedIds = feed.items.map(item => this.getPostId(item)).filter(Boolean);

                        if (!account.lastPostId) {
                            const latestItem = feed.items[0];
                            const latestId = this.getPostId(latestItem);
                            logger.info(`[Socials/Steam] Initialized lastPostId for Steam game ${gameId} to ${latestId} without notification`);
                            account.lastPostId = latestId;
                            account.seenPostIds = feedIds;
                            changed = true;
                            continue;
                        }

                        const item = this.getLatestUnseenItem(account, feed.items);
                        if (item) {
                            const itemId = this.getPostId(item);
                            
                            let thumbnail = this.extractThumbnail(item);
                            if (!thumbnail && /^\d+$/.test(gameId)) {
                                thumbnail = `https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/header.jpg`;
                            }

                            let desc = item.contentSnippet || '';
                            if (!desc && item.content) {
                                desc = item.content.replace(/<[^>]*>/g, '').trim();
                            }
                            if (desc.length > 500) {
                                desc = desc.substring(0, 500) + '...';
                            }

                            let gameName = feed.title || gameId;
                            if (gameName.includes('Steam Community :: Group :: ')) {
                                gameName = gameName.replace('Steam Community :: Group :: ', '');
                            } else if (gameName.includes('Steam Community :: ')) {
                                gameName = gameName.replace('Steam Community :: ', '');
                            }

                            logger.info(`[Socials/Steam] New Steam announcement detected: ${item.title} (${itemId}) for guild ${guildId}`);

                            await this.handleSocialPost(guildId, platformConfig, account, {
                                title: item.title || 'New Announcement!',
                                url: item.link,
                                author: gameName,
                                username: gameName,
                                description: desc,
                                thumbnail: thumbnail,
                                profileImage: this.platformIcon('steam')
                            }, 'Steam');

                            account.lastPostId = itemId;
                            changed = true;
                        }

                        if (this.rememberSeen(account, feedIds)) changed = true;
                        if (this.clearBridgeErrorState(account)) changed = true;
                    }
                } catch (feedErr) {
                    if (this.recordBridgeError(account, 'Steam', gameId, feedErr.message)) changed = true;
                }
            }
        } catch (error) {
            logger.error(`[Socials/Steam] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    async checkFeedAccounts(guildId, platformConfig, platformName, buildFeedUrl, buildPostData) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                const username = (account.username || '').trim();
                account.lastCheckAt = new Date();
                changed = true;

                if (!username) continue;
                if (this.isBridgeBackoffActive(account)) continue;

                try {
                    const feedUrl = buildFeedUrl(username);
                    const feed = await parseRssUrl(feedUrl);
                    if (feed && feed.items && feed.items.length > 0) {
                        if (this.ensureSeenState(account)) changed = true;
                        if (account.lastPostId && account.seenPostIds.length === 0) {
                            account.seenPostIds.push(account.lastPostId);
                            changed = true;
                        }

                        const feedIds = feed.items.map(item => this.getPostId(item)).filter(Boolean);
                        const latestItem = feed.items[0];

                        if (this.clearBridgeErrorState(account)) changed = true;

                        if (!account.lastPostId) {
                            const latestId = this.getPostId(latestItem);
                            logger.info(`[Socials/${platformName}] Initialized lastPostId for ${username} to ${latestId} without notification`);
                            account.lastPostId = latestId;
                            account.seenPostIds = feedIds;
                            changed = true;
                            continue;
                        }

                        const item = this.getLatestUnseenItem(account, feed.items);
                        if (item) {
                            const itemId = this.getPostId(item);
                            logger.info(`[Socials/${platformName}] New item detected: ${item.title} (${itemId}) for guild ${guildId}`);

                            await this.handleSocialPost(guildId, platformConfig, account, buildPostData({ item, feed, username }), platformName);

                            account.lastPostId = itemId;
                            changed = true;
                        }

                        if (this.rememberSeen(account, feedIds)) changed = true;
                    }
                } catch (feedErr) {
                    if (this.recordBridgeError(account, platformName, username, feedErr.message)) {
                        changed = true;
                    }
                }
            }
        } catch (error) {
            logger.error(`[Socials/${platformName}] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    cleanGitHubRepository(value) {
        let input = String(value || '').trim();
        if (!input) return '';
        if (!/^https?:\/\//i.test(input)) input = `https://github.com/${input}`;
        const url = new URL(input);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length < 2) throw new Error('GitHub source must be owner/repo or a GitHub repository URL');
        return `${parts[0]}/${parts[1]}`;
    }

    normalizeGithubFeedUrl(value) {
        let input = String(value || '').trim();
        if (!input) return '';
        if (!/^https?:\/\//i.test(input)) input = `https://github.com/${input}`;
        const url = new URL(input);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length < 2) throw new Error('GitHub source must be owner/repo or a GitHub repository URL');
        const owner = parts[0];
        const repo = parts[1];
        const mode = parts.includes('releases') ? 'releases' : 'commits';
        const branchIndex = parts.indexOf('commits');
        const branch = branchIndex !== -1 && parts[branchIndex + 1] ? parts.slice(branchIndex + 1).join('/') : null;
        return mode === 'releases'
            ? `https://github.com/${owner}/${repo}/releases.atom`
            : `https://github.com/${owner}/${repo}/commits/${branch || 'HEAD'}.atom`;
    }

    async checkGitHub(guildId, platformConfig) {
        return this.checkFeedAccounts(
            guildId,
            platformConfig,
            'GitHub',
            value => this.normalizeGithubFeedUrl(value),
            ({ item, feed, username }) => {
                const repository = this.cleanGitHubRepository(username);
                return {
                    title: item.title || 'New GitHub update',
                    url: item.link || `https://github.com/${repository}`,
                    author: item.author || feed.title || repository,
                    username: repository,
                    description: (item.contentSnippet || item.content || '').replace(/<[^>]*>/g, '').trim().substring(0, 500),
                    thumbnail: '',
                    profileImage: ''
                };
            }
        );
    }

    async checkCustomRSS(guildId, platformConfig) {
        return this.checkFeedAccounts(
            guildId,
            platformConfig,
            'RSS',
            value => {
                if (!/^https?:\/\//i.test(value)) throw new Error('RSS feed must be a valid http(s) URL');
                return value;
            },
            ({ item, feed, username }) => ({
                title: item.title || 'New feed update',
                url: item.link || username,
                author: feed.title || username,
                description: (item.contentSnippet || item.content || '').replace(/<[^>]*>/g, '').trim().substring(0, 500),
                thumbnail: this.extractThumbnail(item),
                profileImage: feed.image?.url || this.platformIcon('rss')
            })
        );
    }

    cleanTelegramUsername(value = '') {
        return String(value || '')
            .trim()
            .replace(/^https?:\/\//i, '')
            .replace(/^t\.me\/s\//i, '')
            .replace(/^t\.me\//i, '')
            .replace(/^@/, '')
            .split('/')[0]
            .split('?')[0];
    }

    decodeTelegramHtml(value = '') {
        return this.decodeHtmlEntities(String(value || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')).trim();
    }

    async fetchTelegramPosts(username) {
        const cleanUsername = this.cleanTelegramUsername(username);
        const response = await axiosWithRetry({
            method: 'GET',
            url: `https://t.me/s/${encodeURIComponent(cleanUsername)}`,
            responseType: 'text',
            headers: { 'User-Agent': 'Mozilla/5.0 VerixBot/1.0' },
            timeout: RSS_TIMEOUT_MS
        });
        const html = String(response.data || '');
        const matches = [...html.matchAll(/<div class="tgme_widget_message_wrap[\s\S]*?<\/time>[\s\S]*?<\/div>\s*<\/div>/g)];
        const items = matches.map(match => {
            const block = match[0];
            const idMatch = block.match(/data-post="([^"]+)"/);
            const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
            const timeMatch = block.match(/datetime="([^"]+)"/);
            const imageMatch =
                block.match(/background-image:url\(['"]?([^'")]+)['"]?\)/) ||
                block.match(/<a[^>]+class="[^"]*tgme_widget_message_photo_wrap[^"]*"[^>]+href=["']([^"']+)["']/) ||
                block.match(/<img[^>]+src=["']([^"']+)["']/);
            const id = idMatch?.[1] || '';
            const text = this.decodeTelegramHtml(textMatch?.[1] || '');
            const [, channel, postId] = id.match(/^([^/]+)\/(.+)$/) || [];
            return {
                id,
                guid: id,
                link: channel && postId ? `https://t.me/${channel}/${postId}` : `https://t.me/s/${cleanUsername}`,
                title: text ? text.slice(0, 120) : `New Telegram post from ${cleanUsername}`,
                contentSnippet: text,
                content: text,
                isoDate: timeMatch?.[1] || null,
                pubDate: timeMatch?.[1] || null,
                thumbnail: imageMatch?.[1] || ''
            };
        }).filter(item => item.id).sort((a, b) => this.getPostTime(b) - this.getPostTime(a));

        const profileImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i) || html.match(/<img class="tgme_page_photo_image" src="([^"]+)"/i);
        const profileImage = profileImageMatch?.[1] || '';

        if (!items.length) throw new Error('Telegram channel returned no public posts');
        return { title: cleanUsername, profileImage, items };
    }

    async checkTelegram(guildId, platformConfig) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                const username = this.cleanTelegramUsername(account.username);
                account.lastCheckAt = new Date();
                changed = true;
                if (!username) continue;
                if (this.isBridgeBackoffActive(account)) continue;

                try {
                    const feed = await this.fetchTelegramPosts(username);
                    if (this.ensureSeenState(account)) changed = true;
                    const feedIds = feed.items.map(item => this.getPostId(item)).filter(Boolean);
                    const latestItem = feed.items[0];
                    if (this.clearBridgeErrorState(account)) changed = true;
                    if (!account.lastPostId) {
                        account.lastPostId = this.getPostId(latestItem);
                        account.seenPostIds = feedIds;
                        changed = true;
                        continue;
                    }
                    const item = this.getLatestUnseenItem(account, feed.items);
                    if (item) {
                        await this.handleSocialPost(guildId, platformConfig, account, {
                            title: item.title || 'New Telegram post',
                            url: item.link,
                            author: username,
                            description: item.contentSnippet || '',
                            thumbnail: this.normalizeImageUrl(item.thumbnail),
                            profileImage: feed.profileImage || this.platformIcon('telegram')
                        }, 'Telegram');
                        account.lastPostId = this.getPostId(item);
                        changed = true;
                    }
                    if (this.rememberSeen(account, feedIds)) changed = true;
                } catch (feedErr) {
                    if (this.recordBridgeError(account, 'Telegram', username, feedErr.message)) changed = true;
                }
            }
        } catch (error) {
            logger.error(`[Socials/Telegram] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    cleanKickUsername(value = '') {
        return String(value || '').trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/^kick\.com\//i, '').split('/')[0].split('?')[0].replace(/^@/, '');
    }

    async checkKick(guildId, platformConfig) {
        let changed = false;
        try {
            for (const account of platformConfig.accounts) {
                const username = this.cleanKickUsername(account.username);
                account.lastCheckAt = new Date();
                changed = true;
                if (!username) continue;
                try {
                    const response = await axiosWithRetry({
                        method: 'GET',
                        url: `https://kick.com/api/v2/channels/${encodeURIComponent(username)}`,
                        responseType: 'json',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                            'Accept': 'application/json, text/plain, */*',
                            'Accept-Language': 'en-US,en;q=0.9,it;q=0.8',
                            'Referer': `https://kick.com/${encodeURIComponent(username)}`,
                            'Origin': 'https://kick.com'
                        },
                        timeout: RSS_TIMEOUT_MS
                    });
                    const channel = response.data || {};
                    const stream = channel.livestream;
                    if (stream) {
                        const streamId = String(stream.id || stream.session_title || channel.playback_url || `${username}-live`);
                        if (!account.isLive || account.lastPostId !== streamId) {
                            await this.handleSocialPost(guildId, platformConfig, account, {
                                title: stream.session_title || `${channel.user?.username || username} is live`,
                                url: `https://kick.com/${channel.slug || username}`,
                                author: channel.user?.username || username,
                                thumbnail: this.normalizeImageUrl(stream.thumbnail?.url || channel.banner_image?.url || channel.offline_banner_image?.url || ''),
                                profileImage: this.normalizeImageUrl(channel.user?.profile_pic) || this.platformIcon('kick')
                            }, 'Kick');
                            account.isLive = true;
                            account.lastPostId = streamId;
                            changed = true;
                        }
                    } else if (account.isLive) {
                        account.isLive = false;
                        changed = true;
                    }
                    if (this.clearBridgeErrorState(account)) changed = true;
                } catch (feedErr) {
                    if (this.recordBridgeError(account, 'Kick', username, feedErr.message)) changed = true;
                }
            }
        } catch (error) {
            logger.error(`[Socials/Kick] Error checking guild ${guildId}:`, error);
        }
        return changed;
    }

    isBridgeBackoffActive(account) {
        const until = account.bridgeBackoffUntil ? new Date(account.bridgeBackoffUntil).getTime() : 0;
        if (!Number.isFinite(until) || until <= Date.now()) return false;
        if (until - Date.now() > BRIDGE_ERROR_MAX_BACKOFF_MS) return false;
        return true;
    }

    isBridgeErrorItem(item) {
        const haystack = [
            item?.title,
            item?.contentSnippet,
            item?.content,
            item?.link
        ].filter(Boolean).join(' ').toLowerCase();

        return BRIDGE_ERROR_KEYWORDS.some(keyword => haystack.includes(keyword));
    }

    getPublicBaseUrl() {
        return (process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.DASHBOARD_URL || process.env.APP_URL || 'https://verixbot.com').replace(/\/+$/, '');
    }

    platformIcon(slug) {
        return `${this.getPublicBaseUrl()}/img/social/${slug}.png`;
    }

    shouldProxyImageUrl(url = '') {
        const text = String(url || '').toLowerCase();
        return [
            'cdninstagram.com',
            'fbcdn.net',
            'twimg.com',
            'ytimg.com',
            'ggpht.com',
            'tiktokcdn',
            'redditmedia.com',
            'redd.it',
            'steamstatic.com',
            'githubusercontent.com',
            'telegram.org'
        ].some(domain => text.includes(domain));
    }

    getSocialProfileThumbnail(platform, profileImage, fallbackIcon = '') {
        const normalizedProfile = this.normalizeImageUrl(profileImage);
        if (normalizedProfile) return normalizedProfile;

        const noFallbackThumbnail = new Set(['GitHub', 'Reddit', 'Instagram', 'TikTok']);
        if (noFallbackThumbnail.has(platform)) return '';

        return this.normalizeImageUrl(fallbackIcon);
    }

    summarizeBridgeError(reason = '') {
        const text = String(reason || '').toLowerCase();
        if (text.includes('429') || text.includes('rate')) return 'Rate limited';
        if (text.includes('403') || text.includes('security policy') || text.includes('blocked')) return 'Blocked by feed provider';
        if (text.includes('404') || text.includes('not found')) return 'Feed not found';
        if (text.includes('invalid') || text.includes('url')) return 'Invalid source';
        if (text.includes('no posts') || text.includes('no public posts') || text.includes('no items')) return 'No public content';
        if (text.includes('timeout') || text.includes('timed out')) return 'Request timeout';
        return 'Temporary feed error';
    }

    recordBridgeError(account, platformName, username, reason = 'Unknown bridge error') {
        const now = Date.now();
        const previousErrorAt = account.lastBridgeErrorAt ? new Date(account.lastBridgeErrorAt).getTime() : 0;
        const errorCount = Math.min((account.bridgeErrorCount || 0) + 1, 12);
        const backoffMs = Math.min(BRIDGE_ERROR_BASE_BACKOFF_MS * 2 ** (errorCount - 1), BRIDGE_ERROR_MAX_BACKOFF_MS);

        account.bridgeErrorCount = errorCount;
        account.lastBridgeErrorReason = this.summarizeBridgeError(reason);
        account.lastBridgeErrorAt = new Date(now);
        account.bridgeBackoffUntil = new Date(now + backoffMs);

        if (!previousErrorAt || now - previousErrorAt >= BRIDGE_ERROR_LOG_INTERVAL_MS) {
            logger.warn(`[Socials/${platformName}] Feed source unavailable for ${username}; retrying in ${Math.round(backoffMs / 60000)} minutes. Reason: ${reason}`);
        }

        return true;
    }

    clearBridgeErrorState(account) {
        if (!account.bridgeErrorCount && !account.lastBridgeErrorReason && !account.lastBridgeErrorAt && !account.bridgeBackoffUntil) {
            return false;
        }

        account.bridgeErrorCount = 0;
        account.lastBridgeErrorReason = null;
        account.lastBridgeErrorAt = null;
        account.bridgeBackoffUntil = null;
        return true;
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
            const guildData = await Guild.findOne({ guildId }).select('isPremium premiumTier hideBranding').lean();
            const isPremiumTier = !!guildData?.isPremium || ['premium', 'platinum'].includes(guildData?.premiumTier);

            const channelId = platformConfig.notificationChannelId;
            if (!channelId) return;

            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (!channel) {
                logger.warn(`[Socials] Notification channel ${channelId} not found in guild ${guildId}.`);
                return;
            }

            // Dynamically build embed using user's config
            const customEmbed = await messageService.getRaw(guildId, 'socials', platform.toLowerCase()) || platformConfig.embed || {};

            // Optimize URL for preview/shareability
            let optimizedUrl = postData.url || '';
            if (optimizedUrl.includes('twitter.com')) optimizedUrl = optimizedUrl.replace('twitter.com', 'vxtwitter.com');
            else if (optimizedUrl.includes('x.com')) optimizedUrl = optimizedUrl.replace('x.com', 'vxtwitter.com');
            else if (optimizedUrl.includes('instagram.com')) optimizedUrl = optimizedUrl.replace('instagram.com', 'ddinstagram.com');

            const formatText = (text) => {
                if (!text) return '';

                // If it's a video on X/Twitter, the user requested to put nothing instead of the post content/description
                if (postData.isVideo && (platform === 'Twitter' || platform === 'X')) {
                    return '';
                }

                return placeholderHelper.replace(text, {
                    streamer: postData.author || account.username,
                    username: postData.username || account.username,
                    author: postData.author || account.username,
                    platform,
                    title: postData.title,
                    url: optimizedUrl,
                    description: (postData.description || '')
                        .replace(/Vedi su (Instagram|TikTok|X|Twitter)/gi, '')
                        .replace(/View on (Instagram|TikTok|X|Twitter)/gi, '')
                        .replace(/Guarda (il TikTok|ora)/gi, '')
                        .replace(/Watch (on TikTok|now)/gi, '')
                        .replace(/Vai al (Tweet|tweet)/gi, '')
                        .replace(/Go to (Tweet|tweet)/gi, '')
                        .replace(/Vedi (il Post|il post)/gi, '')
                        .replace(/View (Post|post)/gi, '')
                        .replace(/A post shared by .*/gi, '')
                        .trim()
                });
            };

            // Default titles and descriptions based on platform
            const defaultTitles = t('socials.default_titles', lang);
            const defaultDescs = t('socials.default_descriptions', lang);

            // Default settings based on platform.
            const platformStyles = {
                'Twitch': { color: 0x6441a5, icon: this.platformIcon('twitch'), label: 'Twitch Live' },
                'YouTube': { color: 0xff0000, icon: this.platformIcon('youtube'), label: 'YouTube Video' },
                'Twitter': { color: 0x000000, icon: this.platformIcon('x'), label: 'X (Twitter)' },
                'Instagram': { color: 0xe1306c, icon: this.platformIcon('instagram'), label: 'Instagram' },
                'TikTok': { color: 0x000000, icon: this.platformIcon('tiktok'), label: 'TikTok' },
                'Reddit': { color: 0xff4500, icon: this.platformIcon('reddit'), label: 'Reddit Post' },
                'Steam': { color: 0x1b2838, icon: this.platformIcon('steam'), label: 'Steam Announcement' },
                'Kick': { color: 0x53fc18, icon: this.platformIcon('kick'), label: 'Kick Live' },
                'GitHub': { color: 0x24292f, icon: this.platformIcon('github'), label: 'GitHub Update' },
                'RSS': { color: 0xf97316, icon: this.platformIcon('rss'), label: 'RSS Update' },
                'Telegram': { color: 0x26a5e4, icon: this.platformIcon('telegram'), label: 'Telegram Post' }
            };

            const style = platformStyles[platform] || { color: 0x7289da, icon: '', label: platform };

            // Clean up author name (strip " - Instagram" etc)
            let authorName = postData.author || postData.username || account.username;
            if (authorName.includes(' - ')) authorName = authorName.split(' - ')[0];
            if (authorName.includes(' | ')) authorName = authorName.split(' | ')[0];

            // Suppress description if video on X/Twitter
            const isTwitter = platform === 'Twitter' || platform === 'X';
            const isTwitterVideo = isTwitter && postData.isVideo;

            let finalDescription = formatText(customEmbed.description) || formatText(defaultDescs[platform]) || postData.description || postData.title;
            if (isTwitterVideo) {
                finalDescription = ''; // Don't show post content if it's a video
            }

            const embedData = new EmbedBuilder()
                .setTitle(formatText(customEmbed.title) || formatText(defaultTitles[platform]) || 'New Post!')
                .setURL(optimizedUrl)
                .setDescription(finalDescription)
                .setColor(customEmbed.color ? parseInt(customEmbed.color.replace('#', ''), 16) : style.color)
                .setTimestamp()
                .setFooter({
                    text: applyBrandingToFooter(formatText(customEmbed.footer) || t('socials.footer', lang), {
                        isPremium: isPremiumTier,
                        hideBranding: !!guildData?.hideBranding
                    }),
                    iconURL: this.client.user.displayAvatarURL()
                });

            const profileImage = this.getSocialProfileThumbnail(platform, postData.profileImage, style.icon);
            if (profileImage) {
                embedData.setThumbnail(profileImage);
            }

            // Author (Top) - Use the platform icon for branding
            embedData.setAuthor({
                name: `${style.label} - ${authorName}`,
                iconURL: style.icon || guild.iconURL()
            });

            if (postData.thumbnail) {
                // Main Image (Bottom) - The stream preview or post photo
                let finalThumbnail = this.normalizeImageUrl(postData.thumbnail);
                if (finalThumbnail) {
                    if (this.shouldProxyImageUrl(finalThumbnail)) {
                        const base64Url = Buffer.from(finalThumbnail).toString('base64');
                        const apiUrl = process.env.API_URL || 'https://verixbot.com/api';
                        finalThumbnail = `${apiUrl}/webhooks/image-proxy?url=${encodeURIComponent(base64Url)}`;
                    }
                    embedData.setImage(finalThumbnail);
                }
            }

            const buttonLabels = t('socials.button_labels', lang);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(buttonLabels[platform] || buttonLabels.default || 'Open Link')
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

            if (this.youtubeIdCache && this.youtubeIdCache.has(cleanHandle)) {
                return this.youtubeIdCache.get(cleanHandle);
            }
            if (this.youtubeIdCache && this.youtubeIdCache.has(handle)) {
                return this.youtubeIdCache.get(handle);
            }

            const url = `https://www.youtube.com/${cleanHandle}`;

            const response = await axiosWithRetry({
                method: 'GET',
                url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: YOUTUBE_RESOLVE_TIMEOUT_MS
            });

            // Regex to find "channelId":"UC..." or "externalId":"UC..."
            const match = response.data.match(/\"(?:channelId|externalId)\"\:\"(UC[a-zA-Z0-9_-]+)\"/);
            if (match && match[1]) {
                logger.info(`[YouTubeResolver] Resolved ${handle} to ${match[1]}`);
                if (this.youtubeIdCache) {
                    this.youtubeIdCache.set(cleanHandle, match[1]);
                    this.youtubeIdCache.set(handle, match[1]);
                }
                return match[1];
            }

            // Fallback: search for canonical link
            const canonicalMatch = response.data.match(/<link rel=\"canonical\" href=\"https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)\"/);
            if (canonicalMatch && canonicalMatch[1]) {
                logger.info(`[YouTubeResolver] Resolved ${handle} to ${canonicalMatch[1]} (via canonical)`);
                if (this.youtubeIdCache) {
                    this.youtubeIdCache.set(cleanHandle, canonicalMatch[1]);
                    this.youtubeIdCache.set(handle, canonicalMatch[1]);
                }
                return canonicalMatch[1];
            }

            return null;
        } catch (error) {
            logger.debug(`[YouTubeResolver] Failed to resolve handle ${handle}: ${error.message}`);
            return null;
        }
    }

    async fetchYouTubeProfileImage(channelIdOrHandle) {
        try {
            const isHandle = channelIdOrHandle.startsWith('@') || !channelIdOrHandle.startsWith('UC');
            const cleanHandle = isHandle && !channelIdOrHandle.startsWith('@') ? `@${channelIdOrHandle}` : channelIdOrHandle;

            if (this.youtubeAvatarCache && this.youtubeAvatarCache.has(cleanHandle)) {
                return this.youtubeAvatarCache.get(cleanHandle);
            }
            if (this.youtubeAvatarCache && this.youtubeAvatarCache.has(channelIdOrHandle)) {
                return this.youtubeAvatarCache.get(channelIdOrHandle);
            }

            const url = isHandle ? `https://www.youtube.com/${cleanHandle}` : `https://www.youtube.com/channel/${channelIdOrHandle}`;

            const response = await axiosWithRetry({
                method: 'GET',
                url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout: YOUTUBE_RESOLVE_TIMEOUT_MS
            });

            // Extract from meta tags (og:image)
            const metaMatch = response.data.match(/<meta property="og:image" content="([^"]+)"/);
            if (metaMatch && metaMatch[1]) {
                const avatarUrl = metaMatch[1].replace('s900-c', 's288-c');
                if (this.youtubeAvatarCache) {
                    this.youtubeAvatarCache.set(cleanHandle, avatarUrl);
                    this.youtubeAvatarCache.set(channelIdOrHandle, avatarUrl);
                }
                return avatarUrl;
            }

            return null;
        } catch (error) {
            logger.debug(`[YouTubeResolver] Failed to fetch profile image for ${channelIdOrHandle}: ${error.message}`);
            return null;
        }
    }

    async maintainWebSubSubscriptions() {
        if (mongoose.connection.readyState !== 1) return;

        try {
            logger.info('[WebSub] Starting YouTube WebSub subscription maintenance...');
            const configs = await SocialConfig.find({ 'platforms.youtube.enabled': true });
            if (!configs.length) return;

            const subscribedChannels = new Set();
            const hubUrl = 'https://pubsubhubbub.appspot.com/subscribe';

            // We need the API_URL from env for the callback
            const apiUrl = process.env.API_URL || 'https://verixbot.com/api';

            for (const config of configs) {
                const accounts = config.platforms?.youtube?.accounts || [];
                for (const account of accounts) {
                    let channelId = account.username || '';
                    if (channelId.includes('youtube.com/')) {
                        channelId = channelId.split('/').pop().split('?')[0];
                    }

                    // Resolve handles if necessary
                    if (!channelId.startsWith('UC')) {
                        let resolvedId = account.resolvedId;
                        if (!resolvedId && this.youtubeIdCache && this.youtubeIdCache.has(channelId)) {
                            resolvedId = this.youtubeIdCache.get(channelId);
                        }

                        if (!resolvedId) {
                            resolvedId = await this.resolveYouTubeHandle(channelId);
                            if (resolvedId) {
                                account.resolvedId = resolvedId;
                                if (this.youtubeIdCache) this.youtubeIdCache.set(channelId, resolvedId);
                                await config.save().catch(() => null);
                            }
                        }
                        if (resolvedId) channelId = resolvedId;
                    }

                    if (!channelId || !channelId.startsWith('UC') || subscribedChannels.has(channelId)) continue;

                    subscribedChannels.add(channelId);

                    const topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
                    const callbackUrl = `${apiUrl}/webhooks/youtube/${channelId}`;

                    try {
                        const response = await axiosWithRetry({
                            method: 'POST',
                            url: hubUrl,
                            params: {
                                'hub.callback': callbackUrl,
                                'hub.topic': topicUrl,
                                'hub.verify': 'async',
                                'hub.mode': 'subscribe',
                                'hub.verify_token': channelId
                            },
                            timeout: WEB_SUB_TIMEOUT_MS
                        });

                        if (response.status === 202 || response.status === 204) {
                            logger.info(`[WebSub] Sent subscription request for channel ${channelId}`);
                        } else {
                            logger.warn(`[WebSub] Unexpected status ${response.status} when subscribing to ${channelId}`);
                        }
                    } catch (subErr) {
                        logger.error(`[WebSub] Failed to subscribe to ${channelId}:`, subErr.message);
                    }

                    // Small delay to avoid hammering Google Hub
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
            logger.info(`[WebSub] Finished subscription maintenance for ${subscribedChannels.size} unique channels.`);
        } catch (error) {
            logger.error('[WebSub] Error during subscription maintenance:', error);
        }
    }
}
