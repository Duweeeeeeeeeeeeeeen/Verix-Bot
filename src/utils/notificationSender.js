/**
 * notificationSender.js
 * Sends notifications based on GlobalConfig rules for each event.
 * Supports: DM to user, message to configured channel.
 * Safe: never throws, always logs errors.
 */
import { getGlobalConfig } from '../core/globalConfigManager.js';
import logger from './logger.js';

/**
 * Event path mapping → GlobalConfig notification path
 */
const EVENT_MAP = {
    'whitelist.onSubmit': ['notifications', 'whitelist_onSubmit'],
    'whitelist.onAccept': ['notifications', 'whitelist_onAccept'],
    'whitelist.onReject': ['notifications', 'whitelist_onReject'],
    'tickets.onOpen':     ['notifications', 'tickets_onOpen'],
    'tickets.onClose':    ['notifications', 'tickets_onClose'],
};

const LOG_EVENT_MAP = {
    'whitelist.onSubmit':   'log_onSubmit',
    'whitelist.onAccept':   'log_onAccept',
    'whitelist.onReject':   'log_onReject',
    'tickets.onOpen':       'log_onOpen',
    'tickets.onClose':      'log_onClose',
    'voice.onVoiceStart':   'log_onVoiceStart',
    'voice.onVoiceEnd':     'log_onVoiceEnd',
};

/**
 * Send a notification based on GlobalConfig settings.
 *
 * @param {object} options
 * @param {string}             options.event     - Event key e.g. 'whitelist.onAccept'
 * @param {string}             options.guildId
 * @param {import('discord.js').Client} options.client
 * @param {import('discord.js').Guild}  options.guild
 * @param {import('discord.js').User}   [options.user]     - The target user for DM
 * @param {import('discord.js').EmbedBuilder} [options.embed] - Embed to send
 * @param {string}             [options.content] - Plain text to send (fallback)
 */
export async function sendNotification({ event, guildId, client, guild, user, embed, content }) {
    const result = {
        dm: { attempted: false, success: false, error: null },
        channel: { attempted: false, success: false, error: null }
    };

    try {
        const config = await getGlobalConfig(guildId);
        if (!config) return result;

        const path = EVENT_MAP[event];
        if (!path) return result;

        // Walk the nested path
        const eventConfig = path.reduce((obj, key) => obj?.[key], config);
        if (!eventConfig) return result;

        const payload = embed ? { embeds: [embed] } : { content: content || '' };

        // ── DM ──────────────────────────────────
        if (eventConfig.dm && user) {
            result.dm.attempted = true;
            try {
                await user.send(payload);
                result.dm.success = true;
            } catch (err) {
                result.dm.error = err.message;
                logger.warn(`[notificationSender] DM failed for ${user.tag} (${event}): ${err.message}`);
            }
        }

        // ── CHANNEL ─────────────────────────────
        if (eventConfig.channel && eventConfig.channelId) {
            result.channel.attempted = true;
            const channel = guild?.channels.cache.get(eventConfig.channelId);
            if (channel) {
                try {
                    await channel.send(payload);
                    result.channel.success = true;
                } catch (err) {
                    result.channel.error = err.message;
                    logger.warn(`[notificationSender] Channel send failed (${event}): ${err.message}`);
                }
            } else {
                result.channel.error = 'Channel not found';
                logger.warn(`[notificationSender] Channel ${eventConfig.channelId} not found for event ${event}`);
            }
        }

        return result;

    } catch (error) {
        logger.error(`[notificationSender] Error for event ${event}:`, error);
        return result;
    }
}

/**
 * Send a log entry to the GlobalConfig log channel if the event is enabled.
 *
 * @param {object} options
 * @param {string}  options.event    - Log event key e.g. 'whitelist.onSubmit'
 * @param {string}  options.guildId
 * @param {import('discord.js').Guild} options.guild
 * @param {import('discord.js').EmbedBuilder} [options.embed]
 * @param {string}  [options.content]
 */
export async function sendLog({ event, guildId, guild, embed, content }) {
    try {
        const config = await getGlobalConfig(guildId);
        if (!config?.logs?.enabled) return;

        const logKey = LOG_EVENT_MAP[event];
        if (!logKey) return;

        const isEnabled = config.logs.events?.[logKey];
        if (!isEnabled) return;

        const channelId = config.logs.channelId;
        if (!channelId) return;

        const channel = guild?.channels.cache.get(channelId);
        if (!channel) return;

        const payload = embed ? { embeds: [embed] } : { content: content || '' };
        await channel.send(payload).catch(err => {
            logger.warn(`[notificationSender] Log send failed (${event}): ${err.message}`);
        });

    } catch (error) {
        logger.error(`[notificationSender] Log error for event ${event}:`, error);
    }
}
