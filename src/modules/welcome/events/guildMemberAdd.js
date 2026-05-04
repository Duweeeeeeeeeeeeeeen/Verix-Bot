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
                user_avatar: member.user.displayAvatarURL({ dynamic: true, size: 512 }),
                guild: member.guild.name,
                member_count: member.guild.memberCount.toString()
            };

            const wEmbed = config.welcome.embed || {};
            const isPlaceholder = (val) => !val || (typeof val === 'string' && (val.trim() === '' || val === 'Senza Titolo' || val === 'Nessun contenuto impostato.'));

            const rawTitle = isPlaceholder(wEmbed.title) ? '✈️ Benvenuto in Città' : wEmbed.title;
            const rawDesc = isPlaceholder(wEmbed.description) ? 'Un nuovo cittadino, **{user}**, è appena atterrato! Ti auguriamo una permanenza prospera.\n\nAssicurati di consultare i protocolli regolamentari per evitare sanzioni.' : wEmbed.description;

            const embed = new EmbedBuilder()
                .setTitle(placeholderHelper.replace(rawTitle, placeholders))
                .setDescription(placeholderHelper.replace(rawDesc, placeholders))
                .setColor(wEmbed.color && wEmbed.color !== '#000000' ? wEmbed.color : '#2ecc71')
                .setThumbnail(placeholders.user_avatar) // Set default thumbnail to user avatar
                .setTimestamp();

            if (wEmbed.footer) embed.setFooter({ text: placeholderHelper.replace(wEmbed.footer, placeholders), iconURL: member.guild.iconURL() });
            if (wEmbed.thumbnail && !isPlaceholder(wEmbed.thumbnail)) {
                embed.setThumbnail(placeholderHelper.replace(wEmbed.thumbnail, placeholders));
            }
            if (wEmbed.image) embed.setImage(placeholderHelper.replace(wEmbed.image, placeholders));

            await channel.send({ embeds: [embed] });

        } catch (error) {
            logger.error('[Welcome] Error in guildMemberAdd:', error);
        }
    }
};
