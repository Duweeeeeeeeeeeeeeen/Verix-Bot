import { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import Background from '../../../models/Background.js';
import VoiceQueue from '../../../models/VoiceQueue.js';
import Guild from '../../../models/Guild.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { updateDashboard } from '../utils/voiceDashboard.js';
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
        if (!guildData) {
            logger.warn(`[VOICE-DEBUG] Guild data not found for ${guild.id}`);
            return;
        }

        if (!guildData.enabledModules?.includes('whitelist')) {
            logger.info(`[VOICE-DEBUG] Whitelist module disabled for ${guild.name}`);
            return;
        }

        const config = await WhitelistConfig.findOne({ guildId: guild.id });
        if (!config) {
            logger.warn(`[VOICE-DEBUG] Whitelist configuration not found for ${guild.name}`);
            return;
        }

        if (config.mode === 'TEXT') return;

        logger.info(`[VOICE-DEBUG] VoiceStateUpdate for ${member.user.tag} in ${guild.name}. Channel: ${channelId || 'NULL'}`);

        // 1. JOIN LOGIC
        if (channelId && channelId === config.voiceSettings.joinChannelId) {
            logger.info(`[VOICE-DEBUG] User ${member.user.tag} joined the Join Channel in ${guild.name}`);
            try {
                // Check if paused
                if (config.voiceSettings.paused) {
                    await member.voice.disconnect('Whitelist Vocale temporaneamente chiusa.');
                    return member.send(config.voiceSettings.voiceMessages?.paused || '⏸️ Il sistema di Whitelist Vocale è attualmente in pausa dallo staff. Riprova più tardi.').catch(() => {});
                }

                // Anti-Spam Check
                const now = Date.now();
                const lastJoin = antiSpam.get(member.id);
                if (lastJoin && (now - lastJoin < (config.voiceSettings.queueCooldown || 5) * 60 * 1000)) {
                    await member.voice.disconnect('Anti-Spam Cooldown active.');
                    return member.send(config.voiceSettings.voiceMessages?.cooldown || '⚠️ Hai provato a unirti troppo velocemente. Attendi qualche minuto prima di riprovare.').catch(() => {});
                }
                antiSpam.set(member.id, now);

                // Flow Validation
                const reasons = [];
                if (config.flowRequirements.requireTextWL) {
                    // In Hybrid mode, we now expect 'WAITING_VOICE' after text approval.
                    // We also allow 'ACCEPTED' for backwards compatibility.
                    const textApp = await WhitelistApp.findOne({ 
                        userId: member.id, 
                        guildId: guild.id, 
                        status: { $in: ['ACCEPTED', 'WAITING_VOICE'] } 
                    });
                    
                    if (!textApp) {
                        logger.warn(`[VOICE-DEBUG] User ${member.user.tag} rejected: No accepted/waiting text application found.`);
                        reasons.push('- Whitelist Testuale non completata o in attesa di approvazione.');
                    }
                }
                if (config.flowRequirements.requireBackground) {
                    const bgApp = await Background.findOne({ userId: member.id, guildId: guild.id, status: 'ACCEPTED' });
                    if (!bgApp) {
                        logger.warn(`[VOICE-DEBUG] User ${member.user.tag} rejected: No accepted background found.`);
                        reasons.push('- Background non inviato o accettato.');
                    }
                }

                if (reasons.length > 0) {
                    const errorEmbed = buildEmbed(config.embeds.voice_error_flow, { user: member.user, reason: reasons.join('\n') });
                    await member.send({ embeds: [errorEmbed] }).catch(() => {});
                    await member.voice.disconnect('Requisiti non soddisfatti.');
                    return;
                }

                // VIP Detection
                const isVip = config.voiceSettings.vipRoleId ? member.roles.cache.has(config.voiceSettings.vipRoleId) : false;

                // Check active sessions
                const activeSessionsCount = await VoiceQueue.countDocuments({ guildId: guild.id, status: 'ACTIVE' });
                
                if (activeSessionsCount >= (config.voiceSettings.maxConcurrent || 1)) {
                    // Add to Queue (with VIP priority)
                    await VoiceQueue.findOneAndUpdate(
                        { userId: member.id, guildId: guild.id, status: 'WAITING' },
                        { isVip, joinedAt: isVip ? new Date(0) : new Date() }, // VIPs move forward
                        { upsert: true }
                    );
                    
                    const waitingCount = await VoiceQueue.countDocuments({ guildId: guild.id, status: 'WAITING' });
                    await updateDashboard(guild, client);
                    
                    // Staff Notification
                    if (config.logChannelId) {
                        const logChannel = guild.channels.cache.get(config.logChannelId);
                        if (logChannel) {
                            const pings = config.voiceSettings.pingStaffOnJoin 
                                ? (config.staffRoleIds || []).map(id => `<@&${id}>`).join(' ') 
                                : '';
                            await logChannel.send(`${pings} 📢 **Nuovo utente in coda!**\nUtente: ${member} (${member.id})\nCoda attuale: \`${waitingCount}\``);
                        }
                    }
                    
                    const queueMsg = config.voiceSettings.voiceMessages?.queueFull || '⏳ Tutti gli uffici sono occupati. Sei in coda. {vip_priority} Verrai spostato automaticamente appena disponibile.';
                    const finalMsg = queueMsg.replace('{vip_priority}', isVip ? '💎 **Priorità VIP Attiva!**' : '');
                    return member.send(finalMsg).catch(() => {});
                }

                // Start Session
                await startVoiceSession(member, guild, config, client);
                await updateDashboard(guild, client);

            } catch (error) {
                logger.error('Error in Voice Manager Join:', error);
            }
        }

        // 2. LEAVE LOGIC (Auto Delete & Next in Queue)
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            const oldChannel = oldState.channel;
            if (oldChannel && oldChannel.name.startsWith('wl-') && oldChannel.members.size === 0) {
                // Delete Session Record
                const session = await VoiceQueue.findOne({ voiceChannelId: oldChannel.id, status: 'ACTIVE' });
                if (session) {
                    session.status = 'COMPLETED';
                    await session.save();
                }

                if (config.voiceSettings.autoDelete) {
                    session.deletionScheduledAt = new Date(Date.now() + 5000);
                    await session.save();
                }
                
                // Process queue and update dashboard immediately
                await processQueue(guild, config, client);
                await updateDashboard(guild, client);
            }
        }
    },
};

/**
 * Starts a new voice session for a member.
 */
async function startVoiceSession(member, guild, config, client) {
    // Resolve channel name from GlobalConfig template (fallback: 'wl-{user}')
    const channelName = await resolveVoiceChannelName(guild.id, {
        user: member.user.username,
        id: member.id
    });

    const existingChannel = guild.channels.cache.find(c => c.name === channelName.toLowerCase());
    if (existingChannel) return member.voice.setChannel(existingChannel);

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

    // If no staff roles configured, fallback to owner or specific handling if needed
    if (overwrites.length === 2 && guild.ownerId) {
        overwrites.push({
            id: guild.ownerId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
        });
    }

    const tempChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: config.voiceSettings.categoryId,
        permissionOverwrites: overwrites,
    });

    await member.voice.setChannel(tempChannel);

    // GlobalConfig log for voice session start
    await sendLog({
        event: 'voice.onVoiceStart',
        guildId: guild.id,
        guild,
        content: `🎤 Nuovo colloquio vocale avviato — ${member} nel canale **${channelName}**`
    });

    // Create session record
    await VoiceQueue.findOneAndUpdate(
        { userId: member.id, guildId: guild.id, status: { $in: ['WAITING', 'ACTIVE'] } },
        { status: 'ACTIVE', voiceChannelId: tempChannel.id, joinedAt: new Date() },
        { upsert: true }
    );

    // Send Control Panel in the Temp VC (Text-in-Voice)
    const checklist = (config.voiceSettings.interviewChecklist || []).map(i => `◽ ${i}`).join('\n');
    const controlEmbed = buildEmbed(config.embeds.voice_guide, {
        user: member.user,
        checklist: checklist || '*Nessuna checklist configurata*'
    }, config);

    const buttons = config.voiceSettings.voiceButtons || {};
    const controlRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`approve_voice_${member.id}`)
            .setLabel(buttons.approve?.label || 'Accetta')
            .setEmoji(buttons.approve?.emoji || '✅')
            .setStyle(ButtonStyle[buttons.approve?.style] || ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`deny_voice_${member.id}`)
            .setLabel(buttons.deny?.label || 'Rifiuta')
            .setEmoji(buttons.deny?.emoji || '❌')
            .setStyle(ButtonStyle[buttons.deny?.style] || ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`reset_timer_voice_${member.id}`)
            .setLabel(buttons.reset?.label || 'Riavvia Timer')
            .setEmoji(buttons.reset?.emoji || '⏱️')
            .setStyle(ButtonStyle[buttons.reset?.style] || ButtonStyle.Secondary)
    );

    if (controlEmbed) {
        await tempChannel.send({ embeds: [controlEmbed], components: [controlRow] });
    }


    // Notify Staff in Log Channel
    if (config.logChannelId) {
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
            const logEmbed = buildEmbed(config.embeds.voice_staff_log, { user: member.user, voice_channel: tempChannel.name });
            const buttons = config.voiceSettings.voiceButtons || {};
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_voice_${member.id}`)
                    .setLabel(buttons.approve?.label || 'Accetta')
                    .setEmoji(buttons.approve?.emoji || '✅')
                    .setStyle(ButtonStyle[buttons.approve?.style] || ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`deny_voice_${member.id}`)
                    .setLabel(buttons.deny?.label || 'Rifiuta')
                    .setEmoji(buttons.deny?.emoji || '❌')
                    .setStyle(ButtonStyle[buttons.deny?.style] || ButtonStyle.Danger)
            );
            await logChannel.send({ embeds: [logEmbed], components: [row] });
        }
    }

    const startEmbed = buildEmbed(config.embeds.voice_waiting, { user: member.user });
    await member.send({ embeds: [startEmbed] }).catch(() => {});
}

/**
 * Processes the queue and starts the next available session.
 */
async function processQueue(guild, config, client) {
    const activeCount = await VoiceQueue.countDocuments({ guildId: guild.id, status: 'ACTIVE' });
    if (activeCount >= (config.voiceSettings.maxConcurrent || 1)) return;

    // Prioritize VIPs (sorting by isVip DESC then joinedAt ASC)
    const nextInQueue = await VoiceQueue.findOne({ guildId: guild.id, status: 'WAITING' }).sort({ isVip: -1, joinedAt: 1 });
    if (!nextInQueue) return;

    const member = await guild.members.fetch(nextInQueue.userId).catch(() => null);
    if (!member || !member.voice.channelId) {
        nextInQueue.status = 'CANCELLED';
        await nextInQueue.save();
        return processQueue(guild, config, client);
    }

    if (member.voice.channelId === config.voiceSettings.joinChannelId) {
        await startVoiceSession(member, guild, config, client);
    } else {
        nextInQueue.status = 'CANCELLED';
        await nextInQueue.save();
        return processQueue(guild, config, client);
    }
}
