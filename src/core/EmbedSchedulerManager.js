import mongoose from 'mongoose';
import ScheduledEmbed from '../models/ScheduledEmbed.js';
import { EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

class EmbedSchedulerManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    /**
     * Start the scheduler.
     * @param {number} intervalMs - Frequency of checks (default 60s)
     */
    start(intervalMs = 60000) {
        logger.info(`[EmbedScheduler] Started with interval: ${intervalMs}ms`);
        this.interval = setInterval(() => this.check(), intervalMs);
        // Run once immediately on start
        this.check();
    }

    async check() {
        if (mongoose.connection.readyState !== 1) return;
        try {
            const now = new Date();
            // Find embeds that are due: either not sent (one-off) OR recurring and past their scheduled time
            const pending = await ScheduledEmbed.find({
                scheduledAt: { $lte: now },
                $or: [
                    { sent: false, recurrence: 'none' },
                    { recurrence: { $ne: 'none' } }
                ]
            });

            if (pending.length === 0) return;

            logger.info(`[EmbedScheduler] Found ${pending.length} pending scheduled embeds.`);

            for (const item of pending) {
                if (this.client.multiBotManager && !this.client.multiBotManager.shouldHandle(item.guildId, this.client)) continue;
                try {
                    await this.sendEmbed(item);
                    
                    if (item.recurrence === 'none') {
                        item.sent = true;
                    } else {
                        // Update for next recurrence
                        item.lastSentAt = now;
                        item.scheduledAt = this.calculateNextRun(item.scheduledAt, item.recurrence);
                    }
                    
                    await item.save();
                    logger.info(`[EmbedScheduler] Handled ID: ${item._id} (Recurrence: ${item.recurrence})`);
                } catch (error) {
                    logger.error(`[EmbedScheduler] Failed to send scheduled embed ${item._id}:`, error.message);
                }
            }
        } catch (error) {
            logger.error('[EmbedScheduler] General Error in check loop:', error);
        }
    }

    calculateNextRun(currentScheduled, recurrence) {
        let next = new Date(currentScheduled);
        const now = new Date();
        
        while (next <= now) {
            switch (recurrence) {
                case 'daily':
                    next.setDate(next.getDate() + 1);
                    break;
                case 'weekly':
                    next.setDate(next.getDate() + 7);
                    break;
                case 'monthly':
                    next.setMonth(next.getMonth() + 1);
                    break;
                default:
                    return next;
            }
        }
        return next;
    }

    async sendEmbed(item) {
        const { channelId, embed, guildId } = item;
        
        const channel = await this.client.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            throw new Error(`Channel ${channelId} not found or inaccessible for guild ${guildId}`);
        }

        const discordEmbed = new EmbedBuilder();
        if (embed.title) discordEmbed.setTitle(embed.title);
        if (embed.description) discordEmbed.setDescription(embed.description);
        
        // Handle color (hex or standard string)
        if (embed.color) {
            discordEmbed.setColor(embed.color.startsWith('#') ? embed.color : '#5865F2');
        }
        
        if (embed.image) discordEmbed.setImage(embed.image);
        if (embed.thumbnail) discordEmbed.setThumbnail(embed.thumbnail);
        if (embed.footer) discordEmbed.setFooter({ text: embed.footer });
        
        if (embed.fields && Array.isArray(embed.fields)) {
            discordEmbed.addFields(embed.fields.filter(f => f.name && f.value));
        }

        const messageOptions = { embeds: [discordEmbed] };

        // --- BUTTON LOGIC ---
        if (embed.button && embed.button.label) {
            const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = await import('discord.js');
            
            const buttonStyle = embed.button.style === 'LINK' ? ButtonStyle.Link : (
                embed.button.style === 'SUCCESS' ? ButtonStyle.Success :
                embed.button.style === 'DANGER' ? ButtonStyle.Danger :
                embed.button.style === 'SECONDARY' ? ButtonStyle.Secondary : ButtonStyle.Primary
            );

            const button = new ButtonBuilder()
                .setLabel(embed.button.label)
                .setStyle(buttonStyle);

            if (embed.button.emoji) button.setEmoji(embed.button.emoji);
            
            if (embed.button.style === 'LINK') {
                if (embed.button.url) button.setURL(embed.button.url);
            } else {
                button.setCustomId(`scheduled_embed_btn_${Date.now()}`);
            }

            const row = new ActionRowBuilder().addComponents(button);
            messageOptions.components = [row];
        }

        await channel.send(messageOptions);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}

export default EmbedSchedulerManager;
