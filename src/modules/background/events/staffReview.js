import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import Background from '../../../models/Background.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle Approval/Denial Buttons
        if (interaction.isButton() && (interaction.customId.startsWith('approve_bg_') || interaction.customId.startsWith('deny_bg_'))) {
            const parts = interaction.customId.split('_');
            const action = parts[0];
            const appId = parts[2];

            const app = await Background.findById(appId);
            if (!app) return interaction.reply({ content: 'Richiesta non trovata.', ephemeral: true });

            const config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
            if (!config) return;

            // Permission Check
            if (config.staffRoleIds && config.staffRoleIds.length > 0) {
                if (!interaction.member.roles.cache.some(role => config.staffRoleIds.includes(role.id))) {
                    return interaction.reply({ content: '❌ Non hai i permessi necessari per gestire i background.', ephemeral: true });
                }
            }

            const user = await client.users.fetch(app.userId).catch(() => null);

            if (action === 'approve') {
                app.status = 'ACCEPTED';
                app.reviewedBy = interaction.user.id;
                await app.save();

                // DM to User
                if (user && config.embeds.dm_accepted) {
                    const dmEmbed = buildEmbed(config.embeds.dm_accepted, {
                        user: user.username,
                        guild: interaction.guild.name
                    }, config);
                    if (dmEmbed) await user.send({ embeds: [dmEmbed] }).catch(() => {});
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
            if (!app) return interaction.reply({ content: 'Richiesta non trovata.', ephemeral: true });

            const config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
            const user = await client.users.fetch(app.userId).catch(() => null);

            app.status = 'REJECTED';
            app.reviewedBy = interaction.user.id;
            app.rejectionReason = reason;
            await app.save();

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
