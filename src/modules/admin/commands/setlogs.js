import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import Guild from '../../../models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Imposta il canale per i log del server.')
        .addChannelOption(opt => opt.setName('channel').setDescription('Canale log').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        
        await Guild.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { logChannelId: channel.id }
        );

        return interaction.reply({ content: `✅ Canale log impostato su ${channel}!`, ephemeral: true });
    },
};
