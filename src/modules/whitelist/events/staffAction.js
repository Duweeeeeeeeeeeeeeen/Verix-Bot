import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import WhitelistAudit from '../../../models/WhitelistAudit.js';
import { sendNotification, sendLog } from '../../../utils/notificationSender.js';
import { sendUserNotification } from '../../../utils/notificationService.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle Buttons
        if (interaction.isButton()) {
            const buttonId = interaction.customId;

            // User Buttons
            if (buttonId === 'confirm_wl' || buttonId === 'cancel_wl') {
                const app = await WhitelistApp.findOne({ channelId: interaction.channel.id, userId: interaction.user.id });
                if (!app) return messageService.reply(interaction, 'whitelist', 'session_not_found', {}, { ephemeral: true });

                if (buttonId === 'cancel_wl') {
                    app.deletionScheduledAt = new Date(Date.now() + 5000);
                    await app.save();
                    await messageService.reply(interaction, 'whitelist', 'session_cancelled', { time: '5s' });
                    return setTimeout(() => interaction.channel?.delete().catch(() => {}), 5000);
                }

                if (buttonId === 'confirm_wl') {
                    const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
                    if (!config) return messageService.reply(interaction, 'whitelist', 'not_configured', {}, { ephemeral: true });
                    
                    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                    if (!logChannel) return messageService.reply(interaction, 'whitelist', 'not_configured', {}, { ephemeral: true });

                    const staffEmbed = await messageService.get(interaction.guild.id, 'whitelist', 'staff_received', {
                        user_name: interaction.user.username,
                        user_id: interaction.user.id,
                        channel: `<#${interaction.channel.id}>`,
                        app_id: app._id.toString()
                    });

                    if (staffEmbed) {
                        staffEmbed.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });
                        staffEmbed.addFields(app.answers.map(ans => ({
                            name: `D: ${ans.question}`,
                            value: ans.answer || '*Nessuna risposta*'
                        })));
                    }

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`approve_wl_${app._id}`).setLabel('Accetta').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`deny_wl_${app._id}`).setLabel('Rifiuta').setStyle(ButtonStyle.Danger)
                    );

                    await logChannel.send({ embeds: [staffEmbed], components: [row] });
                    
                    app.status = 'SUBMITTED';
                    app.submittedAt = new Date();
                    await app.save();

                    // Delegate Notification and Log
                    const submitEmbed = await messageService.get(interaction.guild.id, 'whitelist', 'dm_submitted', {
                        guild: interaction.guild.name,
                        user: interaction.user.username
                    });
                    await sendUserNotification(interaction.guild, interaction.user, config.notifications, { 
                        embeds: submitEmbed ? [submitEmbed] : []
                    });
                    await sendLog({
                        event: 'whitelist.onSubmit',
                        guildId: interaction.guild.id,
                        guild: interaction.guild,
                        content: `📋 Nuova candidatura da <@${interaction.user.id}> (ID: \`${interaction.user.id}\`)`
                    });

                    app.deletionScheduledAt = new Date(Date.now() + 10000);
                    await app.save();
                    
                    await messageService.reply(interaction, 'whitelist', 'submission_confirmed', { time: '10s' });
                    return setTimeout(() => interaction.channel?.delete().catch(() => {}), 10000);
                }
            }

            // Staff Buttons
            if (buttonId.startsWith('approve_wl_') || buttonId.startsWith('deny_wl_')) {
                const parts = buttonId.split('_');
                const action = parts[0];
                const appId = parts[2];

                const app = await WhitelistApp.findById(appId);
                if (!app) return messageService.reply(interaction, 'whitelist', 'app_not_found', {}, { ephemeral: true });

                const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
                const user = await client.users.fetch(app.userId).catch(() => null);

                if (action === 'approve') {
                    // Check if further steps (Oral WL) are required
                    const isHybrid = ['HYBRID', 'FULL'].includes(config.mode);
                    app.status = isHybrid ? 'WAITING_VOICE' : 'ACCEPTED';
                    app.reviewedBy = interaction.user.id;
                    await app.save();

                    // Role Management on Text Pass
                    const member = await interaction.guild.members.fetch(app.userId).catch(() => null);
                    if (member) {
                        try {
                            const rolesToAdd = config.rolesToAddOnTextPass || [];
                            const rolesToRemove = config.rolesToRemoveOnTextPass || [];
                            
                            const validRolesToAdd = rolesToAdd.filter(id => interaction.guild.roles.cache.has(id));
                            const validRolesToRemove = rolesToRemove.filter(id => interaction.guild.roles.cache.has(id) && member.roles.cache.has(id));

                            if (validRolesToAdd.length > 0) await member.roles.add(validRolesToAdd);
                            if (validRolesToRemove.length > 0) await member.roles.remove(validRolesToRemove);
                        } catch (err) {
                            logger.error(`Error managing roles on text pass for ${app.userId}:`, err);
                        }
                    }

                    // Audit Log in DB
                    await WhitelistAudit.create({
                        guildId: interaction.guild.id,
                        staffId: interaction.user.id,
                        userId: app.userId,
                        action: app.status,
                        applicationId: app._id,
                        timestamp: new Date()
                    });

                    // Delegate Notification and Log
                    const event = isHybrid ? 'whitelist.onTextPass' : 'whitelist.onAccept';
                    const slug = isHybrid ? 'dm_text_pass' : 'dm_accepted';
                    const resultEmbed = await messageService.get(interaction.guild.id, 'whitelist', slug, {
                        guild: interaction.guild.name,
                        user: user?.username || 'Utente'
                    });

                    await sendUserNotification(interaction.guild, user, config.notifications, {
                        embeds: resultEmbed ? [resultEmbed] : []
                    });

                    // Update the staff embed to show status
                    const dmStatus = 'Inviata (config)'; // Simplified since it now depends on config mode

                    const originalEmbed = interaction.message.embeds[0];
                    if (originalEmbed) {
                        const updatedEmbed = EmbedBuilder.from(originalEmbed)
                            .setTitle(isHybrid ? '📝 Scritto SUPERATO' : '✅ Whitelist ACCETTATA')
                            .setColor(isHybrid ? '#f1c40f' : '#2ecc71') // Yellow for waiting, Green for done
                            .addFields(
                                { name: 'Esito', value: isHybrid ? `📝 Parte scritta approvata da ${interaction.user.tag}` : `✅ Accettata da ${interaction.user.tag}` },
                                { name: 'Notifica DM', value: dmStatus, inline: true }
                            );

                        if (isHybrid) {
                            updatedEmbed.addFields({ name: 'Prossimo Step', value: '🎤 Attesa Colloquio Vocale', inline: true });
                        }

                        await interaction.update({ embeds: [updatedEmbed], components: [] });
                    } else {
                        const msg = isHybrid 
                            ? `✅ Parte scritta approvata da ${interaction.user.tag}. In attesa di colloquio vocale.`
                            : `✅ Pratica approvata definitivamente da ${interaction.user.tag}.`;
                        await interaction.update({ content: `${msg} (${dmStatus})`, embeds: [], components: [] });
                    }

                    await sendLog({
                        event,
                        guildId: interaction.guild.id,
                        guild: interaction.guild,
                        content: isHybrid 
                            ? `📝 <@${app.userId}> ha superato la prova scritta (Staff: ${interaction.user}). Ora in attesa di colloquio vocale.`
                            : `✅ Candidatura di <@${app.userId}> **accettata** da ${interaction.user} — Dossier: \`${app._id}\``
                    });
                    return;
                }

                if (action === 'deny') {
                    // Open Modal for Reason
                    const modal = new ModalBuilder()
                        .setCustomId(`deny_modal_${app._id}`)
                        .setTitle('Motivo Rifiuto Whitelist');

                    const reasonInput = new TextInputBuilder()
                        .setCustomId('denial_reason')
                        .setLabel('Inserisci il motivo del rifiuto')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Es: Risposte troppo brevi, mancato rispetto delle regole RP...')
                        .setRequired(true)
                        .setMinLength(10)
                        .setMaxLength(500);

                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
                    modal.addComponents(firstActionRow);

                    await interaction.showModal(modal);
                }
            }
        }

        // Handle Modals
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('deny_modal_')) {
                await interaction.deferUpdate();
                const appId = interaction.customId.split('_')[2];
                const reason = interaction.fields.getTextInputValue('denial_reason');

                const app = await WhitelistApp.findById(appId);
                if (!app) return messageService.reply(interaction, 'whitelist', 'app_not_found', {}, { ephemeral: true });

                const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
                const user = await client.users.fetch(app.userId).catch(() => null);

                app.status = 'REJECTED';
                app.reviewedBy = interaction.user.id;
                app.rejectionReason = reason;
                await app.save();

                // Audit Log in DB
                await WhitelistAudit.create({
                    guildId: interaction.guild.id,
                    staffId: interaction.user.id,
                    userId: app.userId,
                    action: 'REJECTED',
                    reason: reason,
                    applicationId: app._id,
                    timestamp: new Date()
                });

                // Delegate Notification and Log
                const rejectEmbed = await messageService.get(interaction.guild.id, 'whitelist', 'dm_rejected', {
                    guild: interaction.guild.name,
                    user: user?.username || 'Utente',
                    reason: reason
                });

                await sendUserNotification(interaction.guild, user, config.notifications, {
                    embeds: rejectEmbed ? [rejectEmbed] : []
                });

                // Update the staff embed to show status
                const dmStatus = 'Inviata (config)';

                const originalEmbed = interaction.message.embeds[0];
                if (originalEmbed) {
                    const updatedEmbed = EmbedBuilder.from(originalEmbed)
                        .setTitle('❌ Whitelist RIFIUTATA')
                        .setColor('#e74c3c') // Red
                        .addFields(
                            { name: 'Esito', value: `❌ Rifiutata da ${interaction.user.tag}` },
                            { name: 'Motivo', value: reason || 'Nessuna motivazione' },
                            { name: 'Notifica DM', value: dmStatus, inline: true }
                        );

                    await interaction.editReply({ embeds: [updatedEmbed], components: [] });
                } else {
                    await interaction.editReply({ content: `❌ Pratica rifiutata da ${interaction.user.tag} per: ${reason} (${dmStatus})`, embeds: [], components: [] });
                }

                await sendLog({
                    event: 'whitelist.onReject',
                    guildId: interaction.guild.id,
                    guild: interaction.guild,
                    content: `❌ Candidatura di <@${app.userId}> **rifiutata** da ${interaction.user} — Motivo: ${reason}`
                });
            }
        }
    },
};
