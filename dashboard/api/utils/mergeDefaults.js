import { getDefaultMessages } from '../../../src/locales/t.js';

/**
 * Merges database configuration with professional defaults.
 * @param {string} moduleName - Name of the module (e.g., 'whitelist', 'tickets')
 * @param {Object} dbConfig - Configuration object from the database
 * @param {string} lang - Language code ('it' or 'en')
 * @returns {Object} - Merged configuration
 */
export function mergeModuleDefaults(moduleName, dbConfig, lang = 'en') {
    const defaultMessages = getDefaultMessages(lang);
    if (!dbConfig) return defaultMessages[moduleName] || {};
    
    const defaults = defaultMessages[moduleName] || {};
    // Extract plain object if it's a Mongoose document
    const result = typeof dbConfig.toObject === 'function' ? dbConfig.toObject({ flattenMaps: true }) : JSON.parse(JSON.stringify(dbConfig));
    
    if (moduleName === 'tickets') {
        console.log(`[DEBUG] Merging Tickets: Found ${Object.keys(result.typesConfig || {}).length} categories in DB`);
    }

    /**
     * Helper to deep merge an embed object
     */
    const mergeEmbed = (dbEmbed, defEmbed) => {
        if (!defEmbed) return dbEmbed || {};
        const db = dbEmbed || {};
        
        // Helper to check if a value is a generic placeholder
        const isPlaceholder = (val) => !val || val.trim() === '' || val === 'Senza Titolo' || val === 'Nessun contenuto impostato.';

        return {
            ...defEmbed,
            ...db,
            title: !isPlaceholder(db.title) ? db.title : (defEmbed.title || '⚠️ Protocollo Titolo Mancante'),
            description: !isPlaceholder(db.description) ? db.description : (defEmbed.description || 'Nessun contenuto informativo rilevato nei registri.'),
            color: db.color || defEmbed.color || '#5865F2',
            footer: !isPlaceholder(db.footer) ? db.footer : (defEmbed.footer || ''),
            enabled: db.enabled !== undefined ? db.enabled : (defEmbed.enabled !== undefined ? defEmbed.enabled : true)
        };
    };

    // Specialized Module Merging
    // Ensure result.embeds exists if defaults have them
    if (!result.embeds) result.embeds = {};

    for (const [key, defValue] of Object.entries(defaults)) {
        const isEmbed = defValue && typeof defValue === 'object' && (defValue.title || defValue.description);
        if (isEmbed) {
            // Check if it's a top-level embed or nested in .embeds
            if (result.embeds && result.embeds[key]) {
                result.embeds[key] = mergeEmbed(result.embeds[key], defValue);
            } else if (result[key] && typeof result[key] === 'object' && result[key].title) {
                 result[key] = mergeEmbed(result[key], defValue);
            } else if (result.embeds && result.embeds[key] === undefined) {
                 result.embeds[key] = defValue;
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
        // Handle arrays (themes, etc.)
        if (Array.isArray(value)) {
            if (!result[key] || (Array.isArray(result[key]) && result[key].length === 0)) {
                result[key] = value;
            }
            continue;
        }

        // Handle nested objects (voiceSettings, typesConfig, etc.)
        if (value && typeof value === 'object' && !value.title && !value.description) {
            const dbValue = result[key] instanceof Map ? Object.fromEntries(result[key]) : (result[key] || {});
            
            // Special case for typesConfig: deep merge each category to avoid losing fields or resetting colors
            if (key === 'typesConfig') {
                const dbCategories = dbValue || {};
                const defaultCategories = value || {};
                
                // Get union of all category keys
                const allKeys = Array.from(new Set([...Object.keys(defaultCategories), ...Object.keys(dbCategories)]));
                
                const mergedTypes = {};
                for (const tKey of allKeys) {
                    const defaultValue = defaultCategories[tKey] || {};
                    const dbValueObj = dbCategories[tKey] || {};
                    
                    // Merge: DB overrides defaults
                    mergedTypes[tKey] = { 
                        ...defaultValue, 
                        ...dbValueObj 
                    };
                }
                result[key] = mergedTypes;
                continue;
            }

            result[key] = { ...value, ...dbValue };
            continue;
        }

        // Handle embeds not in .embeds object
        const isEmbed = value && typeof value === 'object' && (value.title || value.description);
        if (isEmbed) {
            if (result[key] && typeof result[key] === 'object') {
                result[key] = mergeEmbed(result[key], value);
            } else if (result[key] === undefined && (!result.embeds || result.embeds[key] === undefined)) {
                result[key] = value;
            }
        } else if (result[key] === undefined) {
            result[key] = value;
        }
    }

    return result;
}
