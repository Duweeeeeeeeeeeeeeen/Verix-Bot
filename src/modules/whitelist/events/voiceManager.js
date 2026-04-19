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
        if (member?.user.bot) return;

        // Fetch Guild Config
        const guildData = await Guild.findOne({ guildId: guild.id });
        if (!guildData || !guildData.enabledModules?.includes('whitelist')) return;

        const config = await WhitelistConfig.findOne({ guildId: guild.id });
        if (!config || config.mode === 'TEXT') return;

        // 1. JOIN LOGIC
        if (channelId === config.voiceSettings.joinChannelId) {
            try {
                // Check if paused
                if (config.voiceSettings.paused) {
                    await member.voice.disconnect('Whitelist Vocale temporaneamente chiusa.');
                    return member.send('⏸️ Il sistema di Whitelist Vocale è attualmente in pausa dallo staff. Riprova più tardi.').catch(() => {});
                }

                // Anti-Spam Check
                const now = Date.now();
                const lastJoin = antiSpam.get(member.id);
                if (lastJoin && (now - lastJoin < (config.voiceSettings.queueCooldown || 5) * 60 * 1000)) {
                    await member.voice.disconnect('Anti-Spam Cooldown active.');
                    return member.send('⚠️ Hai provato a unirti troppo velocemente. Attendi qualche minuto prima di riprovare.').catch(() => {});
                }
                antiSpam.set(member.id, now);

                // Flow Validation
                const reasons = [];
                if (config.flowRequirements.requireTextWL) {
                    const textApp = await WhitelistApp.findOne({ userId: member.id, guildId: guild.id, status: 'ACCEPTED' });
                    if (!textApp) reasons.push('- Whitelist Testuale non completata o accettata.');
                }
                if (config.flowRequirements.requireBackground) {
                    const bgApp = await Background.findOne({ userId: member.id, guildId: guild.id, status: 'ACCEPTED' });
                    if (!bgApp) reasons.push('- Background non inviato o accettato.');
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
                    
                    return member.send(`⏳ Tutti gli uffici sono occupati. Sei in coda. ${isVip ? '💎 **Priorità VIP Attiva!**' : ''} Verrai spostato automaticamente appena disponibile.`).catch(() => {});
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
    const controlEmbed = new EmbedBuilder()
        .setTitle('🎮 Pannello Controllo Sessione')
        .setDescription(`Utente: ${member.user}\nInizio: <t:${Math.floor(Date.now() / 1000)}:R>`)
        .setColor('#5865F2');

    const controlRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`approve_voice_${member.id}`)
            .setLabel('Accetta')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`deny_voice_${member.id}`)
            .setLabel('Rifiuta')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`reset_timer_voice_${member.id}`)
            .setLabel('Riavvia Timer')
            .setStyle(ButtonStyle.Secondary)
    );

    await tempChannel.send({ embeds: [controlEmbed], components: [controlRow] });

    // Send Interview Checklist (Guide)
    if (config.voiceSettings.interviewChecklist && config.voiceSettings.interviewChecklist.length > 0) {
        const guideEmbed = new EmbedBuilder()
            .setTitle('📝 Guida Colloquio RP')
            .setDescription('Assicurati di coprire i seguenti punti durante l\'intervista:')
            .addFields({ name: 'Checklist', value: config.voiceSettings.interviewChecklist.map(item => `◽ ${item}`).join('\n') })
            .setColor('#f1c40f')
            .setFooter({ text: 'Sistema Voice Whitelist Elite' });
        
        await tempChannel.send({ embeds: [guideEmbed] });
    }

    // Notify Staff in Log Channel
    if (config.logChannelId) {
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
            const logEmbed = buildEmbed(config.embeds.voice_staff_log, { user: member.user, voice_channel: tempChannel.name });
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`approve_voice_${member.id}`).setLabel('Accetta').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`deny_voice_${member.id}`).setLabel('Rifiuta').setStyle(ButtonStyle.Danger)
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
