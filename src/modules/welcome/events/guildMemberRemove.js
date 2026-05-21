import messageService from '../../../utils/messageService.js';
import WelcomeConfig from '../../../models/WelcomeConfig.js';
import logger from '../../../utils/logger.js';
import placeholderHelper from '../../../utils/placeholderHelper.js';

export default {
    name: 'guildMemberRemove',
    execute: async (member, client) => {
        try {
            const config = await WelcomeConfig.findOne({ guildId: member.guild.id });
            if (!config || !config.enabled || !config.leave.enabled || !config.leave.channelId) return;

            const channel = await member.guild.channels.fetch(config.leave.channelId).catch(() => null);
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

            // Use messageService for fallback to localized defaults
            const embed = await messageService.get(member.guild.id, 'welcome', 'leave', placeholders);

            // Override with DB values if they are NOT placeholders
            if (!isPlaceholder(lEmbed.title)) embed.setTitle(placeholderHelper.replace(lEmbed.title, placeholders));
            if (!isPlaceholder(lEmbed.description)) embed.setDescription(placeholderHelper.replace(lEmbed.description, placeholders));
            if (lEmbed.color && lEmbed.color !== '#000000' && lEmbed.color !== '#e74c3c') embed.setColor(lEmbed.color);
            if (lEmbed.footer) embed.setFooter({ text: placeholderHelper.replace(lEmbed.footer, placeholders), iconURL: member.guild.iconURL() });
            if (lEmbed.thumbnail && !isPlaceholder(lEmbed.thumbnail)) {
                embed.setThumbnail(placeholderHelper.replace(lEmbed.thumbnail, placeholders));
            } else {
                embed.setThumbnail(placeholders.user_avatar);
            }
            if (lEmbed.image) embed.setImage(placeholderHelper.replace(lEmbed.image, placeholders));

            await channel.send({ embeds: [embed] });

        } catch (error) {
            logger.error('[Welcome] Error in guildMemberRemove:', error);
        }
    }
};
