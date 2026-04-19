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

            const vars = {
                user: member.user.username,
                user_mention: member.user.toString(),
                user_tag: member.user.tag,
                guild: member.guild.name,
                member_count: member.guild.memberCount.toString()
            };

            const description = placeholderHelper.replace(config.leave.message, vars);
            const embed = new EmbedBuilder()
                .setColor(config.leave.color || '#ED4245')
                .setDescription(description)
                .setTimestamp();

            if (config.leave.style === 'ARTICULATED') {
                embed.setTitle(`👋 Arrivederci!`)
                     .addFields(
                        { name: '👤 Utente', value: member.user.tag, inline: true },
                        { name: '🆔 ID', value: member.id, inline: true }
                     );
                
                if (config.leave.useImage) {
                    embed.setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                } else {
                    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
                }

                embed.setFooter({ text: `Siamo rimasti in ${member.guild.memberCount}`, iconURL: member.guild.iconURL() });
            } else {
                // SIMPLE style
                embed.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() });
                if (config.leave.useImage) {
                    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
                }
                embed.setFooter({ text: `Membri rimanenti: ${member.guild.memberCount}` });
            }

            await channel.send({ embeds: [embed] });

        } catch (error) {
            logger.error('[Welcome] Error in guildMemberRemove:', error);
        }
    }
};
