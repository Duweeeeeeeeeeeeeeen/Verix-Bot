import mongoose from 'mongoose';
import TwitchConfig from '../../models/TwitchConfig.js';
import { getStreams, getThumbnailUrl } from '../../utils/twitchHelper.js';
import { EmbedBuilder } from 'discord.js';
import logger from '../../utils/logger.js';
import messageService from '../../utils/messageService.js';

export class TwitchManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    init() {
        logger.info('[Twitch] Manager initialized.');
        this.start(180000); // Poll every 3 minutes
    }

    start(ms) {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.checkStreamers(), ms);
        // Initial check after a short delay to let guilds load
        setTimeout(() => this.checkStreamers(), 10000);
    }

    async checkStreamers() {
        if (mongoose.connection.readyState !== 1) {
            logger.warn('[Twitch] Skipping checkStreamers: Database not connected.');
            return;
        }
        try {
            const configs = await TwitchConfig.find({ enabled: true });
            if (!configs.length) return;

            for (const config of configs) {
                const guild = this.client.guilds.cache.get(config.guildId);
                if (!guild) continue;

                if (!config.streamers || config.streamers.length === 0) continue;

                const usernames = config.streamers.map(s => s.twitchUsername);
                const liveStreams = await getStreams(usernames);

                for (const streamer of config.streamers) {
                    const stream = liveStreams.find(s => s.user_login.toLowerCase() === streamer.twitchUsername.toLowerCase());
                    
                    if (stream) {
                        // Streamer is LIVE
                        if (!streamer.isLive || (stream.id !== streamer.lastStreamId)) {
                            // NEW LIVE detected
                            await this.handleLiveStart(guild, config, streamer, stream);
                        }
                    } else {
                        // Streamer is OFFLINE
                        if (streamer.isLive) {
                            // NEW OFF detected
                            await this.handleLiveEnd(guild, config, streamer);
                        }
                    }
                }

                // Save changes to config (isLive state)
                await config.save();
            }
        } catch (error) {
            logger.error('[Twitch] Error in checkStreamers loop:', error);
        }
    }

    async handleLiveStart(guild, config, streamer, stream) {
        try {
            logger.info(`[Twitch] ${streamer.twitchUsername} is Live on guild ${guild.name}`);
            
            streamer.isLive = true;
            streamer.lastStreamId = stream.id;
            streamer.lastNotifyAt = new Date();

            // 1. Send Notification
            const channel = guild.channels.cache.get(config.notificationChannelId);
            if (channel) {
                const url = `https://twitch.tv/${stream.user_login}`;
                const embed = await messageService.get(guild.id, 'twitch', 'stream_online', {
                    streamer: stream.user_name,
                    title: stream.title,
                    game: stream.game_name || 'Generico',
                    url: url
                });
                
                const content = config.mentionEveryone ? '@everyone' : null;
                await channel.send({ content, embeds: [embed] }).catch(err => {
                    logger.error(`[Twitch] Failed to send notification in ${channel.id}:`, err.message);
                });
            }

            // 2. Add Role
            if (config.streamingRoleId && streamer.discordUserId) {
                const member = await guild.members.fetch(streamer.discordUserId).catch(() => null);
                if (member) {
                    await member.roles.add(config.streamingRoleId).catch(err => {
                        logger.error(`[Twitch] Failed to add role to ${member.id}:`, err.message);
                    });
                }
            }
        } catch (error) {
            logger.error('[Twitch] Error handling live start:', error);
        }
    }

    async handleLiveEnd(guild, config, streamer) {
        try {
            logger.info(`[Twitch] ${streamer.twitchUsername} went Offline on guild ${guild.name}`);
            
            streamer.isLive = false;

            // 1. Remove Role
            if (config.streamingRoleId && streamer.discordUserId) {
                const member = await guild.members.fetch(streamer.discordUserId).catch(() => null);
                if (member) {
                    await member.roles.remove(config.streamingRoleId).catch(err => {
                        logger.error(`[Twitch] Failed to remove role from ${member.id}:`, err.message);
                    });
                }
            }
        } catch (error) {
            logger.error('[Twitch] Error handling live end:', error);
        }
    }

    // buildLiveEmbed is now handled by messageService
}

function guildAvatar(user) {
    return user.displayAvatarURL({ dynamic: true });
}
