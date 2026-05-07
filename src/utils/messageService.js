import { EmbedBuilder } from 'discord.js';
import MessageConfig from '../models/MessageConfig.js';
import GlobalConfig from '../models/GlobalConfig.js';
import Guild from '../models/Guild.js';
import { getDefaultMessages } from '../locales/t.js';
import { buildEmbed } from './embedHelper.js';
import logger from './logger.js';

class MessageService {
    constructor() {
        this.cache = new Map(); // guildId_module -> messages
        this.cacheTTL = 10 * 60 * 1000; // 10 minutes
        this.cacheTimestamps = new Map();

        this.langCache = new Map(); // guildId -> language code
        this.langTTL = 30 * 60 * 1000; // 30 minutes for language
        this.langTimestamps = new Map();

        this.guildCache = new Map(); // guildId -> { isPremium, hideBranding }
        this.guildTTL = 5 * 60 * 1000; // 5 minutes for guild settings
        this.guildTimestamps = new Map();
    }

    /**
     * Internal: Get the preferred language for a guild.
     * @param {string} guildId 
     * @returns {string} 'it' or 'en'
     */
    async getGuildLanguage(guildId) {
        if (!guildId) return 'en';

        const cached = this.langCache.get(guildId);
        if (cached && (Date.now() - (this.langTimestamps.get(guildId) || 0)) < this.langTTL) {
            return cached;
        }

        try {
            const config = await GlobalConfig.findOne({ guildId });
            const lang = config?.language || 'en';
            this.langCache.set(guildId, lang);
            this.langTimestamps.set(guildId, Date.now());
            return lang;
        } catch (err) {
            logger.warn(`[MessageService] Error fetching guild language for ${guildId}:`, err.message);
            return 'en';
        }
    }

    /**
     * Internal: Get guild-wide settings (White-label, Premium)
     */
    async getGuildConfig(guildId) {
        if (!guildId) return { isPremium: false, hideBranding: false };

        const cached = this.guildCache.get(guildId);
        if (cached && (Date.now() - (this.guildTimestamps.get(guildId) || 0)) < this.guildTTL) {
            return cached;
        }

        try {
            const config = await Guild.findOne({ guildId });
            const data = {
                isPremium: config?.isPremium || false,
                hideBranding: config?.isPremium && config?.hideBranding || false
            };
            this.guildCache.set(guildId, data);
            this.guildTimestamps.set(guildId, Date.now());
            return data;
        } catch (err) {
            return { isPremium: false, hideBranding: false };
        }
    }

    /**
     * Get a specific message (Embed) for a guild and module.
     * @param {string} guildId 
     * @param {string} module 
     * @param {string} slug 
     * @param {Object} placeholders 
     * @returns {EmbedBuilder}
     */
    async get(guildId, moduleOrFullSlug, slugOrPlaceholders = {}, placeholders = {}) {
        let module, slug, finalPlaceholders;

        if (typeof moduleOrFullSlug === 'string' && moduleOrFullSlug.includes('.')) {
            [module, slug] = moduleOrFullSlug.split('.');
            finalPlaceholders = slugOrPlaceholders;
        } else {
            module = moduleOrFullSlug;
            slug = slugOrPlaceholders;
            finalPlaceholders = placeholders;
        }

        const embedData = await this.getRaw(guildId, module, slug);

        if (!embedData) {
            logger.warn(`[MessageService] Message not found: ${module}.${slug}`);
            return new EmbedBuilder()
                .setTitle('❌ Errore Configurazione')
                .setDescription(`Messaggio mancante: \`${module}.${slug}\`.\nPer favore contatta lo staff o ripristina i default.`)
                .setColor('#e74c3c');
        }

        // Build Embed using robust helper
        const guildConfig = await this.getGuildConfig(guildId);
        const embed = buildEmbed(embedData, finalPlaceholders, { 
            hideBranding: guildConfig.hideBranding 
        });
        
        // Ensure description is never empty as Discord API requires it
        if (!embed.data.description && !embed.data.title) {
            embed.setDescription(`[Messaggio ${module}.${slug} vuoto]`);
        }

        return embed;
    }

    /**
     * Internal: Get the raw message object (DB or Default)
     * Performs a field-by-field merge to avoid "Senza Titolo" placeholders.
     */
    async getRaw(guildId, module, slug) {
        const cacheKey = `${guildId}_${module}`;
        let moduleMessages = this.cache.get(cacheKey);

        if (moduleMessages && (Date.now() - (this.cacheTimestamps.get(cacheKey) || 0)) > this.cacheTTL) {
            moduleMessages = null;
        }

        if (!moduleMessages) {
            try {
                const config = await MessageConfig.findOne({ guildId, module });
                moduleMessages = config ? config.messages : new Map();
                this.cache.set(cacheKey, moduleMessages);
                this.cacheTimestamps.set(cacheKey, Date.now());
            } catch (err) {
                logger.error(`[MessageService] DB Error fetching ${module}:`, err);
                moduleMessages = new Map();
            }
        }
        
        const lang = await this.getGuildLanguage(guildId);
        const defaults = getDefaultMessages(lang);

        const dbEmbed = moduleMessages instanceof Map ? moduleMessages.get(slug) : moduleMessages[slug];
        const defaultEmbed = defaults[module]?.[slug];

        if (!dbEmbed) return defaultEmbed;
        if (!defaultEmbed) return dbEmbed;

        // --- MERGE LOGIC ---
        // If the DB version has "Senza Titolo" or empty fields, we fall back to defaults for those fields
        const isPlaceholder = (val) => !val || (typeof val === 'string' && (val.trim() === '' || val === 'Senza Titolo' || val === 'Nessun contenuto impostato.'));

        const merged = { ...dbEmbed };
        
        if (isPlaceholder(merged.title)) merged.title = defaultEmbed.title;
        if (isPlaceholder(merged.description)) merged.description = defaultEmbed.description;
        if (isPlaceholder(merged.footer)) merged.footer = defaultEmbed.footer;
        if (isPlaceholder(merged.image)) merged.image = defaultEmbed.image;
        if (isPlaceholder(merged.thumbnail)) merged.thumbnail = defaultEmbed.thumbnail;
        
        // Only override color if DB has default or invalid color
        if (!merged.color || merged.color === '#5865f2' || merged.color === '#000000') {
            merged.color = defaultEmbed.color || merged.color;
        }

        // Merge fields if DB has none or they are empty
        if (defaultEmbed.fields && (!merged.fields || merged.fields.length === 0)) {
            merged.fields = defaultEmbed.fields;
        }

        return merged;
    }

    /**
     * Reply to an interaction with a standardized embed.
     */
    async reply(interaction, module, slug, placeholders = {}, options = {}) {
        const { ephemeral = false, components = [], files = [], content = null } = options;
        const embed = await this.get(interaction.guildId, module, slug, { 
            user: interaction.user, 
            guild: interaction.guild,
            ...placeholders 
        });

        const payload = { embeds: [embed], components, files, ephemeral };
        if (content) payload.content = content;

        if (interaction.deferred || interaction.replied) {
            return await interaction.editReply(payload);
        } else {
            return await interaction.reply(payload);
        }
    }

    /**
     * Send a standardized embed to a channel.
     */
    async send(channel, module, slug, placeholders = {}, options = {}) {
        if (!channel) return null;
        const { components = [], files = [], content = null } = options;
        const embed = await this.get(channel.guildId, module, slug, placeholders);

        const payload = { embeds: [embed], components, files };
        if (content) payload.content = content;

        return await channel.send(payload).catch(err => {
            logger.error(`[MessageService] Failed to send ${module}.${slug} to ${channel.id}:`, err);
            return null;
        });
    }

    /**
     * Send a standardized DM to a user.
     */
    async sendDM(user, guild, module, slug, placeholders = {}) {
        if (!user) return null;
        const embed = await this.get(guild?.id, module, slug, { user, guild, ...placeholders });
        
        return await user.send({ embeds: [embed] }).catch(() => {
            logger.warn(`[MessageService] Could not send DM to ${user.tag} for ${module}.${slug}`);
            return null;
        });
    }

    /**
     * Centralized notification dispatcher.
     * Uses the guild's notification settings to send an embed via DM, Channel, or Both.
     */
    async sendNotification(guild, member, module, slug, placeholders = {}, notificationConfig = {}) {
        if (!guild || !member || !notificationConfig || notificationConfig.mode === 'NONE') return false;

        const embed = await this.get(guild.id, module, slug, {
            user: member.user || member,
            guild: guild,
            ...placeholders
        });

        const { mode, channelId } = notificationConfig;
        const canSendDM = mode === 'DM' || mode === 'BOTH';
        const canSendChannel = mode === 'CHANNEL' || mode === 'BOTH';

        let success = false;

        // 1. Send DM
        if (canSendDM) {
            try {
                await (member.user || member).send({ embeds: [embed] });
                success = true;
            } catch (err) {
                logger.debug(`[MessageService] DM failed for ${member.id}: ${err.message}`);
            }
        }

        // 2. Send to Channel
        if (canSendChannel && channelId) {
            try {
                const channel = await guild.channels.fetch(channelId).catch(() => null);
                if (channel) {
                    await channel.send({ 
                        content: `<@${member.id}>`, 
                        embeds: [embed] 
                    });
                    success = true;
                }
            } catch (err) {
                logger.error(`[MessageService] Channel notification failed for ${channelId}:`, err);
            }
        }

        return success;
    }

    /**
     * Clear cache for a specific guild and module.
     */
    clearCache(guildId, module) {
        const cacheKey = `${guildId}_${module}`;
        this.cache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
    }
}

export default new MessageService();

