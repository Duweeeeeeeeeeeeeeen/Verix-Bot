import { Events, EmbedBuilder } from 'discord.js';
import Guild from '../../../models/Guild.js';

export default {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.author?.bot || !oldMessage.guild || oldMessage.content === newMessage.content) return;

        const guildData = await Guild.findOne({ guildId: oldMessage.guild.id });
        if (!guildData || !guildData.enabledModules?.includes('logs') || !guildData.logChannelId) return;

        const logChannel = oldMessage.guild.channels.cache.get(guildData.logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('📝 Messaggio Modificato')
            .addFields(
                { name: 'Autore', value: `${oldMessage.author.tag}`, inline: true },
                { name: 'Canale', value: `${oldMessage.channel}`, inline: true },
                { name: 'Prima', value: oldMessage.content || '*Nessun testo*' },
                { name: 'Dopo', value: newMessage.content || '*Nessun testo*' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    },
};
