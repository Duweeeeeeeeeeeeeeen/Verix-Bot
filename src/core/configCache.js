import mongoose from 'mongoose';
import { registry } from './moduleRegistry.js';
import logger from '../utils/logger.js';

// Internal Map for caching: key = guildId + moduleName
const cache = new Map();
const TTL = 300000; // Increase TTL to 5 minutes now that we have invalidation

/**
 * Retrieves the module configuration, using cache when available.
 * @param {string} guildId 
 * @param {string} moduleName 
 * @returns {Promise<{enabled: boolean} | null>}
 */
export async function getModuleConfig(guildId, moduleName) {
    if (moduleName === 'admin') return { enabled: true };
    if (mongoose.connection.readyState !== 1) return { enabled: true }; // Default to true if DB is down to avoid blocking core events

    const cacheKey = `${guildId}:${moduleName}`;
    const now = Date.now();

    const cached = cache.get(cacheKey);
    if (cached && cached.expires > now) {
        return cached.data;
    }

    const moduleInfo = registry[moduleName];
    if (!moduleInfo) return null;

    try {
        if (!moduleInfo.model) {
            const data = { enabled: true };
            cache.set(cacheKey, { data, expires: now + TTL });
            return data;
        }

        // Use a timeout to prevent hanging interactions (max 2s for DB)
        const dbPromise = moduleInfo.model.findOne({ guildId });
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('DB Timeout')), 2000)
        );

        const config = await Promise.race([dbPromise, timeoutPromise]).catch(err => {
            logger.warn(`[Cache] DB Timeout or error for ${moduleName}: ${err.message}`);
            return { enabled: true }; // Fallback to enabled on timeout
        });

        const data = { enabled: config ? config.enabled !== false : true };
        
        if (data.enabled === false) {
            logger.warn(`[Cache] Module ${moduleName} is DISABLED for guild ${guildId} (Record found: ${!!config})`);
        }

        cache.set(cacheKey, { data, expires: now + TTL });
        return data;

    } catch (error) {
        logger.error(`[Cache] Error fetching config for ${moduleName}:`, error);
        return { enabled: true }; // Safe fallback
    }
}

/**
 * Invalidates all cache entries for a specific guild.
 * @param {string} guildId 
 */
export function invalidateCache(guildId) {
    let count = 0;
    for (const key of cache.keys()) {
        if (key.startsWith(`${guildId}:`)) {
            cache.delete(key);
            count++;
        }
    }
    if (count > 0) logger.info(`[Cache] Invalidated ${count} entries for guild ${guildId}`);
}

/**
 * Manually updates the cache for a specific module.
 * @param {string} guildId 
 * @param {string} moduleName 
 * @param {object} data 
 */
export function updateModuleCache(guildId, moduleName, data) {
    const cacheKey = `${guildId}:${moduleName}`;
    cache.set(cacheKey, {
        data: data,
        expires: Date.now() + TTL
    });
    logger.info(`[Cache] Manually updated ${moduleName} for guild ${guildId}`);
}
