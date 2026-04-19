import GlobalConfig from '../models/GlobalConfig.js';
import logger from '../utils/logger.js';

// ─────────────────────────────────────────────
// In-memory cache with TTL
// ─────────────────────────────────────────────
const cache = new Map();
const TTL = 300_000; // 5 minutes

/**
 * Load and cache the GlobalConfig for a guild.
 * @param {string} guildId
 */
export async function getGlobalConfig(guildId) {
    const cacheKey = `global:${guildId}`;
    const now = Date.now();

    const cached = cache.get(cacheKey);
    if (cached && cached.expires > now) {
        return cached.data;
    }

    try {
        let config = await GlobalConfig.findOne({ guildId });
        if (!config) {
            config = await GlobalConfig.create({ guildId });
            logger.info(`[GlobalConfig] Created default config for guild ${guildId}`);
        }

        cache.set(cacheKey, { data: config, expires: now + TTL });
        return config;
    } catch (error) {
        logger.error(`[GlobalConfig] Error loading config for guild ${guildId}:`, error);
        return buildFallback(guildId);
    }
}

export function invalidateGlobalCache(guildId) {
    const key = `global:${guildId}`;
    if (cache.has(key)) {
        cache.delete(key);
        logger.info(`[GlobalConfig] Cache invalidated for guild ${guildId}`);
    }
}

/**
 * Fallback Mirroring the NEW FLAT SCHEMA
 */
function buildFallback(guildId) {
    return {
        guildId,
        ui: {
            whitelistButtons: [
                { customId: 'apply_whitelist', label: 'Inizia Candidatura', emoji: '📋', style: 'PRIMARY', enabled: true },
                { customId: 'confirm_wl', label: 'Conferma', emoji: '✅', style: 'SUCCESS', enabled: true },
                { customId: 'cancel_wl', label: 'Annulla', emoji: '❌', style: 'DANGER', enabled: true }
            ],
            ticketButtons: [
                { customId: 'tk_claim', label: 'Assumi', emoji: '🙋‍♂️', style: 'SUCCESS', enabled: true },
                { customId: 'tk_close', label: 'Chiudi', emoji: '🔒', style: 'DANGER', enabled: true },
                { customId: 'tk_quick_reply', label: 'Risposte Rapide', emoji: '📝', style: 'PRIMARY', enabled: true },
                { customId: 'tk_tag', label: 'Tagga', emoji: '🏷️', style: 'SECONDARY', enabled: true },
                { customId: 'tk_transcript', label: 'Logs', emoji: '📄', style: 'SECONDARY', enabled: true }
            ],
            voiceButtons: [
                { customId: 'approve_voice', label: 'Accetta', emoji: '✅', style: 'SUCCESS', enabled: true },
                { customId: 'deny_voice', label: 'Rifiuta', emoji: '❌', style: 'DANGER', enabled: true },
                { customId: 'reset_timer_voice', label: 'Riavvia Timer', emoji: '⏱️', style: 'SECONDARY', enabled: true }
            ]
        },
        notifications: {
            whitelist_onSubmit: { dm: true, channel: false, channelId: null },
            whitelist_onAccept: { dm: true, channel: false, channelId: null },
            whitelist_onReject: { dm: true, channel: false, channelId: null },
            tickets_onOpen:     { dm: false, channel: false, channelId: null },
            tickets_onClose:    { dm: false, channel: false, channelId: null }
        },
        logs: {
            enabled: true,
            channelId: null,
            log_onSubmit: true,
            log_onAccept: true,
            log_onReject: true,
            log_onOpen: true,
            log_onClose: true,
            log_onVoiceStart: true,
            log_onVoiceEnd: false
        },
        naming: {
            voiceChannel: 'wl-{user}',
            ticket: '{emoji}-{type}-{user}'
        }
    };
}
