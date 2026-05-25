import { t } from '../locales/t.js';
import placeholderHelper from './placeholderHelper.js';

function extractMessageText(message) {
    if (typeof message === 'string') return message;
    if (!message || typeof message !== 'object') return null;

    const raw = message.toObject ? message.toObject() : message;
    return raw.content || raw.description || raw.title || null;
}

/**
 * Resolves a system message by checking module configuration overrides first,
 * then falling back to the localized default messages.
 * 
 * @param {Object} config - The module configuration object (e.g., TicketConfig)
 * @param {string} moduleName - The module key in defaultMessages (e.g., 'tickets')
 * @param {string} key - The specific message key (e.g., 'cooldown')
 * @param {string} lang - The language code ('it', 'en')
 * @param {Object} placeholders - Placeholders to replace in the message
 * @returns {string} The resolved and formatted message
 */
export function resolveSystemMessage(config, moduleName, key, lang, placeholders = {}) {
    // 1. Check for overrides in the new systemMessages Map
    let message = config?.systemMessages instanceof Map 
        ? config.systemMessages.get(key) 
        : config?.systemMessages?.[key];

    // 2. Check for legacy overrides if applicable (specific to some modules like Tickets)
    if (!message && config?.messages && config.messages[key]) {
        message = config.messages[key];
    }

    // 3. Fallback to default localized message
    if (!message) {
        // We look into the module's root for the key
        message = t(`${moduleName}.${key}`, lang, placeholders);
    }

    const text = extractMessageText(message) || `[Missing message: ${moduleName}.${key}]`;
    return placeholderHelper.replace(text, placeholders);
}

export default {
    resolve: resolveSystemMessage
};
