import { Events, EmbedBuilder } from 'discord.js';
import Guild from '../../../models/Guild.js';

export default {
    name: Events.MessageDelete,
    async execute(message, client) {
        if (message.author?.bot || !message.guild) return;

        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData || !guildData.enabledModules?.includes('logs') || !guildData.logChannelId) return;

        const logChannel = message.guild.channels.cache.get(guildData.logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🗑️ Messaggio Eliminato')
            .addFields(
                { name: 'Autore', value: `${message.author.tag}`, inline: true },
                { name: 'Canale', value: `${message.channel}`, inline: true },
                { name: 'Contenuto', value: message.content || '*Nessun testo (forse un embed o file)*' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    },
};
