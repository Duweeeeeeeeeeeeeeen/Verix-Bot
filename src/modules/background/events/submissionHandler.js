import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import Background from '../../../models/Background.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import User from '../../../models/User.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import logger from '../../../utils/logger.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle Buttonfinalize_bg & cancel_bg
        if (interaction.isButton()) {
            const { customId, channel, user, guild } = interaction;

            if (customId === 'cancel_bg') {
                const app = await Background.findOne({ channelId: channel.id });
                if (app) {
                    app.deletionScheduledAt = new Date(Date.now() + 5000);
                    await app.save();
                }
                return interaction.reply('Annullamento in corso... Il canale sparirà tra 5 secondi.');
            }

            if (customId === 'finalize_bg') {
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
                const app = await Background.findOne({ channelId: interaction.channelId });
                if (!app) return interaction.reply({ content: 'Sessione non trovata.', ephemeral: true });

                const config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
                if (!config) return interaction.reply({ content: 'Configurazione non trovata.', ephemeral: true });

                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (!logChannel) return interaction.reply({ content: 'Canale log non trovato.', ephemeral: true });

                // Update Progress
                app.link = link;
                app.description = desc;
                app.status = 'SUBMITTED';
                app.submittedAt = new Date();
                await app.save();

                // Update User Cooldown
                const userData = await User.findOne({ discordId: interaction.user.id });
                if (userData) {
                    userData.lastBackgroundAttempt = new Date();
                    await userData.save();
                }

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
                await logChannel.send({ content: pings, embeds: [staffEmbed], components: [row] });

                // Send DM to User
                if (config.embeds.dm_received) {
                    const dmEmbed = buildEmbed(config.embeds.dm_received, {
                        user: interaction.user.username,
                        guild: interaction.guild.name
                    }, config);
                    if (dmEmbed) await interaction.user.send({ embeds: [dmEmbed] }).catch(() => {});
                }

                app.deletionScheduledAt = new Date(Date.now() + 10000);
                await app.save();
                
                await interaction.reply('✅ Background inviato con successo! Il canale si chiuderà tra 10 secondi.');

            } catch (error) {
                logger.error('Error in BG Modal Submit:', error);
                await interaction.reply({ content: 'Si è verificato un errore durante l\'invio.', ephemeral: true });
            }
        }
    },
};
