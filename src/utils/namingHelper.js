/**
 * namingHelper.js
 * Resolves naming templates from GlobalConfig, replacing placeholders.
 * Supported placeholders: {user}, {id}, {type}, {emoji}
 * Falls back to hardcoded defaults if no template is configured.
 */
import { getGlobalConfig } from '../core/globalConfigManager.js';
import placeholderHelper from './placeholderHelper.js';
import logger from './logger.js';

const DEFAULTS = {
    voiceChannel: 'wl-{user}',
    ticket: '{emoji}-{type}-{user}'
};

/**
 * Resolve a template string by replacing placeholders with real values.
 * @param {string} template - The template string e.g. "wl-{user}"
 * @param {object} vars - Values to inject e.g. { user: 'mario', id: '123' }
 * @returns {string}
 */
function resolve(template, vars = {}) {
    // Case-insensitive replacement using central helper
    const result = placeholderHelper.replace(template, {
        user: vars.user || 'user',
        id: vars.id || '0',
        type: vars.type || 'generale',
        emoji: vars.emoji || '',
        count: vars.count !== undefined ? String(vars.count) : '0'
    });

    // Sanitize the result to be Discord-channel-name safe (lowercase, no spaces)
    // We allow brackets [] and numbers if requested, but Discord will lowercase them anyway.
    return result
        .replace(/\s+/g, '-')
        .toLowerCase()
        .replace(/[^a-z0-9\-_#\[\]]/g, '') // Keep alphanumeric, dash, underscore, hash, and brackets
        .slice(0, 100); // Discord channel name max length
}

/**
 * Resolve the name for a whitelist voice channel.
 * @param {string} guildId
 * @param {{ user: string, id?: string, count?: number }} vars
 * @param {string} [customTemplate] - Optional template to override config
 * @returns {Promise<string>}
 */
export async function resolveVoiceChannelName(guildId, vars, customTemplate = null) {
    try {
        if (customTemplate) return resolve(customTemplate, vars);
        
        const config = await getGlobalConfig(guildId);
        const template = config?.naming?.voiceChannel || DEFAULTS.voiceChannel;
        return resolve(template, vars);
    } catch (error) {
        logger.warn(`[namingHelper] Fallback to default voice name: ${error.message}`);
        return resolve(DEFAULTS.voiceChannel, vars);
    }
}

/**
 * Resolve the name for a ticket channel.
 * @param {string} guildId
 * @param {{ user: string, id?: string, type?: string, emoji?: string }} vars
 * @returns {Promise<string>}
 */
export async function resolveTicketName(guildId, vars) {
    try {
        const config = await getGlobalConfig(guildId);
        const template = config?.naming?.ticket || DEFAULTS.ticket;
        return resolve(template, vars);
    } catch (error) {
        logger.warn(`[namingHelper] Fallback to default ticket name: ${error.message}`);
        return resolve(DEFAULTS.ticket, vars);
    }
}

/**
 * Preview a naming template with example data (for dashboard).
 * Does NOT need a guildId — used client-side only.
 * @param {string} template
 * @param {object} [vars]
 * @returns {string}
 */
export function previewTemplate(template, vars = {}) {
    const defaults = { user: 'mario_rossi', id: '12345', type: 'supporto', emoji: '🟢' };
    return resolve(template, { ...defaults, ...vars });
}
