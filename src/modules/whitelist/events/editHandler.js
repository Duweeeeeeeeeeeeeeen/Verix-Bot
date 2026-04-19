import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import { buildEmbed } from '../../../utils/embedHelper.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'edit_wl') {
            const app = await WhitelistApp.findOne({ channelId: interaction.channelId, userId: interaction.user.id, status: 'PENDING' });
            if (!app || app.answers.length === 0) return interaction.reply({ content: 'Non hai risposte da modificare.', ephemeral: true });

            const lastAnswer = app.answers[app.answers.length - 1];
            const modal = new ModalBuilder()
                .setCustomId('modal_edit_wl')
                .setTitle('Modifica Risposta');

            const textInput = new TextInputBuilder()
                .setCustomId('edited_answer')
                .setLabel('La tua nuova risposta')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setValue(lastAnswer.answer);

            modal.addComponents(new ActionRowBuilder().addComponents(textInput));
            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_edit_wl') {
            const app = await WhitelistApp.findOne({ channelId: interaction.channelId, userId: interaction.user.id, status: 'PENDING' });
            const config = await WhitelistConfig.findOne({ guildId: interaction.guildId });
            const newAnswer = interaction.fields.getTextInputValue('edited_answer');

            // Use session questions logic
            const sessionQuestions = app.sessionQuestions && app.sessionQuestions.length > 0 ? app.sessionQuestions : config.questions;
            const currentIdx = app.answers.length - 1;
            const questionData = sessionQuestions[currentIdx];

            if (newAnswer.length < questionData.minLength) {
                return interaction.reply({ content: `❌ Risposta troppo breve. Deve essere almeno ${questionData.minLength} caratteri.`, ephemeral: true });
            }

            app.answers[currentIdx].answer = newAnswer;
            await app.save();

            // Refresh Review Embed
            const summaryEmbed = buildEmbed(config.embeds.review, {
                user: interaction.user.username,
                guild: interaction.guild.name,
                total_questions: sessionQuestions.length
            }, config);

            if (summaryEmbed) {
                summaryEmbed.addFields(app.answers.map((ans, i) => ({
                    name: `${i + 1}. ${ans.question}`,
                    value: ans.answer || '*Nessuna risposta*'
                })));
            }
            
            await interaction.update({ embeds: [summaryEmbed] });
        }

        if (interaction.customId === 'cancel_wl') {
            await WhitelistApp.deleteOne({ channelId: interaction.channelId, userId: interaction.user.id });
            await interaction.reply({ content: 'Pratica ritirata. Il canale verrà eliminato tra 5 secondi.' });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    }
};
