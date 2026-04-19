import { registry, resolveModule } from './moduleRegistry.js';
import logger from '../utils/logger.js';

// In-memory cache for module states: { guildId: { moduleName: { enabled: bool, timestamp: number } } }
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes in milliseconds

/**
 * Checks if a specific module is enabled for a guild.
 * Uses cache first, then falls back to database.
 */
export async function isModuleEnabled(guildId, moduleName) {
    // 1. Core 'admin' module is always enabled
    if (moduleName === 'admin') return true;
    
    const config = registry[moduleName];
    if (!config) return false; // Unknown module
    if (!config.model) return true; // Modules without config models are enabled by default

    // 2. Check Cache
    const guildCache = cache.get(guildId) || {};
    const moduleState = guildCache[moduleName];

    if (moduleState && (Date.now() - moduleState.timestamp < CACHE_TTL)) {
        return moduleState.enabled;
    }

    // 3. Database Fetch
    try {
        const moduleConfig = await config.model.findOne({ guildId });
        // If not configured, we assume it's disabled or uses defaults (depending on RP policy)
        // Here we default to true if the record exists and enabled is true, or false otherwise
        const isEnabled = moduleConfig ? moduleConfig.enabled : false;

        // 4. Update Cache
        guildCache[moduleName] = {
            enabled: isEnabled,
            timestamp: Date.now()
        };
        cache.set(guildId, guildCache);

        return isEnabled;
    } catch (error) {
        logger.error(`Error checking module state (${moduleName}) for guild ${guildId}:`, error);
        return false; // Safe fallback
    }
}

/**
 * Clears the cache for a specific guild or all guilds.
 * To be called when dashboard settings are updated (if bot and dashboard share memory, 
 * otherwise TTL handles propagation).
 */
export function clearModuleCache(guildId = null) {
    if (guildId) {
        cache.delete(guildId);
    } else {
        cache.clear();
    }
}

export { resolveModule };
