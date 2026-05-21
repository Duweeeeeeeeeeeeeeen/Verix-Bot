import messageService from '../../../utils/messageService.js';
import WelcomeConfig from '../../../models/WelcomeConfig.js';
import logger from '../../../utils/logger.js';
import placeholderHelper from '../../../utils/placeholderHelper.js';

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
                user_avatar: member.user.displayAvatarURL({ dynamic: true, size: 512 }),
                guild: member.guild.name,
                member_count: member.guild.memberCount.toString()
            };

            const wEmbed = config.welcome.embed || {};
            const isPlaceholder = (val) => !val || (typeof val === 'string' && (val.trim() === '' || val === 'Senza Titolo' || val === 'Nessun contenuto impostato.'));

            // Use messageService for fallback to localized defaults
            const embed = await messageService.get(member.guild.id, 'welcome', 'join', placeholders);

            // Override with DB values if they are NOT placeholders
            if (!isPlaceholder(wEmbed.title)) embed.setTitle(placeholderHelper.replace(wEmbed.title, placeholders));
            if (!isPlaceholder(wEmbed.description)) embed.setDescription(placeholderHelper.replace(wEmbed.description, placeholders));
            if (wEmbed.color && wEmbed.color !== '#000000' && wEmbed.color !== '#2ecc71') embed.setColor(wEmbed.color);
            if (wEmbed.footer) embed.setFooter({ text: placeholderHelper.replace(wEmbed.footer, placeholders), iconURL: member.guild.iconURL() });
            if (wEmbed.thumbnail && !isPlaceholder(wEmbed.thumbnail)) {
                embed.setThumbnail(placeholderHelper.replace(wEmbed.thumbnail, placeholders));
            } else {
                embed.setThumbnail(placeholders.user_avatar);
            }
            if (wEmbed.image) embed.setImage(placeholderHelper.replace(wEmbed.image, placeholders));

            await channel.send({ embeds: [embed] });

        } catch (error) {
            logger.error('[Welcome] Error in guildMemberAdd:', error);
        }
    }
};
