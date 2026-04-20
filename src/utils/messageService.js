import { EmbedBuilder } from 'discord.js';
import MessageConfig from '../models/MessageConfig.js';
import defaultMessages from '../locales/defaultMessages.js';
import { replacePlaceholders } from './embedHelper.js';
import logger from './logger.js';

class MessageService {
    constructor() {
        this.cache = new Map(); // guildId_module -> messages
        this.cacheTTL = 10 * 60 * 1000; // 10 minutes
        this.cacheTimestamps = new Map();
    }

    /**
     * Get a specific message (Embed) for a guild and module.
     * @param {string} guildId 
     * @param {string} module 
     * @param {string} slug 
     * @param {Object} placeholders 
     * @returns {EmbedBuilder}
     */
    async get(guildId, module, slug, placeholders = {}) {
        const cacheKey = `${guildId}_${module}`;
        let moduleMessages = this.cache.get(cacheKey);

        // Check if cache is expired
        if (moduleMessages && (Date.now() - (this.cacheTimestamps.get(cacheKey) || 0)) > this.cacheTTL) {
            moduleMessages = null;
        }

        // Fetch from DB if not in cache
        if (!moduleMessages) {
            const config = await MessageConfig.findOne({ guildId, module });
            moduleMessages = config ? config.messages : new Map();
            this.cache.set(cacheKey, moduleMessages);
            this.cacheTimestamps.set(cacheKey, Date.now());
        }

        // Get from DB override or fallback to default
        const dbEmbed = moduleMessages instanceof Map ? moduleMessages.get(slug) : moduleMessages[slug];
        const defaultEmbed = defaultMessages[module]?.[slug];

        const embedData = dbEmbed || defaultEmbed;

        if (!embedData) {
            logger.warn(`[MessageService] Message not found: ${module}.${slug}`);
            return new EmbedBuilder().setDescription(`Missing message: ${module}.${slug}`);
        }

        // Build Embed
        const embed = new EmbedBuilder();
        
        const title = replacePlaceholders(embedData.title, placeholders);
        if (title) embed.setTitle(title);

        const desc = replacePlaceholders(embedData.description, placeholders);
        if (desc) embed.setDescription(desc);

        embed.setColor(embedData.color || '#5865F2');

        const footer = replacePlaceholders(embedData.footer, placeholders);
        if (footer) embed.setFooter({ text: footer });

        const image = replacePlaceholders(embedData.image, placeholders);
        if (image) embed.setImage(image);

        const thumbnail = replacePlaceholders(embedData.thumbnail, placeholders);
        if (thumbnail) embed.setThumbnail(thumbnail);

        if (embedData.timestamp !== false) embed.setTimestamp();

        return embed;
    }

    /**
     * Clear cache for a specific guild and module.
     * Useful when updating config from dashboard.
     */
    clearCache(guildId, module) {
        const cacheKey = `${guildId}_${module}`;
        this.cache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
    }
}

export default new MessageService();
