import { ActionRowBuilder, Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import WhitelistAudit from '../../../models/WhitelistAudit.js';
import VoiceQueue from '../../../models/VoiceQueue.js';
import { updateDashboard, getDashboard } from '../utils/voiceDashboard.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // --- 1. Queue Promotion (Select Menu) ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'promote_user_to_top') {
            const userId = interaction.values[0];
            
            await VoiceQueue.findOneAndUpdate(
                { userId, guildId: interaction.guild.id, status: 'WAITING' },
                { isVip: true, joinedAt: new Date(0) } // Force to the absolute top
            );

            await updateDashboard(interaction.guild, client);
            return interaction.reply({ content: `💎 Utente <@${userId}> promosso in testa alla coda.`, flags: [MessageFlags.Ephemeral] });
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
                return interaction.reply({ content: `✅ Sistema **${action === 'pause' ? 'messo in pausa' : 'riattivato'}**.`, flags: [MessageFlags.Ephemeral] });
            }

            if (action === 'skip') {
                const activeSession = await VoiceQueue.findOne({ guildId: interaction.guild.id, status: 'ACTIVE' }).sort({ joinedAt: 1 });
                if (!activeSession) return interaction.reply({ content: '❌ Nessuna sessione attiva da saltare.', flags: [MessageFlags.Ephemeral] });

                activeSession.status = 'CANCELLED';
                await activeSession.save();

                const channel = await interaction.guild.channels.fetch(activeSession.voiceChannelId).catch(() => null);
                if (channel) await channel.delete().catch(() => {});

                await updateDashboard(interaction.guild, client);
                return interaction.reply({ content: '✅ Sessione saltata. Il prossimo in coda verrà invitato.', flags: [MessageFlags.Ephemeral] });
            }
        }

        // --- 3. Interview Control Buttons (Local VC) ---
        if (interaction.isButton() && interaction.customId.startsWith('reset_timer_voice_')) {
            const userId = interaction.customId.split('_')[3];
            const now = new Date();

            await VoiceQueue.findOneAndUpdate(
                { userId: userId, guildId: interaction.guild.id, status: 'ACTIVE' },
                { staffJoinedAt: now }
            );

            // Rebuild the guide embed to refresh the timer/placeholder if needed
            const member = await interaction.guild.members.fetch(userId).catch(() => null);
            const newEmbed = await messageService.get(interaction.guild.id, 'whitelist', 'voice_guide', {
                userId: userId,
                start_time: `<t:${Math.floor(now.getTime() / 1000)}:R>`
            });

            if (newEmbed) {
                newEmbed.addFields({ name: '⏱️ Inizio Colloquio', value: `<t:${Math.floor(now.getTime() / 1000)}:R>` });
                
                const oldEmbeds = interaction.message.embeds;
                const updatedEmbeds = [newEmbed];
                if (oldEmbeds.length > 1) {
                    updatedEmbeds.push(oldEmbeds[1]); // Retain the recap embed
                }
                await interaction.update({ embeds: updatedEmbeds });
            } else {
                await interaction.update({ content: `⏱️ Timer Riavviato: <t:${Math.floor(now.getTime() / 1000)}:R>` });
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
            const user = await client.users.fetch(userId).catch(() => null);

            if (action === 'approve') {
                if (interaction.deferred || interaction.replied) return;

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
                    const embed = await messageService.get(interaction.guild.id, 'voice', 'dm_accepted', {
                        user: user.username,
                        guild: interaction.guild.name
                    });
                    await user.send({ embeds: [embed] }).catch(() => {});
                }

                // --- Role Management ---
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (member) {
                    const toAdd = config.voiceSettings.rolesToAdd || [];
                    const toRemove = config.voiceSettings.rolesToRemove || [];
                    
                    try {
                        if (toAdd.length > 0) await member.roles.add(toAdd, 'Whitelist Vocale Superata');
                        if (toRemove.length > 0) await member.roles.remove(toRemove, 'Whitelist Vocale Superata (Rimozione Ruoli Precedenti)');
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
                
                return interaction.update({ embeds: [replyEmbed], components: [], content: null });
            }

            if (action === 'deny') {
                const modal = new ModalBuilder()
                    .setCustomId(`deny_voice_modal_${userId}`)
                    .setTitle('Motivo Rifiuto Whitelist Vocale');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('voice_rejection_reason')
                    .setLabel('Inserisci il motivo del rifiuto')
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

            // Notifica Utente (Voice Specific)
            if (user) {
                const embed = await messageService.get(interaction.guild.id, 'voice', 'dm_rejected', {
                    user: user.username,
                    guild: interaction.guild.name,
                    reason: reason,
                    cooldown: config.voiceSettings.rejectionCooldown || 24
                });
                await user.send({ embeds: [embed] }).catch(() => {});
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
    },
};
