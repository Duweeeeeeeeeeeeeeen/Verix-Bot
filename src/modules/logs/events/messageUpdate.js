import { Events, EmbedBuilder } from 'discord.js';
import Guild from '../../../models/Guild.js';
import messageService from '../../../utils/messageService.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import { t } from '../../../locales/t.js';

export default {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.author?.bot || !oldMessage.guild || oldMessage.content === newMessage.content) return;

        const guildData = await Guild.findOne({ guildId: oldMessage.guild.id });
        if (!guildData || !guildData.enabledModules?.includes('logs') || !guildData.logChannelId) return;

        const globalConfig = await GlobalConfig.findOne({ guildId: oldMessage.guild.id });
        const lang = globalConfig?.language || 'en';

        const logChannel = await oldMessage.guild.channels.fetch(guildData.logChannelId).catch(() => null);
        if (!logChannel) return;

        const embed = await messageService.get(oldMessage.guild.id, 'logs', 'message_updated');
        embed.addFields(
            { name: t('logs.message_updated.author', lang), value: `${oldMessage.author.tag}`, inline: true },
            { name: t('logs.message_updated.channel', lang), value: `${oldMessage.channel}`, inline: true },
            { name: t('logs.message_updated.before', lang), value: oldMessage.content || t('common.none', lang) },
            { name: t('logs.message_updated.after', lang), value: newMessage.content || t('common.none', lang) }
        );

        await logChannel.send({ embeds: [embed] });
    },
};
