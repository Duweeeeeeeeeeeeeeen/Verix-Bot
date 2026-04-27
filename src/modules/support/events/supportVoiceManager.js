import { Events, ChannelType, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import SupportConfig from '../../../models/SupportConfig.js';
import SupportQueue from '../../../models/SupportQueue.js';
import Guild from '../../../models/Guild.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { resolveVoiceChannelName } from '../../../utils/namingHelper.js';
import { sendLog } from '../../../utils/notificationSender.js';
import logger from '../../../utils/logger.js';

const antiSpam = new Map();

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const { member, guild, channelId } = newState;
        if (!member || member.user.bot) return;

        // Fetch Guild Config
        const guildData = await Guild.findOne({ guildId: guild.id });
        if (!guildData || !guildData.enabledModules?.includes('support')) return;

        const config = await SupportConfig.findOne({ guildId: guild.id });
        if (!config || !config.enabled) return;

        // 1. JOIN LOGIC
        if (channelId && channelId === config.voiceSettings.joinChannelId) {
            try {
                // Check if paused
                if (config.voiceSettings.paused) {
                    await member.voice.disconnect('Servizio assistenza chiuso.');
                    return member.send(config.voiceSettings.messages.paused).catch(() => {});
                }

                // Anti-Spam Check
                const now = Date.now();
                const lastJoin = antiSpam.get(member.id);
                if (lastJoin && (now - lastJoin < (config.voiceSettings.queueCooldown || 2) * 60 * 1000)) {
                    await member.voice.disconnect('Anti-Spam active.');
                    return member.send(config.voiceSettings.messages.cooldown).catch(() => {});
                }
                antiSpam.set(member.id, now);

                // Check VIP status
                const isVip = config.voiceSettings.vipRoleId ? member.roles.cache.has(config.voiceSettings.vipRoleId) : false;

                // Check active sessions
                const activeSessionsCount = await SupportQueue.countDocuments({ guildId: guild.id, status: 'ACTIVE' });
                
                if (activeSessionsCount >= (config.voiceSettings.maxConcurrent || 1)) {
                    // Add to Queue
                    await SupportQueue.findOneAndUpdate(
                        { userId: member.id, guildId: guild.id, status: 'WAITING' },
                        { joinedAt: new Date(), isVip },
                        { upsert: true }
                    );
                    
                    const waitingCount = await SupportQueue.countDocuments({ guildId: guild.id, status: 'WAITING' });
                    
                    // Staff Notification
                    if (config.logChannelId) {
                        const logChannel = guild.channels.cache.get(config.logChannelId);
                        if (logChannel) {
                            const pings = config.voiceSettings.pingStaffOnJoin 
                                ? (config.staffRoleIds || []).map(id => `<@&${id}>`).join(' ') 
                                : '';
                            const vipText = isVip ? ' ⭐ **UTENTE PRIORITARIO (VIP)**' : '';
                            await logChannel.send(`${pings} 📢 **CODA ASSISTENZA:** Nuovo utente in attesa!${vipText}\nUtente: ${member} (${member.id})\nPosizione: \`${waitingCount}\``);
                        }
                    }
                    
                    return member.send(config.voiceSettings.messages.queueFull).catch(() => {});
                }

                // Start Session
                await startSupportSession(member, guild, config, client);

            } catch (error) {
                logger.error('Error in Support Voice Manager Join:', error);
            }
        }

        // 2. LEAVE LOGIC
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            const oldChannel = oldState.channel;
            if (oldChannel && oldChannel.members.size === 0) {
                const session = await SupportQueue.findOne({ voiceChannelId: oldChannel.id, status: 'ACTIVE' });
                if (session) {
                    session.status = 'COMPLETED';
                    if (config.voiceSettings.autoDelete) {
                        session.deletionScheduledAt = new Date(Date.now() + 5000);
                        // Delete channel after 5 seconds
                        setTimeout(async () => {
                            try {
                                const ch = guild.channels.cache.get(oldChannel.id);
                                if (ch) await ch.delete('Sessione assistenza completata.').catch(() => {});
                            } catch (e) {}
                        }, 5000);
                    }
                    await session.save();
                    
                    // Process queue
                    await processQueue(guild, config, client);
                }
            }
        }
    },
};

async function startSupportSession(member, guild, config, client) {
    const updatedConfig = await SupportConfig.findOneAndUpdate(
        { guildId: guild.id },
        { $inc: { 'voiceSettings.sessionCounter': 1 } },
        { new: true }
    );
    const sessionCount = updatedConfig?.voiceSettings?.sessionCounter || 0;

    const channelName = await resolveVoiceChannelName(guild.id, {
        user: member.user.username,
        id: member.id,
        count: sessionCount
    }, config.voiceSettings?.channelNameTemplate);

    const overwrites = [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
        { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.UseVAD] }
    ];

    (config.staffRoleIds || []).forEach(id => {
        overwrites.push({
            id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
        });
    });

    const tempChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: config.voiceSettings.categoryId,
        permissionOverwrites: overwrites,
    });

    await member.voice.setChannel(tempChannel);

    await SupportQueue.findOneAndUpdate(
        { userId: member.id, guildId: guild.id, status: { $in: ['WAITING', 'ACTIVE'] } },
        { status: 'ACTIVE', voiceChannelId: tempChannel.id, joinedAt: new Date() },
        { upsert: true }
    );

    // Notify Staff in Log Channel
    if (config.logChannelId) {
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle(config.embeds.staffLog.title)
                .setDescription(config.embeds.staffLog.description.replace('{user}', member.toString()).replace('{voice_channel}', tempChannel.name))
                .setColor(config.embeds.staffLog.color)
                .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] });
        }
    }

    await member.send(config.voiceSettings.messages.sessionStart).catch(() => {});
}

async function processQueue(guild, config, client) {
    const activeCount = await SupportQueue.countDocuments({ guildId: guild.id, status: 'ACTIVE' });
    if (activeCount >= (config.voiceSettings.maxConcurrent || 1)) return;

    // Prioritize VIPs, then order by join time
    const nextInQueue = await SupportQueue.findOne({ guildId: guild.id, status: 'WAITING' }).sort({ isVip: -1, joinedAt: 1 });
    if (!nextInQueue) return;

    const member = await guild.members.fetch(nextInQueue.userId).catch(() => null);
    if (!member || !member.voice.channelId || member.voice.channelId !== config.voiceSettings.joinChannelId) {
        nextInQueue.status = 'CANCELLED';
        await nextInQueue.save();
        return processQueue(guild, config, client);
    }

    await startSupportSession(member, guild, config, client);
}
