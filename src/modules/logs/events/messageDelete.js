import { Events, EmbedBuilder } from 'discord.js';
import Guild from '../../../models/Guild.js';
import messageService from '../../../utils/messageService.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import { t } from '../../../locales/t.js';

export default {
    name: Events.MessageDelete,
    async execute(message, client) {
        if (message.author?.bot || !message.guild) return;

        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData || !guildData.enabledModules?.includes('logs') || !guildData.logChannelId) return;

        const globalConfig = await GlobalConfig.findOne({ guildId: message.guild.id });
        const lang = globalConfig?.language || 'en';

        const logChannel = await message.guild.channels.fetch(guildData.logChannelId).catch(() => null);
        if (!logChannel) return;

        const embed = await messageService.get(message.guild.id, 'logs', 'message_deleted');
        embed.addFields(
            { name: t('logs.message_deleted.author', lang), value: `${message.author.tag}`, inline: true },
            { name: t('logs.message_deleted.channel', lang), value: `${message.channel}`, inline: true },
            { name: t('logs.message_deleted.content', lang), value: message.content || t('logs.message_deleted.no_text', lang) }
        );

        await logChannel.send({ embeds: [embed] });
    },
};
