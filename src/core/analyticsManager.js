import GuildStats from '../models/GuildStats.js';
import logger from '../utils/logger.js';

export class AnalyticsManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    start(intervalMs = 3600000) { // Every hour by default
        this.collect();
        this.interval = setInterval(() => this.collect(), intervalMs);
        logger.info(`[AnalyticsManager] Started collection every ${intervalMs / 60000} minutes.`);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async collect() {
        try {
            const guilds = this.client.guilds.cache;
            const snapshots = [];

            for (const [guildId, guild] of guilds) {
                snapshots.push({
                    guildId,
                    memberCount: guild.memberCount,
                    onlineCount: guild.members.cache.filter(m => m.presence?.status && m.presence.status !== 'offline').size
                });
            }

            if (snapshots.length > 0) {
                await GuildStats.insertMany(snapshots);
                logger.debug(`[AnalyticsManager] Collected stats for ${snapshots.length} guilds.`);
            }
        } catch (error) {
            logger.error('[AnalyticsManager] Error collecting stats:', error);
        }
    }
}

export default AnalyticsManager;
