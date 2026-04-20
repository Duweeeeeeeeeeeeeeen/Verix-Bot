import { ActionRowBuilder, Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import Background from '../../../models/Background.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import logger from '../../../utils/logger.js';
import { startWrittenSession } from '../../whitelist/utils/sessionHandler.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle Approval/Denial Buttons
        if (interaction.isButton() && (interaction.customId.startsWith('approve_bg_') || interaction.customId.startsWith('deny_bg_'))) {
            const parts = interaction.customId.split('_');
            const action = parts[0];
            const appId = parts[2];

            const app = await Background.findById(appId);
            if (!app) return interaction.reply({ content: 'Richiesta non trovata.', flags: [MessageFlags.Ephemeral] });

            const config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
            if (!config) return;

            // Permission Check
            if (config.staffRoleIds && config.staffRoleIds.length > 0) {
                if (!interaction.member.roles.cache.some(role => config.staffRoleIds.includes(role.id))) {
                    return interaction.reply({ content: '❌ Non hai i permessi necessari per gestire i background.', flags: [MessageFlags.Ephemeral] });
                }
            }

            const user = await client.users.fetch(app.userId).catch(() => null);

            if (action === 'approve') {
                // Fetch Whitelist Config for instructions
                const wlConfig = await (await import('../../../models/WhitelistConfig.js')).default.findOne({ guildId: interaction.guild.id });
                let nextStep = "";
                if (wlConfig && wlConfig.enabled) {
                    const m = wlConfig.mode;
                    if (m === 'BG_ONLY') nextStep = "\n\n✅ **Percorso Completato:** Il tuo background è stato archiviato con successo!";
                    else if (m === 'BG_TEXT' || m === 'FULL') nextStep = "\n\n➡️ **Prossimo Step:** Ora puoi procedere con la **Whitelist Scritta** nel canale dedicato!";
                    else if (m === 'BG_VOICE') nextStep = "\n\n➡️ **Prossimo Step:** Ora puoi recarti nel canale vocale per il **Colloquio Orale**!";
                }

                app.status = 'ACCEPTED';
                app.reviewedBy = interaction.user.id;
                await app.save();

                const citizen = await interaction.guild.members.fetch(app.userId).catch(() => null);

                // If INTEGRATED flow (wl- channel), send instructions + button
                if (interaction.channel.name.startsWith('wl-')) {
                    const acceptEmbed = buildEmbed(config.embeds.integrated_accepted, {
                        user: citizen || app.userId,
                        guild: interaction.guild.name
                    }, config);

                    const startButton = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('start_whitelist_from_bg')
                            .setLabel('Inizia Test Scritto')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('📝')
                    );

                    await interaction.channel.send({ content: `${citizen || `<@${app.userId}>`}`, embeds: [acceptEmbed], components: [startButton] });
                    await interaction.reply({ content: `✅ Background Approvato! L'utente ha ricevuto il pulsante per iniziare il test.`, flags: [MessageFlags.Ephemeral] });
                } else {
                    await interaction.reply({ content: `✅ Background di ${citizen?.user?.tag || app.userId} approvato!`, flags: [MessageFlags.Ephemeral] });
                }

                // DM to User
                if (user && config.embeds.dm_accepted) {
                    const dmEmbed = buildEmbed(config.embeds.dm_accepted, {
                        user: user.username,
                        guild: interaction.guild.name
                    }, config);
                    
                    if (dmEmbed) {
                        const currentDesc = dmEmbed.data.description || "";
                        dmEmbed.setDescription(currentDesc + nextStep);
                        await user.send({ embeds: [dmEmbed] }).catch(() => {});
                    }
                }

                // Internal Log
                if (config.logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                    if (logChannel) {
                        const auditEmbed = buildEmbed(config.embeds.staff_accepted, {
                            user: `<@${app.userId}>`,
                            staff: interaction.user
                        }, config);
                        await logChannel.send({ embeds: [auditEmbed] });
                    }
                }

                await interaction.update({ content: `✅ Background approvato da ${interaction.user.tag}`, embeds: [], components: [] });
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
            if (!app) return interaction.reply({ content: 'Richiesta non trovata.', flags: [MessageFlags.Ephemeral] });

            const config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
            const user = await client.users.fetch(app.userId).catch(() => null);

            app.status = 'REJECTED';
            app.reviewedBy = interaction.user.id;
            app.rejectionReason = reason;
            await app.save();

            const citizen = await interaction.guild.members.fetch(app.userId).catch(() => null);

            // If INTEGRATED flow (wl- channel), notify in channel and reset WL app status
            if (interaction.channel.name.startsWith('wl-')) {
                const cooldownHrs = config.correctionCooldown !== undefined ? config.correctionCooldown : 2;
                const nextAttemptDate = new Date(Date.now() + cooldownHrs * 60 * 60 * 1000);
                const nextAttemptStr = cooldownHrs === 0 ? "subito" : `<t:${Math.floor(nextAttemptDate.getTime() / 1000)}:R>`;

                const rejectEmbed = buildEmbed(config.embeds.integrated_rejected, {
                    user: citizen || app.userId,
                    reason: reason,
                    next_attempt: nextAttemptStr
                }, config);

                await interaction.channel.send({ content: `${citizen || `<@${app.userId}>`}`, embeds: [rejectEmbed] });

                // Reset WhitelistApp status
                const wlAppModel = await (await import('../../../models/WhitelistApp.js')).default;
                await wlAppModel.updateOne(
                    { channelId: interaction.channel.id, status: 'SUBMITTED_BACKGROUND' },
                    { status: 'WAITING_BACKGROUND' }
                );
            }

            // DM to User
            if (user && config.embeds.dm_rejected) {
                const dmEmbed = buildEmbed(config.embeds.dm_rejected, {
                    user: user.username,
                    guild: interaction.guild.name,
                    reason: reason
                }, config);
                if (dmEmbed) await user.send({ embeds: [dmEmbed] }).catch(() => {});
            }

            // Internal Log
            if (config.logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (logChannel) {
                    const auditEmbed = buildEmbed(config.embeds.staff_rejected, {
                        user: `<@${app.userId}>`,
                        staff: interaction.user,
                        reason: reason
                    }, config);
                    await logChannel.send({ embeds: [auditEmbed] });
                }
            }

            await interaction.update({ content: `❌ Background rifiutato da ${interaction.user.tag} per: ${reason}`, embeds: [], components: [] });
        }
    },
};
