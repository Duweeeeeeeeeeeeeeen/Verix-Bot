import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import ModerationConfig from '../../../models/ModerationConfig.js';
import { sendUserNotification } from '../../../utils/notificationService.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Espelle un membro dal server.')
        .addUserOption(option => option.setName('target').setDescription('Membro da espellere').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Motivo dell\'espulsione'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'Nessun motivo fornito';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member || !member.kickable) {
            return messageService.reply(interaction, 'moderation', 'error', {}, { ephemeral: true });
        }

        // Notify User
        const config = await ModerationConfig.findOne({ guildId: interaction.guildId });
        if (config && config.enabled) {
            const kickEmbed = await messageService.get(interaction.guildId, 'moderation', 'dm_kick', {
                guild: interaction.guild.name,
                reason: reason
            });
            await sendUserNotification(interaction.guild, user, config.notifications, {
                embeds: kickEmbed ? [kickEmbed] : []
            });
        }

        await member.kick(reason);

        await messageService.reply(interaction, 'moderation', 'command_kick', {
            user: `${user.tag} (${user.id})`,
            mod: interaction.user.tag,
            reason: reason
        });
    },
};
