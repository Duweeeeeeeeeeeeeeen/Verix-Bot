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
        try {
            const now = new Date();
            const pending = await ScheduledEmbed.find({
                sent: false,
                scheduledAt: { $lte: now }
            });

            if (pending.length === 0) return;

            logger.info(`[EmbedScheduler] Found ${pending.length} pending scheduled embeds.`);

            for (const item of pending) {
                try {
                    await this.sendEmbed(item);
                    item.sent = true;
                    await item.save();
                    logger.info(`[EmbedScheduler] Successfully sent and marked as sent ID: ${item._id}`);
                } catch (error) {
                    logger.error(`[EmbedScheduler] Failed to send scheduled embed ${item._id}:`, error.message);
                }
            }
        } catch (error) {
            logger.error('[EmbedScheduler] General Error in check loop:', error);
        }
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

        await channel.send({ embeds: [discordEmbed] });
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}

export default EmbedSchedulerManager;
