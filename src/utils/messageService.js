import { EmbedBuilder } from 'discord.js';
import MessageConfig from '../models/MessageConfig.js';
import defaultMessages from '../locales/defaultMessages.js';
import { buildEmbed } from './embedHelper.js';
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
        const embed = buildEmbed(embedData, placeholders);
        
        // Ensure description is never empty as Discord API requires it
        if (!embed.data.description && !embed.data.title) {
            embed.setDescription(`[Messaggio ${module}.${slug} vuoto]`);
        }

        return embed;
    }

    /**
     * Internal: Get the raw message object (DB or Default)
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

        const dbEmbed = moduleMessages instanceof Map ? moduleMessages.get(slug) : moduleMessages[slug];
        const defaultEmbed = defaultMessages[module]?.[slug];

        return dbEmbed || defaultEmbed;
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

