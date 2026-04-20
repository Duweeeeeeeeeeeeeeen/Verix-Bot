import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import User from '../../../models/User.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import logger from '../../../utils/logger.js';

/**
 * Common logic to start a written whitelist session in an existing channel.
 * Used by appStart.js (standard) and staffReview.js (integrated background flow).
 */
export async function startWrittenSession(interaction, channel, config, user) {
    try {
        const targetUser = user?.user || user || interaction.user;
        const targetId = targetUser.id;
        const targetUsername = targetUser.username || "Utente";
        
        // 1. Randomization Logic: Shuffle and Slice Question Bank
        const shuffled = [...config.questions].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, Math.min(config.questionsPerSession, shuffled.length));
        const sessionQuestions = selectedQuestions.map(q => ({ text: q.text, minLength: q.minLength }));

        // 2. Update/Create Whitelist App Record
        let app = await WhitelistApp.findOne({ channelId: channel.id });
        
        if (app) {
            app.status = 'PENDING';
            app.currentQuestionIndex = 0;
            app.sessionQuestions = sessionQuestions;
            app.answers = [];
            app.startTime = new Date();
            await app.save();
        } else {
            app = await WhitelistApp.create({
                userId: targetId,
                guildId: channel.guild.id,
                channelId: channel.id,
                status: 'PENDING',
                currentQuestionIndex: 0,
                sessionQuestions: sessionQuestions,
                answers: [],
                startTime: new Date()
            });
        }

        // 3. Update last attempt on User
        await User.findOneAndUpdate(
            { discordId: targetId },
            { $set: { username: targetUsername, lastWhitelistAttempt: new Date() } },
            { upsert: true }
        );

        // 4. INITIAL MESSAGES
        // A. Welcome Embed
        const startEmbed = buildEmbed(config.embeds.start, {
            user: targetUser,
            guild: channel.guild.name,
            time_limit: config.timeLimit,
            total_questions: sessionQuestions.length,
            question: sessionQuestions[0].text,
            min_length: sessionQuestions[0].minLength
        }, config);

        await channel.send({ content: `${targetUser}`, embeds: [startEmbed] });

        // B. First Question Embed
        const firstQuestion = sessionQuestions[0];
        const qEmbed = buildEmbed(config.embeds.question, {
            current_index: 1,
            total_questions: sessionQuestions.length,
            question: firstQuestion.text,
            min_length: firstQuestion.minLength,
            time_left: config.timeLimit
        }, config);

        await channel.send({ embeds: [qEmbed] });

        // 5. Timer for timeout
        if (config.timeLimitEnabled) {
            const timeoutMs = config.timeLimit * 60 * 1000;
            app.deletionScheduledAt = new Date(Date.now() + timeoutMs);
            await app.save();
        }

        return true;
    } catch (error) {
        logger.error('[SessionHandler] Error starting written session:', error);
        throw error;
    }
}
