import { ActionRowBuilder, Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // --- GUARD: Allow only Whitelist related interactions ---
        const isChoice = interaction.isButton() && interaction.customId === 'choice_edit_wl';
        const isSelect = interaction.isStringSelectMenu() && interaction.customId === 'select_edit_wl';
        const isModal = interaction.isModalSubmit() && interaction.customId.startsWith('modal_edit_wl_');
        const isClose = interaction.isButton() && interaction.customId === 'wl_close_edit_menu';
        const isCancel = interaction.isButton() && interaction.customId === 'cancel_wl';

        if (!isChoice && !isSelect && !isModal && !isClose && !isCancel) return;

        try {
            const app = await WhitelistApp.findOne({ 
                channelId: interaction.channelId, 
                userId: interaction.user.id, 
                status: 'PENDING' 
            });

            // 1. CLICK "EDIT" BUTTON -> SHOW SELECT MENU
            if (isChoice) {
                if (!app || app.answers.length === 0) {
                    return messageService.reply(interaction, 'whitelist', 'edit_error', { reason: 'Non hai risposte da modificare.' }, { ephemeral: true });
                }

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_edit_wl')
                    .setPlaceholder('Scegli la domanda da modificare...')
                    .addOptions(app.answers.map((ans, i) => ({
                        label: `Domanda ${i + 1}`,
                        description: ans.question.substring(0, 100),
                        value: i.toString()
                    })));

                const closeButton = new ButtonBuilder()
                    .setCustomId('wl_close_edit_menu')
                    .setLabel('Chiudi Menu')
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder().addComponents(selectMenu);
                const row2 = new ActionRowBuilder().addComponents(closeButton);

                await interaction.reply({ 
                    embeds: [await messageService.get(interaction.guild.id, 'whitelist', 'edit_menu')], 
                    components: [row, row2], 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            // 1.5 CLOSE MENU
            if (isClose) {
                return interaction.update({ 
                    embeds: [await messageService.get(interaction.guild.id, 'whitelist', 'edit_closed')], 
                    components: [] 
                });
            }

            // 2. SELECT QUESTION -> SHOW MODAL
            if (isSelect) {
                if (!app) return messageService.reply(interaction, 'whitelist', 'app_not_found', {}, { ephemeral: true });
                const questionIndex = parseInt(interaction.values[0]);
                const answerData = app.answers[questionIndex];

                const modal = new ModalBuilder()
                    .setCustomId(`modal_edit_wl_${questionIndex}`)
                    .setTitle(`Modifica Risposta ${questionIndex + 1}`);

                const textInput = new TextInputBuilder()
                    .setCustomId('edited_answer')
                    .setLabel('La tua nuova risposta')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setValue(answerData.answer);

                modal.addComponents(new ActionRowBuilder().addComponents(textInput));
                await interaction.showModal(modal);
            }

            // 3. SUBMIT MODAL -> SAVE & REFRESH
            if (isModal) {
                await interaction.deferUpdate(); // Prevents "Interaction failed" if processing takes time

                const questionIndex = parseInt(interaction.customId.split('_').pop());
                const newAnswer = interaction.fields.getTextInputValue('edited_answer');
                const config = await WhitelistConfig.findOne({ guildId: interaction.guildId });

                // Validation
                const sessionQuestions = app.sessionQuestions && app.sessionQuestions.length > 0 ? app.sessionQuestions : config.questions;
                const questionData = sessionQuestions[questionIndex];

                if (newAnswer.length < questionData.minLength) {
                    return messageService.reply(interaction, 'whitelist', 'min_length_error', { minLength: questionData.minLength }, { ephemeral: true });
                }

                // Update Database
                app.answers[questionIndex].answer = newAnswer;
                app.markModified('answers'); // Important for nested array updates in Mongoose
                await app.save();

                // 3.0 Refresh Review Embed
                const summaryEmbed = buildEmbed(config.embeds.review, {
                    user: interaction.user.username,
                    guild: interaction.guild.name,
                    total_questions: sessionQuestions.length
                }, config);

                if (summaryEmbed) {
                    const fields = app.answers.slice(0, 25).map((ans, i) => ({
                        name: `${i + 1}. ${ans.question}`,
                        value: ans.answer?.substring(0, 1024) || '*Nessuna risposta*'
                    }));
                    summaryEmbed.addFields(fields);
                }

                // 3.1 Update the Main Review Message (the one in the channel)
                if (app.reviewMessageId) {
                    try {
                        const mainMsg = await interaction.channel.messages.fetch(app.reviewMessageId);
                        if (mainMsg) {
                            await mainMsg.edit({ embeds: [summaryEmbed] });
                        }
                    } catch (err) {
                        logger.warn(`[Whitelist_Edit] Could not find/edit review message ${app.reviewMessageId}`);
                    }
                }

                // 3.2 Update the Ephemeral Message to show success and allow more edits
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_edit_wl')
                    .setPlaceholder('Modifica un\'altra domanda...')
                    .addOptions(app.answers.map((ans, i) => ({
                        label: `Domanda ${i + 1}`,
                        description: ans.question.substring(0, 100),
                        value: i.toString()
                    })));

                const finishedButton = new ButtonBuilder()
                    .setCustomId('wl_close_edit_menu')
                    .setLabel('Ho Finito')
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder().addComponents(selectMenu);
                const row2 = new ActionRowBuilder().addComponents(finishedButton);

                await interaction.editReply({ 
                    embeds: [await messageService.get(interaction.guild.id, 'whitelist', 'edit_success', { index: questionIndex + 1 })],
                    components: [row, row2]
                });
            }

        } catch (error) {
            logger.error('[Whitelist_Edit] Interaction Error:', error);
            const errEmbed = await messageService.get(interaction.guild.id, 'whitelist', 'edit_error', { reason: 'Si è verificato un errore durante la modifica.' });
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ embeds: [errEmbed], flags: [MessageFlags.Ephemeral] }).catch(() => {});
            } else {
                await interaction.followUp({ embeds: [errEmbed], flags: [MessageFlags.Ephemeral] }).catch(() => {});
            }
        }
    }
};
