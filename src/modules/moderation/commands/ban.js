import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import ModerationConfig from '../../../models/ModerationConfig.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import { sendUserNotification } from '../../../utils/notificationService.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';
import { t } from '../../../locales/t.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banna un membro dal server.')
        .addUserOption(option => option.setName('target').setDescription('Membro da bannare').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Motivo del ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guildId });
        const lang = globalConfig?.language || 'en';
        const reason = interaction.options.getString('reason') || t('moderation.no_reason', lang);

        try {
            // Notify User
            const config = await ModerationConfig.findOne({ guildId: interaction.guildId });
            if (config && config.enabled) {
                const banEmbed = await messageService.get(interaction.guildId, 'moderation', 'dm_ban', {
                    guild: interaction.guild.name,
                    reason: reason
                });
                await sendUserNotification(interaction.guild, user, config.notifications, {
                    embeds: banEmbed ? [banEmbed] : []
                });
            }

            await interaction.guild.members.ban(user, { reason });

            await messageService.reply(interaction, 'moderation', 'command_ban', {
                user: `${user.tag} (${user.id})`,
                mod: interaction.user.tag,
                reason: reason
            });
        } catch (error) {
            logger.error('Error in ban command:', error);
            await messageService.reply(interaction, 'moderation', 'error', {}, { ephemeral: true });
        }
    },
};
