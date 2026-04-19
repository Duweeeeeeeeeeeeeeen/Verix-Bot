import { EmbedBuilder } from 'discord.js';
import WelcomeConfig from '../../../models/WelcomeConfig.js';
import placeholderHelper from '../../../utils/placeholderHelper.js';
import logger from '../../../utils/logger.js';

export default {
    name: 'guildMemberAdd',
    execute: async (member, client) => {
        try {
            const config = await WelcomeConfig.findOne({ guildId: member.guild.id });
            if (!config || !config.enabled || !config.welcome.enabled || !config.welcome.channelId) return;

            const channel = await member.guild.channels.fetch(config.welcome.channelId).catch(() => null);
            if (!channel || !channel.isTextBased()) {
                logger.warn(`[Welcome] Invalid or non-text channel configured for guild ${member.guild.id}: ${config.welcome.channelId}`);
                return;
            }

            const placeholders = {
                user: member.user.username,
                user_mention: member.toString(),
                user_tag: member.user.tag,
                guild: member.guild.name,
                member_count: member.guild.memberCount.toString()
            };

            const wEmbed = config.welcome.embed || {};
            const embed = new EmbedBuilder()
                .setTitle(placeholderHelper.replace(wEmbed.title || '✨ Benvenuto!', placeholders))
                .setDescription(placeholderHelper.replace(wEmbed.description || 'Benvenuto nel server!', placeholders))
                .setColor(wEmbed.color || '#5865F2')
                .setTimestamp();

            if (wEmbed.footer) embed.setFooter({ text: placeholderHelper.replace(wEmbed.footer, placeholders), iconURL: member.guild.iconURL() });
            if (wEmbed.thumbnail) embed.setThumbnail(placeholderHelper.replace(wEmbed.thumbnail, placeholders));
            if (wEmbed.image) embed.setImage(placeholderHelper.replace(wEmbed.image, placeholders));

            await channel.send({ embeds: [embed] });

        } catch (error) {
            logger.error('[Welcome] Error in guildMemberAdd:', error);
        }
    }
};
