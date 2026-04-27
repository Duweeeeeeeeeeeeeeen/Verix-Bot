import { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import Guild from '../../../models/Guild.js';
import logger from '../../../utils/logger.js';
import { checkBotPermissions, formatMissingPermissions } from '../../../utils/permissionHelper.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: Events.MessageCreate,
    /**
     * @param {import('discord.js').Message} message 
     */
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        try {
            // Anti-spam lock to prevent multiple instances from processing the same message
            if (message.client._processingWL?.has(message.id)) return;
            if (!message.client._processingWL) message.client._processingWL = new Set();
            message.client._processingWL.add(message.id);
            setTimeout(() => message.client._processingWL?.delete(message.id), 5000);

            const app = await WhitelistApp.findOne({ channelId: message.channel.id, userId: message.author.id, status: 'PENDING' });
            if (!app) return;

            logger.info(`[WHITELIST] Answer received from ${message.author.tag} in ${message.channel.name} (Index: ${app.currentQuestionIndex})`);

            // --- PERMISSION CHECK ---
            const permCheck = checkBotPermissions(message.channel, [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks
            ]);

            if (!permCheck.hasPermission) {
                logger.error(`[WHITELIST] Missing permissions in ${message.channel.name} (${message.guild.id}): ${permCheck.missing.join(', ')}`);
                return;
            }

            const config = await WhitelistConfig.findOne({ guildId: message.guild.id });
            if (!config) return;

            const guildData = await Guild.findOne({ guildId: message.guild.id });
            if (!guildData || !guildData.enabledModules?.includes('whitelist')) return;

            const sessionQuestions = app.sessionQuestions && app.sessionQuestions.length > 0 ? app.sessionQuestions : config.questions;
            const currentQuestion = sessionQuestions[app.currentQuestionIndex];

            if (!currentQuestion) {
                logger.warn(`[WHITELIST] No question found at index ${app.currentQuestionIndex} for ${message.author.tag}`);
                return;
            }

            // Min Length Check
            if (message.content.length < currentQuestion.minLength) {
                const embed = await messageService.get(message.guild.id, 'whitelist', 'min_length_error', {
                    minLength: currentQuestion.minLength,
                    user: message.author.username
                });
                return message.reply({ embeds: [embed] });
            }

            // Save Answer
            app.answers.push({
                question: currentQuestion.text,
                answer: message.content
            });

            app.currentQuestionIndex += 1;

            // Safely parse startTime
            const startTime = app.startTime ? new Date(app.startTime).getTime() : Date.now();
            const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
            const timeRemaining = Math.max(0, config.timeLimit - elapsedMinutes);
            
            if (app.currentQuestionIndex >= sessionQuestions.length) {
                await app.save();

                const summaryEmbed = await messageService.get(message.guild.id, 'whitelist', 'session_completed', {
                    user: message.author.username,
                    guild: message.guild.name,
                    total_questions: sessionQuestions.length
                });

                const fields = app.answers.slice(0, 25).map((ans, i) => ({
                    name: `${i + 1}. ${ans.question}`,
                    value: ans.answer?.substring(0, 1024) || '*Nessuna risposta*'
                }));
                summaryEmbed.addFields(fields);

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('confirm_wl').setLabel('Conferma Pratica').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('choice_edit_wl').setLabel('📝 Modifica Risposte').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('cancel_wl').setLabel('Ritira Domanda').setStyle(ButtonStyle.Danger)
                );

                const sentMsg = await message.channel.send({ embeds: [summaryEmbed], components: [row] });
                app.reviewMessageId = sentMsg.id;
                await app.save();
                return;
            }

            await app.save();
            const nextQuestion = sessionQuestions[app.currentQuestionIndex];

            const nextEmbed = await messageService.get(message.guild.id, 'whitelist', 'question', {
                currentIndex: app.currentQuestionIndex + 1,
                totalQuestions: sessionQuestions.length,
                question: nextQuestion.text,
                minLength: nextQuestion.minLength,
                timeLeft: timeRemaining
            });

            await message.channel.send({ embeds: [nextEmbed] });
        } catch (error) {
            logger.error(`[WHITELIST] Critical error in answerHandler:`, error);
            await messageService.send(message.channel, 'system', 'generic_error').catch(() => {});
        }
    },
};
