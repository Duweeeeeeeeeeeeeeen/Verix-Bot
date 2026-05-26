import { ActionRowBuilder, Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import WhitelistAudit from '../../../models/WhitelistAudit.js';
import VoiceQueue from '../../../models/VoiceQueue.js';
import { updateDashboard, getDashboard } from '../utils/voiceDashboard.js';
import { sendUserNotification } from '../../../utils/notificationService.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import { t } from '../../../locales/t.js';

function buildVoiceGuideEmbed(lang, userId, startTime, color = '#3498db') {
    return new EmbedBuilder()
        .setTitle(t('whitelist.voice_guide.title', lang))
        .setDescription(t('whitelist.voice_guide.description', lang, { userId, start_time: startTime }))
        .setColor(color)
        .addFields({ name: `⏱️ ${t('common.start_time', lang)}`, value: startTime });
}

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        try {
            // --- 1. Queue Promotion (Select Menu) ---
            if (interaction.isStringSelectMenu() && interaction.customId === 'promote_user_to_top') {
            const userId = interaction.values[0];
            
            await VoiceQueue.findOneAndUpdate(
                { userId, guildId: interaction.guild.id, status: 'WAITING' },
                { isVip: true, joinedAt: new Date(0) } // Force to the absolute top
            );

            await updateDashboard(interaction.guild, client);
            return messageService.reply(interaction, 'whitelist', 'promote_vip_success', { userId }, { ephemeral: true });
        }

        // --- 2. Dashboard Buttons ---
        if (interaction.isButton() && interaction.customId.startsWith('dashboard_')) {
            const action = interaction.customId.replace('dashboard_', '');
            const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });

            if (action === 'refresh') {
                const { embeds, components } = await getDashboard(interaction.guild.id);
                await interaction.update({ embeds, components });
                return;
            }

            if (action === 'pause' || action === 'resume') {
                config.voiceSettings.paused = (action === 'pause');
                await config.save();
                await updateDashboard(interaction.guild, client);
                return messageService.reply(interaction, 'whitelist', action === 'pause' ? 'pause_success' : 'resume_success', {}, { ephemeral: true });
            }

            if (action === 'skip') {
                const activeSession = await VoiceQueue.findOne({ guildId: interaction.guild.id, status: 'ACTIVE' }).sort({ joinedAt: 1 });
                if (!activeSession) return messageService.reply(interaction, 'whitelist', 'skip_error_no_session', {}, { ephemeral: true });

                activeSession.status = 'CANCELLED';
                await activeSession.save();

                const channel = await interaction.guild.channels.fetch(activeSession.voiceChannelId).catch(() => null);
                if (channel) await channel.delete().catch(() => {});

                await updateDashboard(interaction.guild, client);
                return messageService.reply(interaction, 'whitelist', 'skip_success', {}, { ephemeral: true });
            }
        }

        // --- 3. Interview Control Buttons (Local VC) ---
        if (interaction.isButton() && interaction.customId.startsWith('reset_timer_voice_')) {
            const userId = interaction.customId.split('_')[3];
            const now = new Date();
            const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guild?.id });
            const lang = globalConfig?.language || 'en';
            const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            const startTime = `<t:${Math.floor(now.getTime() / 1000)}:R>`;

            await VoiceQueue.findOneAndUpdate(
                { userId: userId, guildId: interaction.guild.id, status: 'ACTIVE' },
                { staffJoinedAt: now }
            );

            // Rebuild the guide embed from locale defaults, not stale DB content.
            const newEmbed = buildVoiceGuideEmbed(lang, userId, startTime, config?.colors?.primary || '#3498db');

            if (newEmbed) {
                newEmbed.setFields([{ name: `⏱️ ${t('common.start_time', lang)}`, value: startTime }]);
                
                const oldEmbeds = interaction.message.embeds;
                const updatedEmbeds = [newEmbed];
                if (oldEmbeds.length > 1) {
                    updatedEmbeds.push(...oldEmbeds.slice(1)); // Retain recap embeds
                }
                await interaction.update({ embeds: updatedEmbeds, content: null });
            } else {
                await interaction.update({ content: `${t('common.reset_timer', lang)}: ${startTime}` });
            }
            await updateDashboard(interaction.guild, client);
            return;
        }

        // --- 4. Existing Voice Staff Buttons (Log Channel & Local VC) ---
        if (interaction.isButton() && (interaction.customId.startsWith('approve_voice_') || interaction.customId.startsWith('deny_voice_'))) {
            const parts = interaction.customId.split('_');
            const action = parts[0];
            const userId = parts[2];

            const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            if (!config) return;

            // Permission Check: Allow Server Administrator or users with configured staffRoleIds
            const isUserAdmin = interaction.member.permissions.has('Administrator');
            if (!isUserAdmin && config.staffRoleIds && config.staffRoleIds.length > 0) {
                if (!interaction.member.roles.cache.some(role => config.staffRoleIds.includes(role.id))) {
                    const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guild?.id });
                    const lang = globalConfig?.language || 'en';
                    return messageService.reply(interaction, 'whitelist', 'edit_error', { reason: t('system.no_permission.description', lang) }, { ephemeral: true });
                }
            }

            const user = await client.users.fetch(userId).catch(() => null);

            if (action === 'approve') {
                if (interaction.deferred || interaction.replied) return;
                await interaction.deferUpdate();

                // Mark Whitelist Application as ACCEPTED
                await WhitelistApp.findOneAndUpdate(
                    { userId: userId, guildId: interaction.guild.id, status: { $in: ['SUBMITTED', 'WAITING_VOICE', 'ACCEPTED'] } },
                    { status: 'ACCEPTED', reviewedBy: interaction.user.id }
                );

                // Update Queue Status
                await VoiceQueue.findOneAndUpdate(
                    { userId: userId, guildId: interaction.guild.id, status: 'ACTIVE' },
                    { status: 'COMPLETED' }
                );

                // Notifica Utente
                if (user) {
                    const oralAcceptEmbed = await messageService.get(interaction.guild.id, 'voice', 'dm_accepted', {
                        user: user.username,
                        guild: interaction.guild.name
                    });
                    await sendUserNotification(interaction.guild, user, config.notifications, {
                        embeds: oralAcceptEmbed ? [oralAcceptEmbed] : []
                    });
                }

                // --- Role Management ---
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (member) {
                    const toAdd = config.voiceSettings.rolesToAdd || [];
                    const toRemove = config.voiceSettings.rolesToRemove || [];
                    
                    try {
                        if (toAdd.length > 0) await member.roles.add(toAdd, 'Voice whitelist approved');
                        if (toRemove.length > 0) await member.roles.remove(toRemove, 'Voice whitelist approved (previous role cleanup)');
                    } catch (roleError) {
                        logger.error(`Error managing roles for ${member.user.tag}:`, roleError);
                    }
                }

                // Log Audit DB
                await WhitelistAudit.create({
                    userId: userId,
                    guildId: interaction.guild.id,
                    staffId: interaction.user.id,
                    action: 'ACCEPTED',
                    type: 'VOICE',
                    timestamp: new Date()
                });

                await updateDashboard(interaction.guild, client);
                
                const replyEmbed = await messageService.get(interaction.guild.id, 'voice', 'staff_approved', {
                    userId: userId,
                    staff: interaction.user.tag
                });
                
                return interaction.message.edit({ embeds: [replyEmbed], components: [], content: null });
            }

            if (action === 'deny') {
                const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guild?.id });
                const lang = globalConfig?.language || 'en';
                const modal = new ModalBuilder()
                    .setCustomId(`deny_voice_modal_${userId}`)
                    .setTitle(t('voice.rejection_modal_title', lang));

                const reasonInput = new TextInputBuilder()
                    .setCustomId('voice_rejection_reason')
                    .setLabel(t('voice.rejection_modal_label', lang))
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(10);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                await interaction.showModal(modal);
            }
        }

        // Handle Voice Rejection Modal
        if (interaction.isModalSubmit() && interaction.customId.startsWith('deny_voice_modal_')) {
            const userId = interaction.customId.split('_')[3];
            const reason = interaction.fields.getTextInputValue('voice_rejection_reason');

            const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            const user = await client.users.fetch(userId).catch(() => null);

            // Update App Cooldown
            await WhitelistApp.findOneAndUpdate(
                { userId: userId, guildId: interaction.guild.id, status: { $in: ['SUBMITTED', 'WAITING_VOICE', 'ACCEPTED'] } },
                { lastVoiceRejectionAt: new Date() }
            );

            // Notify user (voice specific)
            if (user) {
                const oralRejectEmbed = await messageService.get(interaction.guild.id, 'voice', 'dm_rejected', {
                    user: user.username,
                    guild: interaction.guild.name,
                    reason: reason,
                    cooldown: config.voiceSettings.rejectionCooldown || 24
                });
                await sendUserNotification(interaction.guild, user, config.notifications, {
                    embeds: oralRejectEmbed ? [oralRejectEmbed] : []
                });
            }

            // Log Audit DB
            await WhitelistAudit.create({
                userId: userId,
                guildId: interaction.guild.id,
                staffId: interaction.user.id,
                action: 'REJECTED',
                reason: reason,
                type: 'VOICE'
            });

            // Audit Log Channel
            if (config.logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (logChannel) {
                    const auditEmbed = await messageService.get(interaction.guild.id, 'voice', 'staff_denied', {
                        userId: userId,
                        staff: interaction.user.tag,
                        reason: reason
                    });
                    if (auditEmbed) await logChannel.send({ embeds: [auditEmbed] });
                }
            }

            // Update Queue Status
            await VoiceQueue.findOneAndUpdate(
                { userId: userId, guildId: interaction.guild.id, status: 'ACTIVE' },
                { status: 'COMPLETED' }
            );

            await updateDashboard(interaction.guild, client);
            const replyEmbed = await messageService.get(interaction.guild.id, 'voice', 'staff_denied', {
                userId: userId,
                staff: interaction.user.tag,
                reason: reason
            });
            await interaction.update({ embeds: [replyEmbed], components: [], content: null });
        }
    } catch (error) {
        logger.error('[Whitelist_VoiceStaffAction] Interaction Error:', error);
        const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guild?.id });
        const lang = globalConfig?.language || 'en';
        
        const errEmbed = new EmbedBuilder()
            .setTitle(t('whitelist.edit_error.title', lang) || 'Error')
            .setDescription(t('whitelist.edit_error.description', lang, { reason: error.message || 'An error occurred.' }) || `An error occurred: ${error.message}`)
            .setColor('#e74c3c');

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ embeds: [errEmbed], flags: [MessageFlags.Ephemeral] }).catch(() => {});
        } else {
            await interaction.followUp({ embeds: [errEmbed], flags: [MessageFlags.Ephemeral] }).catch(() => {});
        }
    }
},
};
