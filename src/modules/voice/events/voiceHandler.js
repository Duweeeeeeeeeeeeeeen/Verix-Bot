import { PermissionFlagsBits } from 'discord.js';
import TempVoiceConfig from '../../../models/TempVoiceConfig.js';
import TempVoice from '../../../models/TempVoice.js';
import logger from '../../../utils/logger.js';

export default {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const { member, guild } = newState;
        if (member.user.bot) return;

        const config = await TempVoiceConfig.findOne({ guildId: guild.id, enabled: true });
        if (!config || !config.creatorChannelId) return;

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

                // Send Control Panel
                const controlEmbed = {
                    title: '🎙️ Pannello di Controllo Vocale',
                    description: `Benvenuto <@${member.id}>! Questo è il tuo canale temporaneo.\nUsa i tasti qui sotto per gestirlo rapidamente.`,
                    color: 0x5865F2,
                    fields: [
                        { name: '👑 Proprietario', value: `<@${member.id}>`, inline: true },
                        { name: '👥 Limite', value: `${config.defaultUserLimit || 'Nessuno'}`, inline: true }
                    ]
                };

                const controlRow = {
                    type: 1,
                    components: [
                        { type: 2, style: 2, label: 'Lucchetto', custom_id: 'tv_lock', emoji: { name: '🔒' } },
                        { type: 2, style: 2, label: 'Sblocca', custom_id: 'tv_unlock', emoji: { name: '🔓' } },
                        { type: 2, style: 2, label: '+1 Posto', custom_id: 'tv_inc', emoji: { name: '➕' } },
                        { type: 2, style: 2, label: '-1 Posto', custom_id: 'tv_dec', emoji: { name: '➖' } },
                        { type: 2, style: 1, label: 'Rinomina', custom_id: 'tv_rename', emoji: { name: '📝' } }
                    ]
                };

                await newChannel.send({ embeds: [controlEmbed], components: [controlRow] });

                // Track in DB
                await TempVoice.create({
                    guildId: guild.id,
                    channelId: newChannel.id,
                    ownerId: member.id
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
