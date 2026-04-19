import { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import WhitelistAudit from '../../../models/WhitelistAudit.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { sendNotification, sendLog } from '../../../utils/notificationSender.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle Buttons
        if (interaction.isButton()) {
            const buttonId = interaction.customId;

            // User Buttons
            if (buttonId === 'confirm_wl' || buttonId === 'cancel_wl') {
                const app = await WhitelistApp.findOne({ channelId: interaction.channel.id, userId: interaction.user.id });
                if (!app) return interaction.reply({ content: 'Sessione non trovata.', ephemeral: true });

                if (buttonId === 'cancel_wl') {
                    app.deletionScheduledAt = new Date(Date.now() + 5000);
                    await app.save();
                    return interaction.reply('Procedura annullata. Il canale verrà eliminato tra 5 secondi.');
                }

                if (buttonId === 'confirm_wl') {
                    const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
                    if (!config) return interaction.reply({ content: 'Errore: Configurazione non trovata.', ephemeral: true });
                    
                    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                    if (!logChannel) return interaction.reply({ content: 'Errore: Canale log dello staff non trovato.', ephemeral: true });

                    const staffEmbed = buildEmbed(config.embeds.staff_received, {
                        user: interaction.user,
                        user_id: interaction.user.id,
                        app_id: app._id
                    }, config);

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
                    await sendNotification({
                        event: 'whitelist.onSubmit',
                        guildId: interaction.guild.id,
                        guild: interaction.guild,
                        user: interaction.user,
                        embed: config.embeds.dm_submitted?.enabled ? buildEmbed(config.embeds.dm_submitted, {
                            guild: interaction.guild.name,
                            user: interaction.user.username
                        }, config) : null,
                        content: `📋 La tua candidatura in **${interaction.guild.name}** è stata ricevuta! Sarai avvisato a breve.`
                    });
                    await sendLog({
                        event: 'whitelist.onSubmit',
                        guildId: interaction.guild.id,
                        guild: interaction.guild,
                        content: `📋 Nuova candidatura da <@${interaction.user.id}> (ID: \`${interaction.user.id}\`)`
                    });

                    app.deletionScheduledAt = new Date(Date.now() + 10000);
                    await app.save();
                    
                    return interaction.reply('✅ La tua candidatura è stata confermata e inviata allo staff! Sarai avvisato qui a breve.\n\n*Il canale si chiuderà tra 10 secondi.*');
                }
            }

            // Staff Buttons
            if (buttonId.startsWith('approve_wl_') || buttonId.startsWith('deny_wl_')) {
                const parts = buttonId.split('_');
                const action = parts[0];
                const appId = parts[2];

                const app = await WhitelistApp.findById(appId);
                if (!app) return interaction.reply({ content: 'Candidatura non trovata.', ephemeral: true });

                const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
                const user = await client.users.fetch(app.userId).catch(() => null);

                if (action === 'approve') {
                    app.status = 'ACCEPTED';
                    app.reviewedBy = interaction.user.id;
                    await app.save();

                    // Audit Log in DB
                    await WhitelistAudit.create({
                        guildId: interaction.guild.id,
                        staffId: interaction.user.id,
                        userId: app.userId,
                        action: 'ACCEPTED',
                        applicationId: app._id,
                        timestamp: new Date()
                    });

                    // Delegate Notification and Log
                    const notifyResult = await sendNotification({
                        event: 'whitelist.onAccept',
                        guildId: interaction.guild.id,
                        guild: interaction.guild,
                        user,
                        embed: config.embeds.dm_accepted?.enabled ? buildEmbed(config.embeds.dm_accepted, {
                            guild: interaction.guild.name,
                            user: user?.username || 'Utente'
                        }, config) : null,
                        content: `✅ La tua candidatura whitelist in **${interaction.guild.name}** è stata **accettata**! Benvenuto!`
                    });

                    // Update the staff embed to show acceptance and DM status
                    const dmStatus = notifyResult?.dm?.attempted 
                        ? (notifyResult.dm.success ? '✅ Inviata' : '❌ Fallita (DM Chiusi)') 
                        : '灰色 (Disabilitata)';

                    const originalEmbed = interaction.message.embeds[0];
                    if (originalEmbed) {
                        const updatedEmbed = EmbedBuilder.from(originalEmbed)
                            .setTitle('✅ Whitelist ACCETTATA')
                            .setColor('#2ecc71') // Green
                            .addFields(
                                { name: 'Esito', value: `✅ Accettata da ${interaction.user.tag}` },
                                { name: 'Notifica DM', value: dmStatus, inline: true }
                            );

                        await interaction.update({ embeds: [updatedEmbed], components: [] });
                    } else {
                        await interaction.update({ content: `✅ Pratica approvata da ${interaction.user.tag} (${dmStatus})`, embeds: [], components: [] });
                    }

                    await sendLog({
                        event: 'whitelist.onAccept',
                        guildId: interaction.guild.id,
                        guild: interaction.guild,
                        content: `✅ Candidatura di <@${app.userId}> **accettata** da ${interaction.user} — Dossier: \`${app._id}\``
                    });
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
                if (!app) return interaction.followUp({ content: 'Candidatura non trovata.', ephemeral: true });

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
                const notifyResult = await sendNotification({
                    event: 'whitelist.onReject',
                    guildId: interaction.guild.id,
                    guild: interaction.guild,
                    user,
                    embed: config.embeds.dm_rejected?.enabled ? buildEmbed(config.embeds.dm_rejected, {
                        guild: interaction.guild.name,
                        user: user?.username || 'Utente',
                        reason: reason
                    }, config) : null,
                    content: `❌ La tua candidatura whitelist in **${interaction.guild.name}** è stata **rifiutata**.\n> **Motivo:** ${reason}`
                });

                // Update the staff embed to show rejection and DM status
                const dmStatus = notifyResult?.dm?.attempted 
                    ? (notifyResult.dm.success ? '✅ Inviata' : '❌ Fallita (DM Chiusi)') 
                    : '灰色 (Disabilitata)';

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
