import { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getButtonStyle } from '../../../utils/uiBuilder.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import Background from '../../../models/Background.js';
import VoiceQueue from '../../../models/VoiceQueue.js';
import Guild from '../../../models/Guild.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { updateDashboard } from '../utils/voiceDashboard.js';
import { resolveVoiceChannelName } from '../../../utils/namingHelper.js';
import { sendLog } from '../../../utils/notificationSender.js';
import messageService from '../../../utils/messageService.js';
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
            const reasons = [];
            try {
                // Check if paused
                if (config.voiceSettings.paused) {
                    await member.voice.disconnect('Ufficio Vocale temporaneamente chiuso.');
                    return messageService.sendNotification(guild, member, 'support', 'paused', {}, config.voiceSettings.notifications);
                }

                // Anti-Spam Check
                const now = Date.now();
                const lastJoin = antiSpam.get(member.id);
                if (lastJoin && (now - lastJoin < (config.voiceSettings.queueCooldown || 5) * 60 * 1000)) {
                    await member.voice.disconnect('Anti-Spam Cooldown active.');
                    return messageService.sendNotification(guild, member, 'support', 'cooldown', {}, config.voiceSettings.notifications);
                }
                antiSpam.set(member.id, now);

                // --- Master Mode Flow Validation ---
                const m = config.mode;
                
                // 1. Block access if Voice WL is not part of this mode
                const hasVoice = ['VOICE', 'HYBRID', 'BG_VOICE', 'FULL'].includes(m);
                if (!hasVoice) {
                    await member.voice.disconnect('Procedura non prevista.');
                    return messageService.sendNotification(guild, member, 'whitelist', 'voice_procedural_error', {}, config.voiceSettings.notifications);
                }

                // 2. Background Prerequisite
                const requiresBG = ['BG_VOICE', 'FULL'].includes(m) || config.flowRequirements.requireBackground;
                if (requiresBG) {
                    const bgApp = await Background.findOne({ userId: member.id, guildId: guild.id, status: 'ACCEPTED' });
                    if (!bgApp) {
                        reasons.push('- Background non inviato o non ancora accettato.');
                    }
                }

                // 3. Written WL Prerequisite
                const requiresWritten = ['HYBRID', 'FULL'].includes(m) || config.flowRequirements.requireTextWL;
                if (requiresWritten) {
                    const textApp = await WhitelistApp.findOne({ 
                        userId: member.id, 
                        guildId: guild.id, 
                        status: { $in: ['ACCEPTED', 'WAITING_VOICE'] } 
                    });
                    if (!textApp) {
                        reasons.push('- Prova scritta non completata o in attesa di approvazione.');
                    }
                }

                // 4. Voice Rejection Cooldown Check
                const textAppForCooldown = await WhitelistApp.findOne({ userId: member.id, guildId: guild.id }).sort({ lastVoiceRejectionAt: -1 });
                if (textAppForCooldown && textAppForCooldown.lastVoiceRejectionAt && config.voiceSettings.rejectionCooldown > 0) {
                    const cooldownMs = config.voiceSettings.rejectionCooldown * 60 * 60 * 1000;
                    const timePassed = Date.now() - textAppForCooldown.lastVoiceRejectionAt.getTime();
                    
                    if (timePassed < cooldownMs) {
                        const remainingHours = Math.ceil((cooldownMs - timePassed) / (60 * 60 * 1000));
                        reasons.push(`- Hai fallito l'ultimo colloquio. Potrai riprovare tra circa **${remainingHours} ore**.`);
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
                            await messageService.send(logChannel, 'whitelist', 'queue_log', { 
                                user: member, 
                                waiting_count: waitingCount 
                            }, { content: pings });
                        }
                    }
                    
                    return messageService.sendNotification(guild, member, 'support', 'queueFull', { 
                        vip_priority: isVip ? '💎 **Priorità VIP Attiva!**' : '' 
                    }, config.voiceSettings.notifications);
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
            // Check if the old channel was an interview channel when it becomes empty
            if (oldChannel && oldChannel.members.size === 0) {
                // Find session regardless of status
                const session = await VoiceQueue.findOne({ voiceChannelId: oldChannel.id });
                if (session) {
                    let statusChanged = false;
                    if (session.status === 'ACTIVE') {
                        session.status = 'COMPLETED';
                        statusChanged = true;
                    }

                    if (config.voiceSettings.autoDelete && !session.deletionScheduledAt) {
                        session.deletionScheduledAt = new Date(Date.now() + 5000);
                        statusChanged = true;
                    }
                    
                    if (statusChanged) {
                        await session.save();
                    }
                    
                    // Process queue and update dashboard immediately
                    await processQueue(guild, config, client);
                    await updateDashboard(guild, client);
                }
            }
        }
    },
};

/**
 * Starts a new voice session for a member.
 */
async function startVoiceSession(member, guild, config, client) {
    // Increment session counter and fetch the new number
    const updatedConfig = await WhitelistConfig.findOneAndUpdate(
        { guildId: guild.id },
        { $inc: { 'voiceSettings.sessionCounter': 1 } },
        { returnDocument: 'after' }
    );
    const sessionCount = updatedConfig?.voiceSettings?.sessionCounter || 0;

    // Resolve channel name from config template
    const channelName = await resolveVoiceChannelName(guild.id, {
        user: member.user.username,
        id: member.id,
        count: sessionCount
    }, config.voiceSettings?.channelNameTemplate);

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
        content: `🎤 **UDIENZA AVVIATA:** Il cittadino ${member} è stato ammesso nel dipartimento **${channelName}**`
    });

    // Create session record
    await VoiceQueue.findOneAndUpdate(
        { userId: member.id, guildId: guild.id, status: { $in: ['WAITING', 'ACTIVE'] } },
        { status: 'ACTIVE', voiceChannelId: tempChannel.id, joinedAt: new Date() },
        { upsert: true }
    );

    // 3. Written Test Recap
    let recap = '*Nessuna prova scritta trovata.*';
    let textAppId = null;
    try {
        const lastApp = await WhitelistApp.findOne({
            userId: member.id,
            guildId: guild.id,
            status: { $in: ['ACCEPTED', 'WAITING_VOICE', 'SUBMITTED'] }
        }).sort({ submittedAt: -1 });

        if (lastApp && lastApp.answers && lastApp.answers.length > 0) {
            textAppId = lastApp._id;
            recap = lastApp.answers.map((a, i) => `**${i + 1}. ${a.question}**\n> ${a.answer}`).join('\n\n');
            
            if (recap.length > 3800) {
                recap = recap.substring(0, 3797) + '...';
            }
        }
    } catch (err) {
        logger.error('Error fetching written recap:', err);
    }

    // 4. Background Story Recap
    let bgEmbed = null;
    try {
        const bgApp = await Background.findOne({
            userId: member.id,
            guildId: guild.id,
            status: 'ACCEPTED'
        }).sort({ submittedAt: -1 });

        if (bgApp) {
            bgEmbed = new EmbedBuilder()
                .setTitle(`📖 Background Story: ${member.user.username}`)
                .setDescription(bgApp.description || '*Nessuna descrizione fornita*')
                .setColor('#f39c12') // Orange/Gold for BG
                .addFields(
                    { name: '🔗 Link Documentazione', value: bgApp.link ? `[Consultabile Qui](${bgApp.link})` : '*Link mancante*' }
                );
            
            if (bgApp.attachmentURL) {
                bgEmbed.setThumbnail(bgApp.attachmentURL);
            }
        }
    } catch (err) {
        logger.error('Error fetching BG recap:', err);
    }

    // Send Control Panel in the Temp VC (Text-in-Voice)
    const controlEmbed = buildEmbed(config.embeds.voice_guide, {
        user: member.user,
        start_time: `<t:${Math.floor(Date.now() / 1000)}:R>`
    }, config);

    if (controlEmbed) {
        // Enforce a completely clean guide embed overriding whatever old broken configurations are in the DB
        controlEmbed.setDescription(null);
        controlEmbed.setFields([]); // Remove all old broken fields
        controlEmbed.addFields({ name: '⏱️ Inizio Colloquio', value: `<t:${Math.floor(Date.now() / 1000)}:R>` });
    }

    const recapEmbed = new EmbedBuilder()
        .setTitle(`📑 Archivio Dichiarazioni: ${member.user.username}`)
        .setDescription(recap)
        .setColor(config.colors?.primary || '#3BA4FF');

    const buttons = config.voiceSettings.voiceButtons || {};
    const controlRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`approve_voice_${member.id}`)
            .setLabel(buttons.approve?.label || 'Accetta')
            .setEmoji(buttons.approve?.emoji || '✅')
            .setStyle(getButtonStyle(buttons.approve?.style)),
        new ButtonBuilder()
            .setCustomId(`deny_voice_${member.id}`)
            .setLabel(buttons.deny?.label || 'Rifiuta')
            .setEmoji(buttons.deny?.emoji || '❌')
            .setStyle(getButtonStyle(buttons.deny?.style)),
        new ButtonBuilder()
            .setCustomId(`reset_timer_voice_${member.id}`)
            .setLabel(buttons.reset?.label || 'Riavvia Timer')
            .setEmoji(buttons.reset?.emoji || '⏱️')
            .setStyle(getButtonStyle(buttons.reset?.style))
    );

    if (controlEmbed) {
        const finalEmbeds = [controlEmbed, recapEmbed];
        if (bgEmbed) finalEmbeds.push(bgEmbed);
        await tempChannel.send({ embeds: finalEmbeds, components: [controlRow] });
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
                    .setStyle(getButtonStyle(buttons.approve?.style)),
                new ButtonBuilder()
                    .setCustomId(`deny_voice_${member.id}`)
                    .setLabel(buttons.deny?.label || 'Rifiuta')
                    .setEmoji(buttons.deny?.emoji || '❌')
                    .setStyle(getButtonStyle(buttons.deny?.style))
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
