import { ActionRowBuilder, Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from 'discord.js';
import Background from '../../../models/Background.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import User from '../../../models/User.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import { t } from '../../../locales/t.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guild?.id });
        const lang = globalConfig?.language || 'en';

        // Handle Buttons
        if (interaction.isButton()) {
            const { customId, channel } = interaction;

            if (customId === 'cancel_bg') {
                const app = await Background.findOne({ channelId: channel.id });
                if (app) {
                    app.deletionScheduledAt = new Date(Date.now() + 5000);
                    await app.save();
                }
                return messageService.reply(interaction, 'background', 'session_cancelled', { time: '5s' });
            }

            if (customId === 'start_whitelist_from_bg') {
                const wlConfig = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
                if (!wlConfig) return messageService.reply(interaction, 'whitelist', 'not_configured', {}, { ephemeral: true });

                const bgApproved = await Background.findOne({
                    userId: interaction.user.id,
                    guildId: interaction.guild.id,
                    status: 'ACCEPTED',
                    $or: [
                        { channelId: channel.id },
                        { channelId: { $exists: true } }
                    ]
                });
                if (!bgApproved) {
                    return messageService.reply(interaction, 'background', 'error', { reason: 'Background approval is required before starting the written test.' }, { ephemeral: true });
                }

                const { startWrittenSession } = await import('../../whitelist/utils/sessionHandler.js');
                
                await messageService.reply(interaction, 'whitelist', 'start_success', { channelId: channel.id }, { ephemeral: true });
                await startWrittenSession(interaction, channel, wlConfig);
                
                return interaction.message.delete().catch(() => {});
            }
            
            if (customId === 'finalize_bg' || customId === 'submit_background') {
                const modal = new ModalBuilder()
                    .setCustomId('submit_bg_modal')
                    .setTitle(t('background.modal_title', lang));

                const linkInput = new TextInputBuilder()
                    .setCustomId('bg_link')
                    .setLabel(t('background.link_label', lang))
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('https://docs.google.com/...')
                    .setRequired(true);

                const descInput = new TextInputBuilder()
                    .setCustomId('bg_desc')
                    .setLabel(t('background.desc_label', lang))
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder(t('background.desc_placeholder', lang))
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

                if (!app) return messageService.reply(interaction, 'background', 'error', { reason: t('common.none', lang) }, { ephemeral: true });
                if (!config) return messageService.reply(interaction, 'background', 'error', { reason: t('common.none', lang) }, { ephemeral: true });

                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (!logChannel) return messageService.reply(interaction, 'background', 'error', { reason: t('common.none', lang) }, { ephemeral: true });

                // Update Progress
                app.link = link;
                app.description = desc;
                app.status = 'SUBMITTED';
                app.submittedAt = new Date();
                await app.save();

                // Update User Cooldown (Non-blocking)
                User.updateOne({ discordId: interaction.user.id }, { lastBackgroundAttempt: new Date() }).catch(err => logger.warn(`[BG] Failed to update user cooldown: ${err.message}`));

                // Send to Staff
                const staffEmbed = await messageService.get(interaction.guild.id, 'background', 'staff_received', {
                    userId: interaction.user.id,
                    bg_link: link,
                    bg_desc: desc || t('common.no_reason', lang),
                    bg_attachment: app.attachmentURL || t('common.none', lang),
                    app_id: app._id
                });

                if (staffEmbed && app.attachmentURL) {
                    staffEmbed.setThumbnail(app.attachmentURL);
                }

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`approve_bg_${app._id}`).setLabel(t('background.approve_btn', lang)).setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`deny_bg_${app._id}`).setLabel(t('background.deny_btn', lang)).setStyle(ButtonStyle.Danger)
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
                    
                    await messageService.reply(interaction, 'background', 'submission_success', {});
                } else {
                    app.deletionScheduledAt = new Date(Date.now() + 10000);
                    await app.save();
                    await messageService.reply(interaction, 'background', 'submission_success', { time: '10s' });
                }

                // Send long-running tasks after the interaction is acknowledged
                await logChannel.send({ content: pings, embeds: [staffEmbed], components: [row] }).catch(err => logger.error('[BG] Failed to send log to staff:', err));

                const dmEmbed = await messageService.get(interaction.guild.id, 'background', 'dm_received', {
                    user: interaction.user.username,
                    guild: interaction.guild.name
                });
                
                if (dmEmbed) {
                    await messageService.sendNotification(interaction.guild, interaction.user, 'background', 'dm_received', {
                        user: interaction.user.username,
                        guild: interaction.guild.name
                    }, config.notifications);
                }

            } catch (err) {
                logger.error('[BG] Error in submissionHandler:', err);
                await messageService.reply(interaction, 'background', 'error', { reason: t('common.error', lang) }, { ephemeral: true });
            }
        }
    },
};
