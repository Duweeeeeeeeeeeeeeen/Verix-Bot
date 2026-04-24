import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import messageService from '../../../utils/messageService.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Invia il messaggio per la creazione dei ticket.')
        .addChannelOption(option => option.setName('channel').setDescription('Canale dove inviare il messaggio').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        const embed = await messageService.get(interaction.guildId, 'tickets', 'panel');

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Apri Ticket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)
        );

        await channel.send({ embeds: [embed], components: [button] });
        await interaction.reply({ content: 'Messaggio di setup inviato correttamente!', flags: [MessageFlags.Ephemeral] });
    },
};
