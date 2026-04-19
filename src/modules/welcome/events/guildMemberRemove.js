import { EmbedBuilder } from 'discord.js';
import WelcomeConfig from '../../../models/WelcomeConfig.js';
import placeholderHelper from '../../../utils/placeholderHelper.js';
import logger from '../../../utils/logger.js';

export default {
    name: 'guildMemberRemove',
    execute: async (member, client) => {
        try {
            const config = await WelcomeConfig.findOne({ guildId: member.guild.id });
            if (!config || !config.enabled || !config.leave.enabled || !config.leave.channelId) return;

            const channel = member.guild.channels.cache.get(config.leave.channelId);
            if (!channel) return;

            const placeholders = {
                user: member.user.username,
                user_mention: member.user.toString(),
                user_tag: member.user.tag,
                guild: member.guild.name,
                member_count: member.guild.memberCount.toString()
            };

            const lEmbed = config.leave.embed || {};
            const embed = new EmbedBuilder()
                .setTitle(placeholderHelper.replace(lEmbed.title || '👋 Arrivederci', placeholders))
                .setDescription(placeholderHelper.replace(lEmbed.description || 'Ha lasciato il server.', placeholders))
                .setColor(lEmbed.color || '#ED4245')
                .setTimestamp();

            if (lEmbed.footer) embed.setFooter({ text: placeholderHelper.replace(lEmbed.footer, placeholders), iconURL: member.guild.iconURL() });
            if (lEmbed.thumbnail) embed.setThumbnail(placeholderHelper.replace(lEmbed.thumbnail, placeholders));
            if (lEmbed.image) embed.setImage(placeholderHelper.replace(lEmbed.image, placeholders));

            await channel.send({ embeds: [embed] });

        } catch (error) {
            logger.error('[Welcome] Error in guildMemberRemove:', error);
        }
    }
};
