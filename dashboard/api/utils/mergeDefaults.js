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

    /**
     * Helper to deep merge an embed object
     */
    const mergeEmbed = (dbEmbed, defEmbed) => {
        if (!defEmbed) return dbEmbed || {};
        const db = dbEmbed || {};
        
        // Helper to check if a string is effectively empty
        const isEmpty = (s) => !s || s.trim() === '';

        return {
            ...defEmbed,
            ...db,
            title: !isEmpty(db.title) ? db.title : (defEmbed.title || 'Senza Titolo'),
            description: !isEmpty(db.description) ? db.description : (defEmbed.description || 'Nessun contenuto impostato.'),
            color: db.color || defEmbed.color || '#5865F2',
            footer: !isEmpty(db.footer) ? db.footer : (defEmbed.footer || ''),
            enabled: db.enabled !== undefined ? db.enabled : (defEmbed.enabled !== undefined ? defEmbed.enabled : true)
        };
    };

    // Specialized Module Merging
    if (result.embeds && typeof result.embeds === 'object') {
        for (const [key, defValue] of Object.entries(defaults)) {
            const isEmbed = defValue && typeof defValue === 'object' && (defValue.title || defValue.description);
            if (isEmbed) {
                result.embeds[key] = mergeEmbed(result.embeds[key], defValue);
            }
        }
    }

    // FIVEM: Handle nested servers array
    if (moduleName === 'fivem' && result.servers && Array.isArray(result.servers)) {
        result.servers = result.servers.map(server => {
            return {
                ...server,
                onlineEmbed: mergeEmbed(server.onlineEmbed, defaults.status_embed),
                offlineEmbed: mergeEmbed(server.offlineEmbed, defaults.offline_embed)
            };
        });
    }

    // UNIVERSAL: Handle panel.embed if present (Tickets, Verify, Photo Contest)
    if (result.panel && typeof result.panel === 'object' && result.panel.embed) {
        result.panel.embed = mergeEmbed(result.panel.embed, defaults.panel);
    }

    // WELCOME: Handle nested welcome/leave objects
    if (moduleName === 'welcome') {
        if (result.welcome) {
            result.welcome.embed = mergeEmbed(result.welcome.embed, defaults.join);
        }
        if (result.leave) {
            result.leave.embed = mergeEmbed(result.leave.embed, defaults.leave);
        }
    }

    // --- Generic Merging fallback ---
    for (const [key, value] of Object.entries(defaults)) {
        // Skip if already handled by specialized logic
        if (result.embeds && result.embeds[key]) continue;
        if (key === 'embedSettings' && moduleName === 'photocontest') {
             result.embedSettings = mergeEmbed(result.embedSettings, value);
             continue;
        }

        // Handle empty arrays for themes or other lists
        if (Array.isArray(value) && (!result[key] || (Array.isArray(result[key]) && result[key].length === 0))) {
            result[key] = value;
            continue;
        }

        // If it's an embed-like object in defaults
        const isEmbed = value && typeof value === 'object' && (value.title || value.description);
        
        if (isEmbed) {
            // If the key exists in result and looks like it should be an embed
            if (result[key] && typeof result[key] === 'object') {
                result[key] = mergeEmbed(result[key], value);
            } else if (result[key] === undefined) {
                // If it's missing in result, add it from defaults
                result[key] = value;
            }
        } else if (result[key] === undefined) {
            // Generic non-embed defaults
            result[key] = value;
        }
    }

    return result;
}
