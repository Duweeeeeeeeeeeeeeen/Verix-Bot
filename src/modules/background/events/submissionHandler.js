import { ActionRowBuilder, Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from 'discord.js';
import Background from '../../../models/Background.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import User from '../../../models/User.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle Buttons
        if (interaction.isButton()) {
            const { customId, channel } = interaction;

            if (customId === 'cancel_bg') {
                const app = await Background.findOne({ channelId: channel.id });
                if (app) {
                    app.deletionScheduledAt = new Date(Date.now() + 5000);
                    await app.save();
                }
                const isWL = channel.name.startsWith('wl-');
                return interaction.reply(`Annullamento in corso... Il ${isWL ? 'ticket' : 'canale'} sparirà tra 5 secondi.`);
            }

            if (customId === 'start_whitelist_from_bg') {
                const wlConfig = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
                if (!wlConfig) return interaction.reply({ content: 'Configurazione Whitelist non trovata.', flags: [MessageFlags.Ephemeral] });

                const { startWrittenSession } = await import('../../whitelist/utils/sessionHandler.js');
                
                await interaction.reply({ content: '🚀 Inizializzazione test scritto in corso...', flags: [MessageFlags.Ephemeral] });
                await startWrittenSession(interaction, channel, wlConfig);
                
                return interaction.message.delete().catch(() => {});
            }
            
            if (customId === 'finalize_bg' || customId === 'submit_background') {
                const modal = new ModalBuilder()
                    .setCustomId('submit_bg_modal')
                    .setTitle('Dettagli Background');

                const linkInput = new TextInputBuilder()
                    .setCustomId('bg_link')
                    .setLabel('Link al Background (es. Google Doc)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('https://docs.google.com/...')
                    .setRequired(true);

                const descInput = new TextInputBuilder()
                    .setCustomId('bg_desc')
                    .setLabel('Breve Descrizione (Opzionale)')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Riassumi qui la storia del tuo personaggio...')
                    .setRequired(false)
                    .setMaxLength(500);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(linkInput),
                    new ActionRowBuilder().addComponents(descInput)
                );

                await interaction.showModal(modal);
            }
        }

        // Handle Modal Submit
        if (interaction.isModalSubmit() && interaction.customId === 'submit_bg_modal') {
            const link = interaction.fields.getTextInputValue('bg_link');
            const desc = interaction.fields.getTextInputValue('bg_desc');

            try {
                // Immediate fetch of essential data
                const [app, config] = await Promise.all([
                    Background.findOne({ channelId: interaction.channelId }),
                    BackgroundConfig.findOne({ guildId: interaction.guild.id })
                ]);

                if (!app) return interaction.reply({ content: 'Sessione non trovata.', flags: [MessageFlags.Ephemeral] });
                if (!config) return interaction.reply({ content: 'Configurazione non trovata.', flags: [MessageFlags.Ephemeral] });

                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (!logChannel) return interaction.reply({ content: 'Canale log non trovato.', flags: [MessageFlags.Ephemeral] });

                // Update Progress
                app.link = link;
                app.description = desc;
                app.status = 'SUBMITTED';
                app.submittedAt = new Date();
                await app.save();

                // Update User Cooldown (Non-blocking)
                User.updateOne({ discordId: interaction.user.id }, { lastBackgroundAttempt: new Date() }).catch(err => logger.warn(`[BG] Failed to update user cooldown: ${err.message}`));

                // Send to Staff
                const staffEmbed = buildEmbed(config.embeds.staff_received, {
                    user: interaction.user,
                    user_id: interaction.user.id,
                    bg_link: link,
                    bg_desc: desc || 'Nessuna descrizione fornita',
                    bg_attachment: app.attachmentURL || 'Nessun allegato caricato',
                    app_id: app._id
                }, config);

                if (staffEmbed && app.attachmentURL) {
                    staffEmbed.setThumbnail(app.attachmentURL);
                }

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`approve_bg_${app._id}`).setLabel('Accetta').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`deny_bg_${app._id}`).setLabel('Rifiuta').setStyle(ButtonStyle.Danger)
                );

                const pings = (config.staffRoleIds || []).map(id => `<@&${id}>`).join(' ');
                
                // Finalize based on integration
                const isIntegrated = interaction.channel.name.startsWith('wl-');
                
                if (isIntegrated) {
                    // Update WhitelistApp status for integrated flow
                    await WhitelistApp.updateOne(
                        { channelId: interaction.channel.id, status: 'WAITING_BACKGROUND' },
                        { status: 'SUBMITTED_BACKGROUND' }
                    );
                    
                    // Reply first to ensure modal closes and user sees success
                    await interaction.reply('✅ **Dossier sottomesso!** Lo staff revisionerà la tua storia. Attendi l\'esito qui per procedere.');
                } else {
                    app.deletionScheduledAt = new Date(Date.now() + 10000);
                    await app.save();
                    await interaction.reply('✅ Background inviato con successo! Il canale si chiuderà tra 10 secondi.');
                }

                // Send long-running tasks after the interaction is acknowledged
                await logChannel.send({ content: pings, embeds: [staffEmbed], components: [row] }).catch(err => logger.error('[BG] Failed to send log to staff:', err));

                if (config.embeds.dm_received) {
                    const dmEmbed = buildEmbed(config.embeds.dm_received, {
                        user: interaction.user.username,
                        guild: interaction.guild.name
                    }, config);
                    if (dmEmbed) interaction.user.send({ embeds: [dmEmbed] }).catch(() => {});
                }

            } catch (error) {
                logger.error('Error in BG Modal Submit:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'Si è verificato un errore durante l\'invio.', flags: [MessageFlags.Ephemeral] });
                }
            }
        }
    },
};
