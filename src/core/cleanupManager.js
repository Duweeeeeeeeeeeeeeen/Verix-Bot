import WhitelistApp from '../models/WhitelistApp.js';
import Ticket from '../models/Ticket.js';
import VoiceQueue from '../models/VoiceQueue.js';
import Background from '../models/Background.js';
import logger from '../utils/logger.js';

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
        const now = new Date();
        try {
            await Promise.all([
                this.cleanupWhitelist(now),
                this.cleanupTickets(now),
                this.cleanupVoice(now),
                this.cleanupBackground(now)
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
        for (const ticket of tickets) {
            await this.deleteChannel(ticket.guildId, ticket.channelId, `Ticket Closed Cleanup (${ticket.userId})`);
            ticket.deletionScheduledAt = null;
            await ticket.save();
        }
    }

    async cleanupVoice(now) {
        // Ghost Active Sessions Cleanup
        const activeSessions = await VoiceQueue.find({ status: 'ACTIVE' });
        for (const session of activeSessions) {
            try {
                const guild = await this.client.guilds.fetch(session.guildId).catch(() => null);
                if (guild) {
                    const channel = await guild.channels.fetch(session.voiceChannelId).catch(() => null);
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

    async deleteChannel(guildId, channelId, reason) {
        if (!channelId) return;
        try {
            const guild = await this.client.guilds.fetch(guildId).catch(() => null);
            if (!guild) return;

            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (channel) {
                await channel.delete(reason).catch(err => {
                    logger.warn(`[CleanupManager] Failed to delete channel ${channelId} in ${guildId}:`, err.message);
                });
                logger.info(`[CleanupManager] Deleted channel ${channelId} | Reason: ${reason}`);
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
