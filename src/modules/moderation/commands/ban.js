import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banna un membro dal server.')
        .addUserOption(option => option.setName('target').setDescription('Membro da bannare').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Motivo del ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'Nessun motivo fornito';

        try {
            await interaction.guild.members.ban(user, { reason });

            const embed = await messageService.get(interaction.guildId, 'moderation', 'command_ban', {
                user: `${user.tag} (${user.id})`,
                mod: interaction.user.tag,
                reason: reason
            });

            await messageService.reply(interaction, 'moderation', 'command_ban', {
                user: `${user.tag} (${user.id})`,
                mod: interaction.user.tag,
                reason: reason
            }, { embeds: embed ? [embed] : [] });
        } catch (error) {
            logger.error('Error in ban command:', error);
            await interaction.reply({ content: 'Impossibile bannare questo utente.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
