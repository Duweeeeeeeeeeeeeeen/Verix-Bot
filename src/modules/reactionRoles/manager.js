import ReactionRoleConfig from '../../models/ReactionRoleConfig.js';
import logger from '../../utils/logger.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

class ReactionRoleManager {
    constructor(client) {
        this.client = client;
    }

    async init() {
        logger.info('[ReactionRoles] Manager initialized.');
    }

    /**
     * Parse and clean emoji strings to extract ID for custom emojis,
     * or return the raw string if it's a unicode/standard emoji.
     */
    getCleanEmoji(emojiStr) {
        if (!emojiStr) return '';
        const clean = emojiStr.trim();
        // Match <:name:id> or <a:name:id>
        const customMatch = clean.match(/^<?a?:?([a-zA-Z0-9_]+):([0-9]+)>?$/);
        if (customMatch) {
            return customMatch[2]; // Return only the numeric ID
        }
        // Match :name:id (without brackets)
        const nameIdMatch = clean.match(/^([a-zA-Z0-9_]+):([0-9]+)$/);
        if (nameIdMatch) {
            return nameIdMatch[2]; // Return only the numeric ID
        }
        // Match pure numeric ID
        if (/^[0-9]+$/.test(clean)) {
            return clean;
        }
        // Standard Unicode emoji
        return clean;
    }

    /**
     * Handle button interactions for reaction roles.
     * Expected customId format: rr_toggle_{panelId}_{roleId}
     */
    async handleInteraction(interaction) {
        if (!interaction.isButton()) return;
        
        const parts = interaction.customId.split('_');
        if (parts.length < 4) return;

        const [,, panelId, roleId] = parts;
        const guild = interaction.guild;
        const member = await guild.members.fetch(interaction.user.id).catch(() => null);

        if (!member) return;

        try {
            const role = await guild.roles.fetch(roleId).catch(() => null);
            if (!role) {
                return interaction.reply({ 
                    content: '❌ Ruolo non trovato. Contatta un amministratore.', 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
                await interaction.reply({ 
                    content: `✅ Ruolo **${role.name}** rimosso con successo.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            } else {
                await member.roles.add(roleId);
                await interaction.reply({ 
                    content: `✅ Ruolo **${role.name}** assegnato con successo.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
        } catch (error) {
            logger.error(`[ReactionRoles] Error toggling role ${roleId} for ${interaction.user.tag}:`, error);
            await interaction.reply({ 
                content: '❌ Errore durante l\'assegnazione del ruolo. Verifica i permessi del bot.', 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    }

    /**
     * Handle reaction additions/removals for reaction roles.
     */
    async handleReaction(reaction, user, action) {
        if (user.bot) return;
        if (reaction.partial) await reaction.fetch().catch(() => null);
        
        const guildId = reaction.message.guildId;
        const messageId = reaction.message.id;
        const emoji = reaction.emoji.id || reaction.emoji.name;

        const config = await ReactionRoleConfig.findOne({ 
            guildId, 
            'panels.messageId': messageId,
            'panels.type': 'REACTION'
        });

        if (!config || !config.enabled) return;

        const panel = config.panels.find(p => p.messageId === messageId);
        if (!panel) return;

        const roleMapping = panel.roles.find(r => {
            const cleanConfigEmoji = this.getCleanEmoji(r.emoji);
            return cleanConfigEmoji === emoji || cleanConfigEmoji === reaction.emoji.name;
        });
        if (!roleMapping) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        try {
            if (action === 'ADD') {
                await member.roles.add(roleMapping.roleId);
            } else {
                await member.roles.remove(roleMapping.roleId);
            }
        } catch (error) {
            logger.error(`[ReactionRoles] Error handling reaction ${action} for ${user.tag}:`, error);
        }
    }

    /**
     * Deploy or update a panel in a channel.
     */
    async deployPanel(guildId, panelId) {
        const config = await ReactionRoleConfig.findOne({ guildId });
        if (!config) return { success: false, error: 'Configurazione non trovata' };

        const panel = config.panels.find(p => p.id === panelId);
        if (!panel) return { success: false, error: 'Panel non trovato' };

        const guild = this.client.guilds.cache.get(guildId) || await this.client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return { success: false, error: 'Guild non trovata' };

        const channel = await guild.channels.fetch(panel.channelId).catch(() => null);
        if (!channel) return { success: false, error: 'Canale non trovato' };

        const embed = new EmbedBuilder()
            .setTitle(panel.embed.title)
            .setDescription(panel.embed.description)
            .setColor(panel.embed.color || '#5865F2')
            .setFooter({ text: panel.embed.footer });
        
        if (panel.embed.image) embed.setImage(panel.embed.image);
        if (panel.embed.thumbnail) embed.setThumbnail(panel.embed.thumbnail);

        const rows = [];
        if (panel.type === 'BUTTON') {
            let currentRow = new ActionRowBuilder();
            panel.roles.forEach((r, index) => {
                if (index > 0 && index % 5 === 0) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }

                const styleMap = {
                    'PRIMARY': ButtonStyle.Primary,
                    'SECONDARY': ButtonStyle.Secondary,
                    'SUCCESS': ButtonStyle.Success,
                    'DANGER': ButtonStyle.Danger
                };

                const btn = new ButtonBuilder()
                    .setCustomId(`rr_toggle_${panel.id}_${r.roleId}`)
                    .setLabel(r.label || 'Role')
                    .setStyle(styleMap[r.style] || ButtonStyle.Primary);
                
                if (r.emoji && r.emoji.trim()) {
                    const cleanEmoji = this.getCleanEmoji(r.emoji);
                    btn.setEmoji(cleanEmoji);
                }
                
                currentRow.addComponents(btn);
            });
            if (currentRow.components.length > 0) rows.push(currentRow);
        }

        try {
            let message;
            if (panel.messageId) {
                message = await channel.messages.fetch(panel.messageId).catch(() => null);
            }

            if (message) {
                await message.edit({ embeds: [embed], components: rows });
            } else {
                message = await channel.send({ embeds: [embed], components: rows });
                panel.messageId = message.id;
                await config.save();
            }

            // If it's REACTION type, add reactions
            if (panel.type === 'REACTION') {
                for (const r of panel.roles) {
                    if (r.emoji) {
                        const cleanEmoji = this.getCleanEmoji(r.emoji);
                        if (cleanEmoji) await message.react(cleanEmoji).catch(() => null);
                    }
                }
            }

            return { success: true, messageId: message.id };
        } catch (error) {
            logger.error(`[ReactionRoles] Error deploying panel ${panelId}:`, error);
            return { success: false, error: error.message };
        }
    }
}

export default ReactionRoleManager;
