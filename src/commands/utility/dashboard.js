import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import messageService from '../../utils/messageService.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Ottieni il link per gestire il bot tramite la dashboard web.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const dashboardUrl = `${process.env.DASHBOARD_FRONTEND_URL || 'http://178.104.245.26'}/config/${guildId}`;

        const embed = new EmbedBuilder()
            .setTitle('🚀 Verix Dashboard')
            .setDescription(`Gestisci tutte le impostazioni del server direttamente dal web.\n\n**[Clicca qui per accedere alla Dashboard](${dashboardUrl})**`)
            .setColor('#5865F2')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Verix Bot - Powering your community', iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    },
};
