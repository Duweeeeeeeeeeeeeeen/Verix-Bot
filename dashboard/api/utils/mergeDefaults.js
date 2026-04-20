import defaultMessages from '../../../src/locales/defaultMessages.js';

/**
 * Merges database configuration with professional defaults.
 * @param {string} moduleName - Name of the module (e.g., 'whitelist', 'tickets')
 * @param {Object} dbConfig - Configuration object from the database
 * @returns {Object} - Merged configuration
 */
export function mergeModuleDefaults(moduleName, dbConfig) {
    if (!dbConfig) return defaultMessages[moduleName] || {};
    
    const defaults = defaultMessages[moduleName] || {};
    // Extract plain object if it's a Mongoose document
    const result = typeof dbConfig.toObject === 'function' ? dbConfig.toObject() : { ...dbConfig };

    // --- Specialized Module Merging ---

    // FIVEM: Handle nested servers array
    if (moduleName === 'fivem' && result.servers && Array.isArray(result.servers)) {
        result.servers = result.servers.map(server => {
            return {
                ...server,
                onlineEmbed: { 
                    ...(defaults.status_embed || {}), // Flat lookup
                    ...(server.onlineEmbed || {}) 
                },
                offlineEmbed: { 
                    ...(defaults.offline_embed || {}), // Flat lookup
                    ...(server.offlineEmbed || {}) 
                }
            };
        });
    }

    // WELCOME: Handle nested welcome/leave objects
    if (moduleName === 'welcome') {
        if (result.welcome) {
            result.welcome.embed = {
                ...(defaults.join || {}), // Flat lookup
                ...(result.welcome.embed || {})
            };
        }
        if (result.leave) {
            result.leave.embed = {
                ...(defaults.leave || {}), // Flat lookup
                ...(result.leave.embed || {})
            };
        }
    }

    // --- Generic Merging (for Whitelist, Tickets, Verify, etc.) ---

    // Merge embed-like objects into result.embeds if it exists
    if (result.embeds && typeof result.embeds === 'object') {
        for (const [key, value] of Object.entries(defaults)) {
            // If it looks like an embed (has title or description)
            if (value && typeof value === 'object' && (value.title || value.description)) {
                result.embeds[key] = {
                    ...value,
                    ...(result.embeds[key] || {})
                };
            }
        }
    }

    // Merge any other root-level defaults (non-embeds)
    for (const [key, value] of Object.entries(defaults)) {
        if (result[key] === undefined) {
            // If not an embed that was already merged into result.embeds, or if result root needs it
            const isEmbed = value && typeof value === 'object' && (value.title || value.description);
            if (!isEmbed || !result.embeds) {
                result[key] = value;
            }
        }
    }

    return result;
}
