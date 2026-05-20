import ReactionRoleConfig from '../../models/ReactionRoleConfig.js';
import logger from '../../utils/logger.js';
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    PermissionFlagsBits
} from 'discord.js';
import { checkBotPermissions } from '../../utils/permissionHelper.js';

class ReactionRoleManager {
    constructor(client) {
        this.client = client;
    }

    async init() {
        logger.info('[ReactionRoles] Manager initialized.');
    }

    getCleanEmoji(emojiStr) {
        if (!emojiStr) return '';
        const clean = emojiStr.trim();

        const customMatch = clean.match(/^<?a?:?([a-zA-Z0-9_]+):([0-9]+)>?$/);
        if (customMatch) return customMatch[2];

        const nameIdMatch = clean.match(/^([a-zA-Z0-9_]+):([0-9]+)$/);
        if (nameIdMatch) return nameIdMatch[2];

        if (/^[0-9]+$/.test(clean)) return clean;

        return clean;
    }

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
                    content: 'Role not found. Please contact an administrator.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
            if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles) || role.position >= botMember.roles.highest.position) {
                return interaction.reply({
                    content: 'Verix cannot manage this role. Move the bot role above the target role and grant Manage Roles.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
                await interaction.reply({
                    content: `Role **${role.name}** removed successfully.`,
                    flags: [MessageFlags.Ephemeral]
                });
            } else {
                await member.roles.add(roleId);
                await interaction.reply({
                    content: `Role **${role.name}** assigned successfully.`,
                    flags: [MessageFlags.Ephemeral]
                });
            }
        } catch (error) {
            logger.error(`[ReactionRoles] Error toggling role ${roleId} for ${interaction.user.tag}:`, error);
            const payload = {
                content: 'Unable to update the role. Check the bot permissions and role hierarchy.',
                flags: [MessageFlags.Ephemeral]
            };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(payload).catch(() => null);
            } else {
                await interaction.reply(payload).catch(() => null);
            }
        }
    }

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

    async deployPanel(guildId, panelId) {
        const config = await ReactionRoleConfig.findOne({ guildId });
        if (!config) return { success: false, error: 'Configuration not found' };

        const panel = config.panels.find(p => p.id === panelId);
        if (!panel) return { success: false, error: 'Panel not found' };

        const guild = this.client.guilds.cache.get(guildId) || await this.client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return { success: false, error: 'Guild not found' };

        const channel = await guild.channels.fetch(panel.channelId).catch(() => null);
        if (!channel) return { success: false, error: 'Channel not found' };

        const requiredPermissions = [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks
        ];
        if (panel.type === 'REACTION') requiredPermissions.push(PermissionFlagsBits.AddReactions);

        const permCheck = checkBotPermissions(channel, requiredPermissions);
        if (!permCheck.hasPermission) {
            return { success: false, error: `Missing bot permissions: ${permCheck.missing.join(', ')}` };
        }

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
                    PRIMARY: ButtonStyle.Primary,
                    SECONDARY: ButtonStyle.Secondary,
                    SUCCESS: ButtonStyle.Success,
                    DANGER: ButtonStyle.Danger
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
