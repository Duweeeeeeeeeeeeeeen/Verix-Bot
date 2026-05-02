import mongoose from 'mongoose';
import WhitelistApp from '../models/WhitelistApp.js';
import Ticket from '../models/Ticket.js';
import VoiceQueue from '../models/VoiceQueue.js';
import SupportQueue from '../models/SupportQueue.js';
import Background from '../models/Background.js';
import TicketConfig from '../models/TicketConfig.js';
import logger from '../utils/logger.js';
import messageService from '../utils/messageService.js';

class CleanupManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    /**
     * Start the periodic cleanup check.
     * @param {number} intervalMs - Frequency of checks (default 60s)
     */
    start(intervalMs = 60000) {
        logger.info(`[CleanupManager] Started with interval: ${intervalMs}ms`);
        this.interval = setInterval(() => this.run(), intervalMs);
        // Run once immediately on start to catch offline expirations
        this.run();
    }

    async run() {
        if (mongoose.connection.readyState !== 1) return;
        const now = new Date();
        try {
            await Promise.all([
                this.cleanupWhitelist(now),
                this.cleanupTickets(now),
                this.cleanupVoice(now),
                this.cleanupBackground(now),
                this.cleanupSupport(now),
                this.cleanupAutoClose(now)
            ]);
        } catch (error) {
            logger.error('[CleanupManager] General Execution Error:', error);
        }
    }

    async cleanupWhitelist(now) {
        const apps = await WhitelistApp.find({ deletionScheduledAt: { $lte: now } });
        for (const app of apps) {
            await this.deleteChannel(app.guildId, app.channelId, `Whitelist Session Expired/Finished (${app.userId})`);
            app.deletionScheduledAt = null;
            await app.save();
        }
    }

    async cleanupTickets(now) {
        const tickets = await Ticket.find({ deletionScheduledAt: { $lte: now } });
        if (tickets.length > 0) logger.debug(`[CleanupManager] Found ${tickets.length} tickets scheduled for deletion.`);
        for (const ticket of tickets) {
            logger.info(`[CleanupManager] Executing deletion for ticket ${ticket.channelId} (User: ${ticket.userId})`);
            await this.deleteChannel(ticket.guildId, ticket.channelId, `Ticket Closed Cleanup (${ticket.userId})`);
            ticket.deletionScheduledAt = null;
            await ticket.save();
        }
    }

    async cleanupAutoClose(now) {
        // Fetch all enabled autoClose configs in one query
        const configs = await TicketConfig.find({ 'autoClose.enabled': true }).select('guildId autoClose closeMode');
        if (!configs.length) return;

        // Build per-guild thresholds and run a single aggregated query
        // Group configs by their threshold to minimize queries (most will share the same hour value)
        const thresholdMap = new Map(); // threshold_ts -> [guildId, ...]
        for (const config of configs) {
            const timeoutMs = (config.autoClose.hours || 24) * 60 * 60 * 1000;
            const threshold = new Date(now.getTime() - timeoutMs);
            const key = threshold.getTime();
            if (!thresholdMap.has(key)) thresholdMap.set(key, { threshold, configs: [] });
            thresholdMap.get(key).configs.push(config);
        }

        for (const { threshold, configs: group } of thresholdMap.values()) {
            const guildIds = group.map(c => c.guildId);
            // Single query for ALL guilds in this group — eliminates N+1
            const inactiveTickets = await Ticket.find({
                guildId: { $in: guildIds },
                status: { $in: ['OPEN', 'PROCESSING', 'WAITING'] },
                lastActivityAt: { $lte: threshold }
            }).select('_id guildId channelId userId status');

            for (const ticket of inactiveTickets) {
                const config = group.find(c => c.guildId === ticket.guildId);
                if (!config) continue;

                logger.info(`[CleanupManager] Auto-closing inactive ticket ${ticket.channelId} in ${ticket.guildId}`);
                ticket.status = 'CLOSED';
                ticket.closedAt = now;
                ticket.closedBy = this.client.user.id;

                if (config.closeMode === 'DELETE') {
                    ticket.deletionScheduledAt = new Date(now.getTime() + 5000);
                }

                await ticket.save();

                const channel = await this.client.channels.cache.get(ticket.channelId)
                    || await this.client.channels.fetch(ticket.channelId).catch(() => null);
                if (channel) {
                    await messageService.send(channel, 'tickets', 'inactivity_close', {}).catch(() => {});
                }
            }
        }
    }

    async cleanupVoice(now) {
        // Ghost Active Sessions Cleanup — use cache first to avoid HTTP to Discord
        const activeSessions = await VoiceQueue.find({ status: 'ACTIVE' }).select('guildId userId voiceChannelId status');
        for (const session of activeSessions) {
            try {
                const guild = this.client.guilds.cache.get(session.guildId)
                    || await this.client.guilds.fetch(session.guildId).catch(() => null);
                if (guild) {
                    const channel = guild.channels.cache.get(session.voiceChannelId)
                        || await guild.channels.fetch(session.voiceChannelId).catch(() => null);
                    if (!channel) {
                        logger.warn(`[CleanupManager] Resolving ghost VoiceQueue session for user ${session.userId}`);
                        session.status = 'CANCELLED';
                        await session.save();
                    }
                }
            } catch (err) {}
        }

        // Scheduled Deletion Cleanup
        const sessions = await VoiceQueue.find({ deletionScheduledAt: { $lte: now } });
        for (const session of sessions) {
            await this.deleteChannel(session.guildId, session.voiceChannelId, `Voice Session Finished Cleanup (${session.userId})`);
            session.deletionScheduledAt = null;
            await session.save();
        }
    }

    async cleanupBackground(now) {
        const bgs = await Background.find({ deletionScheduledAt: { $lte: now } });
        for (const bg of bgs) {
            await this.deleteChannel(bg.guildId, bg.channelId, `Background Process Finished Cleanup (${bg.userId})`);
            bg.deletionScheduledAt = null;
            await bg.save();
        }
    }

    async cleanupSupport(now) {
        // Ghost Active Sessions Cleanup — use cache first
        const activeSessions = await SupportQueue.find({ status: 'ACTIVE' }).select('guildId userId voiceChannelId status');
        for (const session of activeSessions) {
            try {
                const guild = this.client.guilds.cache.get(session.guildId)
                    || await this.client.guilds.fetch(session.guildId).catch(() => null);
                if (guild) {
                    const channel = guild.channels.cache.get(session.voiceChannelId)
                        || await guild.channels.fetch(session.voiceChannelId).catch(() => null);
                    if (!channel) {
                        session.status = 'CANCELLED';
                        await session.save();
                    }
                }
            } catch (err) {}
        }

        // Scheduled Deletion Cleanup
        const sessions = await SupportQueue.find({ deletionScheduledAt: { $lte: now } });
        for (const session of sessions) {
            await this.deleteChannel(session.guildId, session.voiceChannelId, `Support Session Finished Cleanup (${session.userId})`);
            session.deletionScheduledAt = null;
            await session.save();
        }
    }

    async deleteChannel(guildId, channelId, reason) {
        if (!channelId) return;
        try {
            // Use cache first to avoid unnecessary HTTP calls to Discord
            const guild = this.client.guilds.cache.get(guildId)
                || await this.client.guilds.fetch(guildId).catch(() => null);
            if (!guild) {
                logger.warn(`[CleanupManager] Guild ${guildId} not found for channel deletion.`);
                return;
            }

            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (channel) {
                await channel.delete(reason).catch(err => {
                    logger.error(`[CleanupManager] FAILED to delete channel ${channelId} in ${guildId}:`, err.message);
                });
                logger.info(`[CleanupManager] Successfully deleted channel ${channelId} | Reason: ${reason}`);
            } else {
                logger.debug(`[CleanupManager] Channel ${channelId} already deleted or not found in guild ${guildId}.`);
            }
        } catch (error) {
            logger.error(`[CleanupManager] Error processing deletion for channel ${channelId}:`, error);
        }
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}

export default CleanupManager;
