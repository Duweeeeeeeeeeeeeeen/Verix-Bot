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
                user_avatar: member.user.displayAvatarURL({ dynamic: true, size: 512 }),
                guild: member.guild.name,
                member_count: member.guild.memberCount.toString()
            };

            const lEmbed = config.leave.embed || {};
            const isPlaceholder = (val) => !val || (typeof val === 'string' && (val.trim() === '' || val === 'Senza Titolo' || val === 'Nessun contenuto impostato.'));

            const rawTitle = isPlaceholder(lEmbed.title) ? '🚗 Partenza Cittadina' : lEmbed.title;
            const rawDesc = isPlaceholder(lEmbed.description) ? 'Il cittadino **{user}** ha lasciato la città. Speriamo di rivederlo presto nei nostri registri.' : lEmbed.description;

            const embed = new EmbedBuilder()
                .setTitle(placeholderHelper.replace(rawTitle, placeholders))
                .setDescription(placeholderHelper.replace(rawDesc, placeholders))
                .setColor(lEmbed.color && lEmbed.color !== '#000000' ? lEmbed.color : '#e74c3c')
                .setThumbnail(placeholders.user_avatar) // Set default thumbnail to user avatar
                .setTimestamp();

            if (lEmbed.footer) embed.setFooter({ text: placeholderHelper.replace(lEmbed.footer, placeholders), iconURL: member.guild.iconURL() });
            if (lEmbed.thumbnail && !isPlaceholder(lEmbed.thumbnail)) {
                embed.setThumbnail(placeholderHelper.replace(lEmbed.thumbnail, placeholders));
            }
            if (lEmbed.image) embed.setImage(placeholderHelper.replace(lEmbed.image, placeholders));

            await channel.send({ embeds: [embed] });

        } catch (error) {
            logger.error('[Welcome] Error in guildMemberRemove:', error);
        }
    }
};
