import mongoose from 'mongoose';
import AutoClearConfig from '../models/AutoClearConfig.js';
import logger from '../utils/logger.js';

class AutoClearManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    /**
     * Starts the periodic AutoClear check.
     * Checks every 1 minute.
     */
    start(intervalMs = 60000) {
        logger.info(`[AutoClearManager] Started with check interval: ${intervalMs}ms`);
        this.interval = setInterval(() => this.run(), intervalMs);
        this.run(); // First run
    }

    async run() {
        if (mongoose.connection.readyState !== 1) return;
        const now = new Date();

        try {
            const configs = await AutoClearConfig.find({ "slots.enabled": true });

            for (const config of configs) {
                let updated = false;

                for (let i = 0; i < config.slots.length; i++) {
                    const slot = config.slots[i];
                    if (!slot.enabled) continue;

                    const intervalMs = slot.intervalMinutes * 60 * 1000;
                    const nextClearAt = slot.lastClearedAt 
                        ? new Date(slot.lastClearedAt.getTime() + intervalMs)
                        : new Date(0); // If never cleared, clear immediately

                    if (now >= nextClearAt) {
                        // Time to clear!
                        const success = await this.clearChannel(config.guildId, slot.channelId, slot.amount);
                        
                        if (success) {
                            slot.lastClearedAt = now;
                            updated = true;
                        }
                    }
                }

                if (updated) {
                    await config.save();
                }
            }
        } catch (error) {
            logger.error('[AutoClearManager] General Execution Error:', error);
        }
    }

    async clearChannel(guildId, channelId, amount) {
        try {
            // Use cache first to avoid unnecessary HTTP calls to Discord
            const guild = this.client.guilds.cache.get(guildId)
                || await this.client.guilds.fetch(guildId).catch(() => null);
            if (!guild) return false;

            const channel = guild.channels.cache.get(channelId)
                || await guild.channels.fetch(channelId).catch(() => null);
            if (!channel || channel.type !== 0) return false; // Ensure it's a text channel

            // Discord API limits bulkDelete to 14 days old max, and up to 100 per call.
            const fetched = await channel.messages.fetch({ limit: Math.min(amount, 100) });
            
            if (fetched.size > 0) {
                // Filter messages older than 14 days as bulkDelete will throw an error
                const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                const deletableMessages = fetched.filter(m => m.createdAt > twoWeeksAgo);

                if (deletableMessages.size > 0) {
                    await channel.bulkDelete(deletableMessages, true);
                    logger.info(`[AutoClearManager] Deleted ${deletableMessages.size} messages in ${channel.name} (${guild.name})`);
                } else {
                     // Even if there are messages, none are deletable. We still return true to update the timestamp and not get stuck.
                     logger.debug(`[AutoClearManager] Skipped deletion in ${channel.name} (${guild.name}) - all messages older than 14 days.`);
                }
            }
            return true;
        } catch (error) {
            if (error.code === 10008) { // Unknown Message
                logger.debug(`[AutoClearManager] Ignored Unknown Message error in channel ${channelId}`);
                return true; // We can still return true to update the timer
            }
            if (error.code === 50034) { // Messages too old
                logger.warn(`[AutoClearManager] Failed to delete messages in ${channelId} - messages too old.`);
                return true; // Return true to advance timer
            }
            logger.error(`[AutoClearManager] Error deleting messages in channel ${channelId}:`, error);
            return false;
        }
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}

export default AutoClearManager;
