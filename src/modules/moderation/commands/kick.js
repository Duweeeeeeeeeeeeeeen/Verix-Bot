import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import logger from '../../../utils/logger.js';

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

        if (!member) return interaction.reply({ content: 'Membro non trovato.', ephemeral: true });
        if (!member.kickable) return interaction.reply({ content: 'Non posso espellere questo membro.', ephemeral: true });

        await member.kick(reason);

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('👢 Membro Espulso')
            .addFields(
                { name: 'Utente', value: `${user.tag} (${user.id})` },
                { name: 'Moderatore', value: interaction.user.tag },
                { name: 'Motivo', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
