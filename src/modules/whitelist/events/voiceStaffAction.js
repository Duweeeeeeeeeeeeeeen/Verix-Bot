import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistAudit from '../../../models/WhitelistAudit.js';
import VoiceQueue from '../../../models/VoiceQueue.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { updateDashboard, getDashboard } from '../utils/voiceDashboard.js';
import logger from '../../../utils/logger.js';

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
            return interaction.reply({ content: `💎 Utente <@${userId}> promosso in testa alla coda.`, ephemeral: true });
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
                return interaction.reply({ content: `✅ Sistema **${action === 'pause' ? 'messo in pausa' : 'riattivato'}**.`, ephemeral: true });
            }

            if (action === 'skip') {
                const activeSession = await VoiceQueue.findOne({ guildId: interaction.guild.id, status: 'ACTIVE' }).sort({ joinedAt: 1 });
                if (!activeSession) return interaction.reply({ content: '❌ Nessuna sessione attiva da saltare.', ephemeral: true });

                activeSession.status = 'CANCELLED';
                await activeSession.save();

                const channel = await interaction.guild.channels.fetch(activeSession.voiceChannelId).catch(() => null);
                if (channel) await channel.delete().catch(() => {});

                await updateDashboard(interaction.guild, client);
                return interaction.reply({ content: '✅ Sessione saltata. Il prossimo in coda verrà invitato.', ephemeral: true });
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

            const oldEmbed = interaction.message.embeds[0];
            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setDescription(`Utente: <@${userId}>\nTimer Riavviato: <t:${Math.floor(now.getTime() / 1000)}:R>`);

            await interaction.update({ embeds: [newEmbed] });
            await updateDashboard(interaction.guild, client);
        }

        // --- 4. Existing Voice Staff Buttons (Log Channel) ---
        if (interaction.isButton() && (interaction.customId.startsWith('approve_voice_') || interaction.customId.startsWith('deny_voice_'))) {
            // ... (rest of the code for approval/rejection)
            const parts = interaction.customId.split('_');
            const action = parts[0];
            const userId = parts[2];

            const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            const user = await client.users.fetch(userId).catch(() => null);

            if (action === 'approve') {
                // Notifica Utente
                if (user && config.embeds.dm_accepted) {
                    const dmEmbed = buildEmbed(config.embeds.dm_accepted, {
                        user: user.username,
                        guild: interaction.guild.name
                    });
                    if (dmEmbed) await user.send({ embeds: [dmEmbed] }).catch(() => {});
                }

                // Log Audit
                await WhitelistAudit.create({
                    userId: userId,
                    guildId: interaction.guild.id,
                    staffId: interaction.user.id,
                    action: 'ACCEPTED',
                    type: 'VOICE'
                });

                // Audit Log in Channel
                if (config.logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                    if (logChannel) {
                        const auditEmbed = buildEmbed(config.embeds.staff_accepted, {
                            user: `<@${userId}>`,
                            staff: interaction.user,
                            app_id: 'VOICE_INTERVIEW'
                        });
                        await logChannel.send({ embeds: [auditEmbed] });
                    }
                }

                // Update Queue Status
                await VoiceQueue.findOneAndUpdate(
                    { userId: userId, guildId: interaction.guild.id, status: 'ACTIVE' },
                    { status: 'COMPLETED' }
                );

                await updateDashboard(interaction.guild, client);
                await interaction.update({ content: `✅ Whitelist Vocale approvata da ${interaction.user.tag}`, embeds: [], components: [] });
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

            // Notifica Utente
            if (user && config.embeds.dm_rejected) {
                const dmEmbed = buildEmbed(config.embeds.dm_rejected, {
                    user: user.username,
                    guild: interaction.guild.name,
                    reason: reason
                });
                if (dmEmbed) await user.send({ embeds: [dmEmbed] }).catch(() => {});
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
                    const auditEmbed = buildEmbed(config.embeds.staff_rejected, {
                        user: `<@${userId}>`,
                        staff: interaction.user,
                        reason: reason,
                        app_id: 'VOICE_INTERVIEW'
                    });
                    await logChannel.send({ embeds: [auditEmbed] });
                }
            }

            // Update Queue Status
            await VoiceQueue.findOneAndUpdate(
                { userId: userId, guildId: interaction.guild.id, status: 'ACTIVE' },
                { status: 'COMPLETED' }
            );

            await updateDashboard(interaction.guild, client);
            await interaction.update({ content: `❌ Whitelist Vocale rifiutata da ${interaction.user.tag} per: ${reason}`, embeds: [], components: [] });
        }
    },
};
