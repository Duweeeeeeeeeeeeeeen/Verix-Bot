import { ActionRowBuilder, Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import Background from '../../../models/Background.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { sendUserNotification } from '../../../utils/notificationService.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle Approval/Denial Buttons
        if (interaction.isButton() && (interaction.customId.startsWith('approve_bg_') || interaction.customId.startsWith('deny_bg_'))) {
            const parts = interaction.customId.split('_');
            const action = parts[0];
            const appId = parts[2];

            const app = await Background.findById(appId);
            if (!app) return messageService.reply(interaction, 'background', 'error', { reason: 'Richiesta non trovata.' }, { ephemeral: true });

            const config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
            if (!config) return;

            // Permission Check
            if (config.staffRoleIds && config.staffRoleIds.length > 0) {
                if (!interaction.member.roles.cache.some(role => config.staffRoleIds.includes(role.id))) {
                    return messageService.reply(interaction, 'background', 'error', { reason: 'Non hai i permessi necessari per gestire i background.' }, { ephemeral: true });
                }
            }

            const user = await client.users.fetch(app.userId).catch(() => null);

            if (action === 'approve') {
                // Fetch Whitelist Config for instructions
                const wlConfig = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
                let nextStep = "";
                if (wlConfig && wlConfig.enabled) {
                    const m = wlConfig.mode;
                    if (m === 'BG_ONLY') nextStep = "\n\n✅ **Percorso Completato:** Il tuo background è stato archiviato con successo!";
                    else if (m === 'BG_TEXT' || m === 'FULL') nextStep = "\n\n➡️ **Prossimo Step:** Ora puoi procedere con la **Whitelist Scritta**!";
                    else if (m === 'BG_VOICE') nextStep = "\n\n➡️ **Prossimo Step:** Ora puoi recarti nel canale vocale per il **Colloquio Orale**!";
                }

                app.status = 'ACCEPTED';
                app.reviewedBy = interaction.user.id;
                await app.save();

                const citizen = await interaction.guild.members.fetch(app.userId).catch(() => null);
                
                // --- ROLE AUTOMATIONS ---
                if (citizen) {
                    try {
                        if (config.rolesToAdd && config.rolesToAdd.length > 0) {
                            await citizen.roles.add(config.rolesToAdd).catch(err => logger.warn(`[Background] Could not add roles to ${citizen.id}: ${err.message}`));
                        }
                        if (config.rolesToRemove && config.rolesToRemove.length > 0) {
                            await citizen.roles.remove(config.rolesToRemove).catch(err => logger.warn(`[Background] Could not remove roles from ${citizen.id}: ${err.message}`));
                        }
                    } catch (err) {
                        logger.error(`[Background] Error in role automation for ${citizen.id}:`, err);
                    }
                }

                // --- PROGRESSION FEEDBACK ---
                const userChannel = interaction.guild.channels.cache.get(app.channelId) || await interaction.guild.channels.fetch(app.channelId).catch(() => null);
                
                if (userChannel) {
                    const acceptEmbed = buildEmbed(config.embeds.integrated_accepted, {
                        user: citizen || app.userId,
                        guild: interaction.guild.name,
                        user_id: citizen?.id || app.userId,
                        staff: interaction.user.toString(),
                        staff_id: interaction.user.id
                    }, config);

                    const startButton = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('start_whitelist_from_bg')
                            .setLabel('Inizia Test Scritto')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('📝')
                    );

                    await userChannel.send({ content: `${citizen || `<@${app.userId}>`}`, embeds: [acceptEmbed], components: [startButton] });
                }

                // --- UPDATE STAFF LOG ---
                const originalEmbed = interaction.message.embeds[0];
                if (originalEmbed) {
                    const updatedEmbed = EmbedBuilder.from(originalEmbed)
                        .setTitle('✅ Dossier APPROVATO')
                        .setColor('#2ecc71')
                        .addFields(
                            { name: '👤 Soggetto', value: citizen?.toString() || `<@${app.userId}>`, inline: true },
                            { name: '👮 Ufficiale', value: interaction.user.toString(), inline: true },
                            { name: 'Esito Staff', value: `✅ Approvato da ${interaction.user.tag}` }
                        );
                    
                    await interaction.update({ embeds: [updatedEmbed], components: [] });
                } else {
                    await interaction.update({ content: `✅ Background approvato da ${interaction.user.tag}`, embeds: [], components: [] });
                }

                // Notification to User
                if (user && config.embeds.dm_accepted) {
                    const dmEmbed = buildEmbed(config.embeds.dm_accepted, {
                        user: user.username,
                        guild: interaction.guild.name
                    }, config);
                    
                    if (dmEmbed) {
                        const currentDesc = dmEmbed.data.description || "";
                        dmEmbed.setDescription(currentDesc + nextStep);
                        await sendUserNotification(interaction.guild, user, config.notifications, { embeds: [dmEmbed] });
                    }
                }
            }

            if (action === 'deny') {
                const modal = new ModalBuilder()
                    .setCustomId(`deny_bg_modal_${app._id}`)
                    .setTitle('Motivo Rifiuto Background');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('bg_rejection_reason')
                    .setLabel('Inserisci il motivo del rifiuto')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(10);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                await interaction.showModal(modal);
            }
        }

        // Handle Rejection Modal Submit
        if (interaction.isModalSubmit() && interaction.customId.startsWith('deny_bg_modal_')) {
            const appId = interaction.customId.split('_')[3];
            const reason = interaction.fields.getTextInputValue('bg_rejection_reason');

            const app = await Background.findById(appId);
            if (!app) return messageService.reply(interaction, 'background', 'error', { reason: 'Richiesta non trovata.' }, { ephemeral: true });

            const config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
            const user = await client.users.fetch(app.userId).catch(() => null);

            app.status = 'REJECTED';
            app.reviewedBy = interaction.user.id;
            app.rejectionReason = reason;
            await app.save();

            const citizen = await interaction.guild.members.fetch(app.userId).catch(() => null);
            const userChannel = interaction.guild.channels.cache.get(app.channelId) || await interaction.guild.channels.fetch(app.channelId).catch(() => null);

            // --- PROGRESSION FEEDBACK ---
            const cooldownHrs = config.correctionCooldown !== undefined ? config.correctionCooldown : 2;
            const nextAttemptDate = new Date(Date.now() + cooldownHrs * 60 * 60 * 1000);
            const nextAttemptStr = cooldownHrs === 0 ? "subito" : `<t:${Math.floor(nextAttemptDate.getTime() / 1000)}:R>`;

            if (userChannel) {
                const rejectEmbed = buildEmbed(config.embeds.integrated_rejected, {
                    user: citizen || app.userId,
                    reason: reason,
                    next_attempt: nextAttemptStr
                }, config);

                await userChannel.send({ content: `${citizen || `<@${app.userId}>`}`, embeds: [rejectEmbed] });

                // Reset WhitelistApp status if integrated
                await WhitelistApp.updateOne(
                    { channelId: userChannel.id, status: 'SUBMITTED_BACKGROUND' },
                    { status: 'WAITING_BACKGROUND' }
                );
            }

            // --- UPDATE STAFF LOG ---
            const originalEmbed = interaction.message.embeds[0];
            if (originalEmbed) {
                const updatedEmbed = EmbedBuilder.from(originalEmbed)
                    .setTitle('❌ Dossier RESPINTO')
                    .setColor('#e74c3c')
                    .addFields(
                        { name: '👤 Soggetto', value: citizen?.toString() || `<@${app.userId}>`, inline: true },
                        { name: '👮 Ufficiale', value: interaction.user.toString(), inline: true },
                        { name: 'Esito Staff', value: `❌ Respinto da ${interaction.user.tag}` },
                        { name: 'Motivo', value: reason || 'Nessuna motivazione' }
                    );
                
                await interaction.update({ embeds: [updatedEmbed], components: [] });
            } else {
                await interaction.update({ content: `❌ Background rifiutato da ${interaction.user.tag} per: ${reason}`, embeds: [], components: [] });
            }

            // Notification to User
            if (user && config.embeds.dm_rejected) {
                const dmEmbed = buildEmbed(config.embeds.dm_rejected, {
                    user: user.username,
                    guild: interaction.guild.name,
                    reason: reason
                }, config);
                if (dmEmbed) await sendUserNotification(interaction.guild, user, config.notifications, { embeds: [dmEmbed] });
            }
        }
    },
};
