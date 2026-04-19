import { ChannelType, Events, MessageFlags, PermissionFlagsBits } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import User from '../../../models/User.js';
import ErrorHelper from '../../../utils/errorHelper.js';
import logger from '../../../utils/logger.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { checkBotPermissions, formatMissingPermissions } from '../../../utils/permissionHelper.js';

export default {
    name: Events.InteractionCreate,
    /**
     * @param {import('discord.js').ButtonInteraction} interaction 
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        
        const customId = interaction.customId.toLowerCase();
        const isStartButton = customId === 'start_wl' || customId.includes('apply');
                             
        if (!isStartButton) return;
        
        // --- 0. IMMEDIATE ACKNOWLEDGEMENT ---
        // Claim the interaction as early as possible to prevent timeouts
        try {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            logger.error('[DEFER ERROR] Failed to defer whitelist interaction:', error);
            return;
        }
        
        // --- 1. CONFIG & PERMISSIONS ---

        try {
            const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            if (!config || config.questions.length === 0) {
                return interaction.editReply({ content: 'La whitelist non è ancora configurata correttamente o non ci sono domande.' });
            }

            // --- 2. PERMISSION CHECK ---
            const permCheck = checkBotPermissions(interaction.channel, [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks
            ]);

            if (!permCheck.hasPermission) {
                return interaction.editReply({ 
                    content: formatMissingPermissions(permCheck.missing)
                });
            }

            // --- 3. CONCURRENCY CHECK ---
            // Check if user already has a pending application
            const existingApp = await WhitelistApp.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, status: 'PENDING' });
            if (existingApp) {
                // VERIFICATION: Check if the channel still exists on Discord
                const channelExists = interaction.guild.channels.cache.has(existingApp.channelId) || 
                                     await interaction.guild.channels.fetch(existingApp.channelId).catch(() => null);

                if (!channelExists) {
                    // Channel was manually deleted, mark app as CANCELLED and proceed
                    console.log(`[Whitelist] Cleaning up stale session for ${interaction.user.tag} (Channel ${existingApp.channelId} not found)`);
                    existingApp.status = 'CANCELLED';
                    await existingApp.save();
                } else {
                    const solution = `Cerca il tuo canale attuale (<#${existingApp.channelId}>) o attendi che venga eliminato automaticamente se lo hai abbandonato.`;
                    return interaction.editReply({ 
                        content: ErrorHelper.formatActionable('⚠️', 'Hai già una sessione whitelist in corso.', solution)
                    });
                }
            }

            // Global Cooldown Check
            let userData = await User.findOne({ discordId: interaction.user.id });
            if (!userData) {
                userData = await User.create({ discordId: interaction.user.id, username: interaction.user.username });
            }

            if (config.cooldownEnabled && userData.lastWhitelistAttempt) {
                const cooldownMs = config.cooldown * 60 * 60 * 1000;
                const timePassed = Date.now() - userData.lastWhitelistAttempt.getTime();

                if (timePassed < cooldownMs) {
                    const timeLeft = cooldownMs - timePassed;
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return interaction.editReply({ 
                        content: `⚠️ **Sessione in Cooldown!**\nNon puoi inviare una nuova domanda così presto. Devi attendere ancora **${hours}h e ${minutes}m**.`
                    });
                }
            }

            // Randomization Logic: Shuffle and Slice Question Bank
            const shuffled = [...config.questions].sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffled.slice(0, Math.min(config.questionsPerSession, shuffled.length));
            const sessionQuestions = selectedQuestions.map(q => ({ text: q.text, minLength: q.minLength }));

            // Update last attempt
            userData.lastWhitelistAttempt = new Date();
            await userData.save();

            // --- 4. CREATE CHANNEL ---
            const channel = await interaction.guild.channels.create({
                name: `wl-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: config.categoryOpenId || null, // Use configured category
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.EmbedLinks] },
                ],
            });

            // Create App Record with Session Questions
            await WhitelistApp.create({
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                channelId: channel.id,
                status: 'PENDING',
                currentQuestionIndex: 0,
                sessionQuestions: sessionQuestions,
                answers: [],
                startTime: new Date()
            });

            // --- 5. INITIAL MESSAGES ---
            // A. Welcome Embed
            const startEmbed = buildEmbed(config.embeds.start, {
                user: interaction.user,
                guild: interaction.guild.name,
                time_limit: config.timeLimit,
                total_questions: sessionQuestions.length,
                question: sessionQuestions[0].text,
                min_length: sessionQuestions[0].minLength
            }, config);

            await channel.send({ content: `${interaction.user}`, embeds: [startEmbed] });

            // B. First Question Embed (Mandatory to avoid user confusion)
            const firstQuestion = sessionQuestions[0];
            const qEmbed = buildEmbed(config.embeds.question, {
                current_index: 1,
                total_questions: sessionQuestions.length,
                question: firstQuestion.text,
                min_length: firstQuestion.minLength,
                time_left: config.timeLimit
            }, config);

            await channel.send({ embeds: [qEmbed] });

            // Done!
            await interaction.editReply({ content: `✅ Pratica avviata! Dirigiti qui: ${channel}` });

            // Timer for timeout (Persistent)
            if (config.timeLimitEnabled) {
                const timeoutMs = config.timeLimit * 60 * 1000;
                const app = await WhitelistApp.findOne({ channelId: channel.id });
                if (app) {
                    app.deletionScheduledAt = new Date(Date.now() + timeoutMs);
                    await app.save();
                    logger.info(`[Whitelist] Scheduled cleanup for channel ${channel.id} in ${config.timeLimit}m`);
                }
            } else {
                logger.info(`[Whitelist] Timer disabled for channel ${channel.id}`);
            }

        } catch (error) {
            logger.error('Error starting whitelist application:', error);
            // Since we deferred at the start, we MUST use editReply or followUp
            const errorMessage = 'Si è verificato un errore critico nell\'avvio della pratica. Riprova tra qualche istante.';
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, flags: [MessageFlags.Ephemeral] });
            }
        }
    },
};
