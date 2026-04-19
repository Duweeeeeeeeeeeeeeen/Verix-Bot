import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import logger from '../../../utils/logger.js';

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

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔨 Membro Bannato')
                .addFields(
                    { name: 'Utente', value: `${user.tag} (${user.id})` },
                    { name: 'Moderatore', value: interaction.user.tag },
                    { name: 'Motivo', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            logger.error('Error in ban command:', error);
            await interaction.reply({ content: 'Impossibile bannare questo utente.', ephemeral: true });
        }
    },
};
