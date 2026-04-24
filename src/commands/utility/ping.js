import { SlashCommandBuilder } from 'discord.js';
import messageService from '../../utils/messageService.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        await messageService.reply(interaction, 'utility', 'ping', {
            latency: latency,
            api_latency: Math.round(interaction.client.ws.ping)
        }, { ephemeral: true });
    },
};
