import mongoose from 'mongoose';
import AutomationConfig from '../models/AutomationConfig.js';
import logger from '../utils/logger.js';
import { EmbedBuilder } from 'discord.js';

class AutomationManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
        // Map to track local message counts for performance before saving to DB
        this.messageBuffer = new Map(); 
    }

    /**
     * Starts the periodic Automation check.
     */
    start(intervalMs = 60000) {
        logger.info(`[AutomationManager] Started with check interval: ${intervalMs}ms`);
        this.interval = setInterval(() => this.run(), intervalMs);
        this.run(); // First run
    }

    async run() {
        if (mongoose.connection.readyState !== 1) return;
        const now = new Date();

        try {
            // Process Buffers first (flush local message counts to DB)
            await this.flushBuffers();

            const configs = await AutomationConfig.find({ 
                $or: [
                    { "autoClear.enabled": true },
                    { "autoMessage.enabled": true }
                ]
            });

            for (const config of configs) {
                let updated = false;

                // 1. Handle Auto Clear
                if (config.autoClear?.enabled) {
                    for (const slot of config.autoClear.slots) {
                        if (!slot.enabled) continue;

                        const intervalMs = slot.intervalMinutes * 60 * 1000;
                        const nextClearAt = slot.lastClearedAt 
                            ? new Date(slot.lastClearedAt.getTime() + intervalMs)
                            : new Date(0);

                        if (now >= nextClearAt) {
                            const success = await this.clearChannel(config.guildId, slot.channelId, slot.amount);
                            if (success) {
                                slot.lastClearedAt = now;
                                updated = true;
                            }
                        }
                    }
                }

                // 2. Handle Auto Message (Time-based)
                if (config.autoMessage?.enabled) {
                    for (const slot of config.autoMessage.slots) {
                        if (!slot.enabled || slot.triggerType !== 'TIME') continue;

                        const intervalMs = slot.triggerValue * 60 * 1000;
                        const nextMsgAt = slot.lastTriggeredAt 
                            ? new Date(slot.lastTriggeredAt.getTime() + intervalMs)
                            : new Date(0);

                        if (now >= nextMsgAt) {
                            const success = await this.sendMessage(config.guildId, slot.channelId, slot);
                            if (success) {
                                slot.lastTriggeredAt = now;
                                updated = true;
                            }
                        }
                    }
                }

                if (updated) {
                    await config.save();
                }
            }
        } catch (error) {
            logger.error('[AutomationManager] General Execution Error:', error);
        }
    }

    /**
     * Handles incoming messages to track count-based triggers.
     */
    async handleMessage(message) {
        if (!message.guild || message.author.bot) return;

        const key = `${message.guild.id}:${message.channel.id}`;
        const current = this.messageBuffer.get(key) || 0;
        this.messageBuffer.set(key, current + 1);

        // Check if we should trigger message-count based automations immediately or wait for flush
        // For responsiveness, let's check here
        this.checkMessageCountTrigger(message.guild.id, message.channel.id);
    }

    async checkMessageCountTrigger(guildId, channelId) {
        try {
            const config = await AutomationConfig.findOne({ 
                guildId, 
                "autoMessage.enabled": true,
                "autoMessage.slots": { 
                    $elemMatch: { 
                        channelId, 
                        triggerType: 'MESSAGES', 
                        enabled: true 
                    } 
                }
            });

            if (!config) return;

            let updated = false;
            for (const slot of config.autoMessage.slots) {
                if (slot.channelId === channelId && slot.enabled && slot.triggerType === 'MESSAGES') {
                    const key = `${guildId}:${channelId}`;
                    const buffered = this.messageBuffer.get(key) || 0;
                    
                    if (slot.messageCountSinceLast + buffered >= slot.triggerValue) {
                        const success = await this.sendMessage(guildId, channelId, slot);
                        if (success) {
                            // Reset count immediately in DB to avoid race conditions
                            await AutomationConfig.updateOne(
                                { guildId, "autoMessage.slots.id": slot.id },
                                { $set: { "autoMessage.slots.$.messageCountSinceLast": 0, "autoMessage.slots.$.lastTriggeredAt": new Date() } }
                            );
                            this.messageBuffer.set(key, 0); // Reset buffer
                            // No need to set updated = true for config.save() later as we updated DB already
                        }
                    }
                }
            }

            if (updated) await config.save();
        } catch (error) {
            logger.error('[AutomationManager] Error checking message count trigger:', error);
        }
    }

    async flushBuffers() {
        if (this.messageBuffer.size === 0) return;

        for (const [key, count] of this.messageBuffer.entries()) {
            const [guildId, channelId] = key.split(':');
            try {
                await AutomationConfig.updateOne(
                    { guildId, "autoMessage.slots.channelId": channelId },
                    { $inc: { "autoMessage.slots.$.messageCountSinceLast": count } }
                );
            } catch (err) {
                logger.error(`[AutomationManager] Buffer flush error for ${key}:`, err);
            }
        }
        this.messageBuffer.clear();
    }

    async clearChannel(guildId, channelId, amount) {
        try {
            const guild = this.client.guilds.cache.get(guildId) || await this.client.guilds.fetch(guildId).catch(() => null);
            if (!guild) return false;

            const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
            if (!channel || !channel.isTextBased()) return false;

            const fetched = await channel.messages.fetch({ limit: Math.min(amount, 100) });
            if (fetched.size > 0) {
                const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                const deletableMessages = fetched.filter(m => m.createdAt > twoWeeksAgo);

                if (deletableMessages.size > 0) {
                    await channel.bulkDelete(deletableMessages, true);
                    logger.info(`[AutomationManager] Auto-Clear: Deleted ${deletableMessages.size} messages in ${channel.name} (${guild.name})`);
                }
            }
            return true;
        } catch (error) {
            logger.error(`[AutomationManager] Auto-Clear Error in channel ${channelId}:`, error);
            return false;
        }
    }

    async sendMessage(guildId, channelId, slot) {
        try {
            const guild = this.client.guilds.cache.get(guildId) || await this.client.guilds.fetch(guildId).catch(() => null);
            if (!guild) return false;

            const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
            if (!channel || !channel.isTextBased()) return false;

            const messageOptions = {};

            if (slot.useEmbed && slot.embed) {
                const embed = new EmbedBuilder();
                if (slot.embed.title) embed.setTitle(slot.embed.title);
                if (slot.embed.description) embed.setDescription(slot.embed.description);
                if (slot.embed.color) embed.setColor(slot.embed.color);
                if (slot.embed.thumbnail) embed.setThumbnail(slot.embed.thumbnail);
                if (slot.embed.image) embed.setImage(slot.embed.image);
                if (slot.embed.footerText) embed.setFooter({ text: slot.embed.footerText, iconURL: slot.embed.footerIcon });
                if (slot.embed.authorName) embed.setAuthor({ name: slot.embed.authorName, iconURL: slot.embed.authorIcon });
                if (slot.embed.timestamp) embed.setTimestamp();
                
                if (slot.embed.fields && Array.isArray(slot.embed.fields)) {
                    slot.embed.fields.forEach(f => {
                        if (f.name && f.value) embed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                    });
                }

                messageOptions.embeds = [embed];
            } else {
                messageOptions.content = slot.content;
            }

            if (!messageOptions.content && (!messageOptions.embeds || messageOptions.embeds.length === 0)) {
                return false;
            }

            await channel.send(messageOptions);
            logger.info(`[AutomationManager] Auto-Message: Sent message to ${channel.name} (${guild.name})`);
            return true;
        } catch (error) {
            logger.error(`[AutomationManager] Auto-Message Error in channel ${channelId}:`, error);
            return false;
        }
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}

export default AutomationManager;
