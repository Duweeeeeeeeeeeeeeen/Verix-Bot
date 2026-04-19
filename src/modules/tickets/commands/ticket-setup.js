import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Invia il messaggio per la creazione dei ticket.')
        .addChannelOption(option => option.setName('channel').setDescription('Canale dove inviare il messaggio').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎫 Supporto Tecnico')
            .setDescription('Clicca il pulsante qui sotto per aprire un ticket di assistenza.\nI nostri staffer ti risponderanno al più presto.')
            .setFooter({ text: 'Sistema Ticket RP' });

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
