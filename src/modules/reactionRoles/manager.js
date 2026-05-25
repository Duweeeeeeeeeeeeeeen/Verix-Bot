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
        this.customIdPrefix = 'rr_toggle';
        this.customIdSeparator = '|';
        this.rawReactionCache = new Map();
    }

    async init() {
        logger.info('[ReactionRoles] Manager initialized.');
    }

    getCleanEmoji(emojiStr) {
        if (!emojiStr) return '';
        const clean = emojiStr.trim().replace(/[\uFE0E\uFE0F]/g, '');

        const customMatch = clean.match(/^<?a?:?([a-zA-Z0-9_]+):([0-9]+)>?$/);
        if (customMatch) return customMatch[2];

        const nameIdMatch = clean.match(/^([a-zA-Z0-9_]+):([0-9]+)$/);
        if (nameIdMatch) return nameIdMatch[2];

        if (/^[0-9]+$/.test(clean)) return clean;

        return clean;
    }

    getReactionEmojiKey(emoji) {
        if (!emoji) return '';
        return this.getCleanEmoji(emoji.id || emoji.name || '');
    }

    emojiMatches(configEmoji, reactionEmoji) {
        const configured = this.getCleanEmoji(configEmoji);
        const reacted = this.getReactionEmojiKey(reactionEmoji);
        if (!configured || !reacted) return false;
        return configured === reacted;
    }

    async applyReactionRole({ guildId, messageId, emoji, userId, action }) {
        const emojiKey = this.getReactionEmojiKey(emoji);
        logger.info(`[ReactionRoles] applyReactionRole start action=${action} guild=${guildId || 'none'} message=${messageId || 'none'} emoji=${emojiKey || 'none'} user=${userId || 'none'}`);
        if (!guildId || !messageId || !userId) {
            logger.warn(`[ReactionRoles] Ignored ${action} reaction with missing identifiers guild=${guildId || 'none'} message=${messageId || 'none'} user=${userId || 'none'} emoji=${emojiKey || 'none'}`);
            return false;
        }
        if (userId === this.client.user?.id) return false;

        const config = await ReactionRoleConfig.findOne({ guildId });
        if (!config || !config.enabled) {
            logger.warn(`[ReactionRoles] Ignored ${action} reaction because config is ${config ? 'disabled' : 'missing'} for guild ${guildId}.`);
            return false;
        }

        const panel = config.panels.find(p => p.messageId === messageId);
        if (!panel || panel.type !== 'REACTION') {
            logger.warn(`[ReactionRoles] Ignored ${action} reaction for message ${messageId}: panel ${panel ? `is ${panel.type}` : 'not found'}.`);
            return false;
        }

        const roleMapping = panel.roles.find(r => this.emojiMatches(r.emoji, emoji));
        if (!roleMapping) {
            logger.warn(`[ReactionRoles] No role mapping for emoji ${emojiKey} on message ${messageId} in guild ${guildId}. Configured: ${panel.roles.map(r => this.getCleanEmoji(r.emoji)).join(', ')}`);
            return false;
        }

        const guild = this.client.guilds.cache.get(guildId) || await this.client.guilds.fetch(guildId).catch(() => null);
        if (!guild) {
            logger.warn(`[ReactionRoles] Ignored ${action} reaction because guild ${guildId} could not be fetched.`);
            return false;
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member || member.user?.bot) {
            logger.warn(`[ReactionRoles] Ignored ${action} reaction because member ${userId} is ${member ? 'a bot' : 'not fetchable'} in guild ${guildId}.`);
            return false;
        }

        const role = await guild.roles.fetch(roleMapping.roleId).catch(() => null);
        const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
        if (!role || !botMember?.permissions.has(PermissionFlagsBits.ManageRoles) || role.position >= botMember.roles.highest.position) {
            logger.warn(`[ReactionRoles] Cannot manage role ${roleMapping.roleId} in guild ${guild.id}. Missing role, Manage Roles, or hierarchy.`);
            return false;
        }

        try {
            logger.info(`[ReactionRoles] Applying ${action} emoji ${emojiKey} -> role ${role.id} (${role.name}) for ${userId} in guild ${guildId}`);
            if (action === 'ADD') {
                await member.roles.add(role, 'Reaction role');
            } else {
                await member.roles.remove(role, 'Reaction role');
            }
        } catch (error) {
            logger.error(`[ReactionRoles] Discord role update failed action=${action} guild=${guildId} user=${userId} role=${role.id}: ${error.code || 'NO_CODE'} ${error.message}`, error);
            return false;
        }

        logger.info(`[ReactionRoles] ${action} emoji ${emojiKey} -> role ${roleMapping.roleId} for ${userId} in guild ${guildId}`);
        return true;
    }

    getReactionEventKey({ guildId, messageId, emoji, userId, action }) {
        return [guildId, messageId, this.getReactionEmojiKey(emoji), userId, action].join(':');
    }

    rememberRawReaction(eventKey) {
        this.rawReactionCache.set(eventKey, Date.now() + 5000);
        if (this.rawReactionCache.size > 500) {
            const now = Date.now();
            for (const [key, expires] of this.rawReactionCache.entries()) {
                if (expires <= now) this.rawReactionCache.delete(key);
            }
        }
    }

    wasHandledByRaw(eventKey) {
        const expires = this.rawReactionCache.get(eventKey);
        if (!expires) return false;
        if (expires <= Date.now()) {
            this.rawReactionCache.delete(eventKey);
            return false;
        }
        return true;
    }

    async handleInteraction(interaction) {
        if (!interaction.isButton()) return;

        const parsed = this.parseToggleCustomId(interaction.customId);
        if (!parsed) return;

        const { roleId } = parsed;
        const guild = interaction.guild;
        const member = await guild.members.fetch(interaction.user.id).catch(() => null);

        if (!member) return;

        // Ensure reaction roles module is enabled
        const config = await ReactionRoleConfig.findOne({ guildId: guild.id });
        if (!config || !config.enabled) {
            return interaction.reply({
                content: 'The Reaction Roles module is currently disabled.',
                flags: [MessageFlags.Ephemeral]
            });
        }

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

    parseToggleCustomId(customId) {
        const modernPrefix = `${this.customIdPrefix}${this.customIdSeparator}`;
        if (customId.startsWith(modernPrefix)) {
            const payload = customId.slice(modernPrefix.length);
            const [panelId, roleId] = payload.split(this.customIdSeparator);
            if (!panelId || !roleId) return null;
            return { panelId, roleId };
        }

        const legacyPrefix = `${this.customIdPrefix}_`;
        if (!customId.startsWith(legacyPrefix)) return null;

        const payload = customId.slice(legacyPrefix.length);
        const lastSeparatorIndex = payload.lastIndexOf('_');
        if (lastSeparatorIndex === -1) return null;

        const panelId = payload.slice(0, lastSeparatorIndex);
        const roleId = payload.slice(lastSeparatorIndex + 1);
        if (!panelId || !roleId) return null;
        return { panelId, roleId };
    }

    async handleReaction(reaction, user, action) {
        if (user.bot) return;

        if (user.partial) {
            try {
                user = await user.fetch();
            } catch (error) {
                logger.error('[ReactionRoles] Failed to fetch partial user:', error);
                return;
            }
        }

        // Robust partial reaction/message fetching
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                logger.error('[ReactionRoles] Failed to fetch partial reaction:', error);
                return;
            }
        }
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch();
            } catch (error) {
                logger.error('[ReactionRoles] Failed to fetch partial message:', error);
                return;
            }
        }

        const guildId = reaction.message.guildId || reaction.message.guild?.id;
        if (!guildId) return;

        const messageId = reaction.message.id;
        const emoji = this.getReactionEmojiKey(reaction.emoji);
        const eventKey = this.getReactionEventKey({ guildId, messageId, emoji: reaction.emoji, userId: user.id, action });
        if (this.wasHandledByRaw(eventKey)) return;

        try {
            await this.applyReactionRole({ guildId, messageId, emoji: reaction.emoji, userId: user.id, action });
        } catch (error) {
            logger.error(`[ReactionRoles] Error handling reaction ${action} for ${user.tag}: ${error.message}`, error);
        }
    }

    async handleRawReaction(packet) {
        const action = packet.t === 'MESSAGE_REACTION_ADD' ? 'ADD' : packet.t === 'MESSAGE_REACTION_REMOVE' ? 'REMOVE' : null;
        if (!action) return;

        const data = packet.d || {};
        try {
            const eventKey = this.getReactionEventKey({
                guildId: data.guild_id,
                messageId: data.message_id,
                userId: data.user_id,
                emoji: data.emoji,
                action
            });
            const handled = await this.applyReactionRole({
                guildId: data.guild_id,
                messageId: data.message_id,
                userId: data.user_id,
                emoji: data.emoji,
                action
            });
            if (handled) this.rememberRawReaction(eventKey);
        } catch (error) {
            logger.error(`[ReactionRoles] Error handling raw reaction ${action}: ${error.message}`, error);
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
                    .setCustomId(`${this.customIdPrefix}${this.customIdSeparator}${panel.id}${this.customIdSeparator}${r.roleId}`)
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
                const messageHasButtons = message.components && message.components.length > 0;
                const panelIsButton = panel.type === 'BUTTON';
                if (messageHasButtons !== panelIsButton) {
                    // Type changed between BUTTON and REACTION! Delete the old message and resend to prevent duplicates/stacking
                    await message.delete().catch(() => null);
                    message = null;
                }
            }

            if (message) {
                // If switching/deploying a BUTTON panel, clear reactions to avoid accumulation
                if (panel.type === 'BUTTON') {
                    await message.reactions.removeAll().catch(() => null);
                }
                await message.edit({ embeds: [embed], components: rows });
            } else {
                message = await channel.send({ embeds: [embed], components: rows });
                panel.messageId = message.id;
                await config.save();
            }

            if (panel.type === 'REACTION') {
                // Clear any existing reactions first to prevent accumulation
                await message.reactions.removeAll().catch(() => null);
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
