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

            const channel = member.guild.channels.cache.get(config.welcome.channelId);
            if (!channel) return;

            const vars = {
                user: member.user.username,
                user_mention: `<@${member.id}>`,
                user_tag: member.user.tag,
                guild: member.guild.name,
                member_count: member.guild.memberCount.toString()
            };

            const description = placeholderHelper.replace(config.welcome.message, vars);
            const embed = new EmbedBuilder()
                .setColor(config.welcome.color || '#5865F2')
                .setDescription(description)
                .setTimestamp();

            if (config.welcome.style === 'ARTICULATED') {
                embed.setTitle(`✨ Nuovo Arrivo in ${member.guild.name}!`)
                     .addFields(
                        { name: '👤 Utente', value: member.user.tag, inline: true },
                        { name: '🆔 ID', value: member.id, inline: true },
                        { name: '📅 Account Creato', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
                     );
                
                if (config.welcome.useImage) {
                    embed.setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                } else {
                    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
                }
                
                embed.setFooter({ text: `Sei il membro #${member.guild.memberCount}`, iconURL: member.guild.iconURL() });
            } else {
                // SIMPLE style
                embed.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() });
                if (config.welcome.useImage) {
                    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
                }
                embed.setFooter({ text: `Membro #${member.guild.memberCount}` });
            }

            await channel.send({ content: config.welcome.style === 'SIMPLE' ? `<@${member.id}>` : null, embeds: [embed] });

        } catch (error) {
            logger.error('[Welcome] Error in guildMemberAdd:', error);
        }
    }
};
