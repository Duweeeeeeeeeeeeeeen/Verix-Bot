import { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import Guild from '../../../models/Guild.js';
import logger from '../../../utils/logger.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { checkBotPermissions, formatMissingPermissions } from '../../../utils/permissionHelper.js';

export default {
    name: Events.MessageCreate,
    /**
     * @param {import('discord.js').Message} message 
     */
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        try {
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
            // Can't send message to this channel, so we log it
            logger.error(`[WHITELIST] Missing permissions in ${message.channel.name} (${message.guild.id}): ${permCheck.missing.join(', ')}`);
            return;
        }

        const config = await WhitelistConfig.findOne({ guildId: message.guild.id });
        if (!config) return;

        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData || !guildData.enabledModules?.includes('whitelist')) return;

        const sessionQuestions = app.sessionQuestions && app.sessionQuestions.length > 0 ? app.sessionQuestions : config.questions;
        const currentQuestion = sessionQuestions[app.currentQuestionIndex];

        logger.info(`[WHITELIST-DEBUG] [A] Validating minLength for question index ${app.currentQuestionIndex}`);
        if (message.content.length < currentQuestion.minLength) {
            const errorEmbed = buildEmbed(config.embeds.error_min_length, {
                min_length: currentQuestion.minLength,
                user: message.author.username
            }, config);
            
            if (errorEmbed) {
                return message.reply({ embeds: [errorEmbed] });
            } else {
                return message.reply(`⚠️ **Dettaglio Insufficiente:** La tua risposta deve contenere almeno **${currentQuestion.minLength}** caratteri.`);
            }
        }

        logger.info(`[WHITELIST-DEBUG] [B] Pushing answer to database object...`);
        app.answers.push({
            question: currentQuestion.text,
            answer: message.content
        });

        app.currentQuestionIndex += 1;

        // Safely parse startTime
        const startTime = app.startTime ? new Date(app.startTime).getTime() : Date.now();
        const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
        const timeRemaining = Math.max(0, config.timeLimit - elapsedMinutes);
        
        logger.info(`[WHITELIST-DEBUG] [C] Index updated to ${app.currentQuestionIndex}. Elapsed: ${elapsedMinutes}m. Remaining: ${timeRemaining}m.`);

        if (app.currentQuestionIndex >= sessionQuestions.length) {
            logger.info(`[WHITELIST-DEBUG] [D] Session completed. Total Answers: ${app.answers.length}. Saving...`);
            await app.save();

            const summaryEmbed = buildEmbed(config.embeds.review, {
                user: message.author.username,
                guild: message.guild.name,
                total_questions: sessionQuestions.length
            }, config);

            if (summaryEmbed) {
                // Discord limit: 25 fields max
                const fields = app.answers.slice(0, 25).map((ans, i) => ({
                    name: `${i + 1}. ${ans.question}`,
                    value: ans.answer?.substring(0, 1024) || '*Nessuna risposta*'
                }));
                summaryEmbed.addFields(fields);
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('confirm_wl').setLabel('Conferma Pratica').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('choice_edit_wl').setLabel('📝 Modifica Risposte').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('cancel_wl').setLabel('Ritira Domanda').setStyle(ButtonStyle.Danger)
            );

            let sentMsg;
            if (summaryEmbed) {
                sentMsg = await message.channel.send({ embeds: [summaryEmbed], components: [row] });
            } else {
                sentMsg = await message.channel.send({ 
                    content: `✅ **Interrogatorio terminato!** Hai risposto a tutte le domande. Clicca il pulsante sotto per confermare l'invio ufficiale.`, 
                    components: [row] 
                });
            }
            app.reviewMessageId = sentMsg.id;
            await app.save();
            return;
        }

        logger.info(`[WHITELIST-DEBUG] [E] Saving progress and sending next question...`);
        await app.save();
        const nextQuestion = sessionQuestions[app.currentQuestionIndex];
        logger.info(`[WHITELIST] Sending next question (${app.currentQuestionIndex + 1}/${sessionQuestions.length}) to ${message.author.tag}`);

        const nextEmbed = buildEmbed(config.embeds.question, {
            current_index: app.currentQuestionIndex + 1,
            total_questions: sessionQuestions.length,
            question: nextQuestion.text,
            min_length: nextQuestion.minLength,
            time_left: timeRemaining
        }, config);

        if (nextEmbed) {
            await message.channel.send({ embeds: [nextEmbed] });
        } else {
            await message.channel.send(`❓ **Domanda ${app.currentQuestionIndex + 1}:**\n>>> ${nextQuestion.text}`);
        }
    } catch (error) {
        logger.error(`[WHITELIST] Critical error in answerHandler:`, error);
        await message.channel.send('❌ Si è verificato un errore nel processare la tua risposta. Per favore, prova a reinviare il messaggio o contatta lo staff.').catch(() => {});
    }
},
};
