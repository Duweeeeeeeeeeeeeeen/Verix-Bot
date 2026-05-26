import { EmbedBuilder } from 'discord.js';
import logger from './logger.js';

/**
 * Sends a notification to a user via DM and/or a specific channel based on config.
 * @param {Object} guild - The Discord guild object.
 * @param {Object} member - The target guild member or user.
 * @param {Object} config - The notification configuration object.
 * @param {Object} payload - The message payload (embeds, content).
 * @returns {Promise<void>}
 */
export async function sendUserNotification(guild, member, config, payload) {
    if (!member) return;
    if (!config || config.mode === 'NONE') return;

    const { mode, channelId } = config;
    const canSendDM = mode === 'DM' || mode === 'BOTH';
    const canSendChannel = mode === 'CHANNEL' || mode === 'BOTH';

    // 1. Send DM
    if (canSendDM) {
        try {
            await member.send(payload);
        } catch (error) {
            logger.debug(`Could not send DM to ${member.id}: ${error.message}`);
            // If DM failed and mode was ONLY DM, fallback to channel if configured?
            // Usually, we just log it.
        }
    }

    // 2. Send to specific channel
    if (canSendChannel && channelId) {
        try {
            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (channel) {
                // Prepend mention to content if it's a channel notification
                const channelPayload = { ...payload };
                const mention = `<@${member.id}>`;
                
                if (channelPayload.content) {
                    channelPayload.content = `${mention} ${channelPayload.content}`;
                } else {
                    channelPayload.content = mention;
                }

                await channel.send(channelPayload);
            }
        } catch (error) {
            logger.error(`Error sending notification to channel ${channelId}:`, error);
        }
    }
}

export default {
    sendUserNotification
};
