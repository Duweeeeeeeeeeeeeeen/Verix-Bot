import { PermissionFlagsBits } from 'discord.js';
import TempVoiceConfig from '../../../models/TempVoiceConfig.js';
import TempVoice from '../../../models/TempVoice.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import messageService from '../../../utils/messageService.js';
import { t } from '../../../locales/t.js';
import logger from '../../../utils/logger.js';

export default {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const { member, guild } = newState;
        if (member.user.bot) return;

        const config = await TempVoiceConfig.findOne({ guildId: guild.id, enabled: true });
        if (!config || !config.creatorChannelId) return;

        const globalConfig = await GlobalConfig.findOne({ guildId: guild.id });
        const lang = globalConfig?.language || 'en';

        // 1. User joins the Creator Channel
        if (newState.channelId === config.creatorChannelId) {
            try {
                // Check if user already has a channel (optional: allow multiple or limit to one)
                const existing = await TempVoice.findOne({ ownerId: member.id, guildId: guild.id });
                
                let channelName = config.channelNameTemplate
                    .replace('{user}', member.user.username)
                    .replace('{tag}', member.user.discriminator);

                const parentCategory = config.categoryId || newState.channel.parentId;

                const newChannel = await guild.channels.create({
                    name: channelName,
                    type: 2, // GuildVoice
                    parent: parentCategory,
                    userLimit: config.defaultUserLimit || 0,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: [
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.MoveMembers,
                                PermissionFlagsBits.MuteMembers,
                                PermissionFlagsBits.DeafenMembers
                            ]
                        }
                    ]
                });

                // Move user
                await member.voice.setChannel(newChannel).catch(() => null);

                // Send Control Panel (Localized)
                const embed = await messageService.get(guild.id, 'voice', 'control_panel', { user: member.id });
                embed.addFields(
                    { name: t('voice.owner_field', lang), value: `<@${member.id}>`, inline: true },
                    { name: t('voice.limit_field', lang), value: `${config.defaultUserLimit || t('voice.status_none', lang)}`, inline: true }
                );

                const controlRow = {
                    type: 1,
                    components: [
                        { type: 2, style: 2, label: lang === 'it' ? 'Lucchetto' : 'Lock', custom_id: 'tv_lock', emoji: { name: '🔒' } },
                        { type: 2, style: 2, label: lang === 'it' ? 'Sblocca' : 'Unlock', custom_id: 'tv_unlock', emoji: { name: '🔓' } },
                        { type: 2, style: 2, label: lang === 'it' ? '+1 Posto' : '+1 Slot', custom_id: 'tv_inc', emoji: { name: '➕' } },
                        { type: 2, style: 2, label: lang === 'it' ? '-1 Posto' : '-1 Slot', custom_id: 'tv_dec', emoji: { name: '➖' } },
                        { type: 2, style: 1, label: lang === 'it' ? 'Rinomina' : 'Rename', custom_id: 'tv_rename', emoji: { name: '📝' } }
                    ]
                };

                const controlMessage = await newChannel.send({ embeds: [embed], components: [controlRow] });

                // Track in DB
                await TempVoice.create({
                    guildId: guild.id,
                    channelId: newChannel.id,
                    ownerId: member.id,
                    controlMessageId: controlMessage.id
                });

                logger.info(`[TempVoice] Created channel for ${member.user.tag} in ${guild.name}`);
            } catch (error) {
                logger.error('[TempVoice] Error creating channel:', error);
            }
        }

        // 2. User leaves a channel (Cleanup)
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            const tempChannel = await TempVoice.findOne({ channelId: oldState.channelId });
            if (tempChannel) {
                const channel = oldState.channel;
                if (channel && channel.members.size === 0) {
                    try {
                        await channel.delete();
                        await TempVoice.deleteOne({ channelId: oldState.channelId });
                        logger.info(`[TempVoice] Deleted empty channel ${oldState.channelId} in ${guild.name}`);
                    } catch (error) {
                        logger.error('[TempVoice] Error deleting channel:', error);
                    }
                }
            }
        }
    }
};
