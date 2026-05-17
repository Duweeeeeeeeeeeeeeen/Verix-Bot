import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Events, MessageFlags, PermissionFlagsBits } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import Background from '../../../models/Background.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import User from '../../../models/User.js';
import ErrorHelper from '../../../utils/errorHelper.js';
import logger from '../../../utils/logger.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import { checkBotPermissions, formatMissingPermissions } from '../../../utils/permissionHelper.js';
import { startWrittenSession } from '../utils/sessionHandler.js';
import messageService from '../../../utils/messageService.js';

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
        
        try {
            // --- 0.5 CORE PERMISSION CHECK (Fail early) ---
            const permCheck = checkBotPermissions(interaction.channel, [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks
            ]);

            if (!permCheck.hasPermission) {
                const embed = await messageService.get(interaction.guild.id, 'system', 'generic_error', { 
                    error: formatMissingPermissions(permCheck.missing) 
                });
                return interaction.editReply({ embeds: [embed] });
            }

            const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            if (!config || config.questions.length === 0) {
                const embed = await messageService.get(interaction.guild.id, 'whitelist', 'not_configured', {
                    guild: interaction.guild.name
                });
                return interaction.editReply({ embeds: [embed] });
            }

            // --- 1.5 FLOW PREREQUISITES (New Master Mode logic) ---
            const m = config.mode;
            
            // Block access if Written WL is not part of this mode
            const hasWritten = ['TEXT', 'HYBRID', 'BG_TEXT', 'FULL'].includes(m);
            if (!hasWritten) {
                const embed = await messageService.get(interaction.guild.id, 'system', 'module_disabled', {
                    module: 'Whitelist Scritta'
                });
                return interaction.editReply({ embeds: [embed] });
            }

            // Check Background requirement
            const requiresBG = ['BG_TEXT', 'FULL'].includes(m) || config.flowRequirements?.requireBackground;
            if (requiresBG) {
                const bgApproved = await Background.findOne({ 
                    userId: interaction.user.id, 
                    guildId: interaction.guild.id, 
                    status: 'ACCEPTED' 
                });

                if (!bgApproved) {
                    const bgConfig = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
                    
                    // IF INTEGRATED FLOW: Start BG phase inside WL channel
                    if (bgConfig?.entryPoint === 'INTEGRATED') {
                        // Check if they ALREADY have an active integrated BG session
                        const existingBG = await Background.findOne({ 
                            userId: interaction.user.id, 
                            guildId: interaction.guild.id, 
                            status: { $in: ['PENDING', 'SUBMITTED'] } 
                        });
                        
                        if (existingBG) {
                            const embed = await messageService.get(interaction.guild.id, 'background', 'already_exists', {
                                channelId: existingBG.channelId
                            });
                            return interaction.editReply({ embeds: [embed] });
                        }

                        // Create the Whitelist channel early for BG submission
                        const channel = await interaction.guild.channels.create({
                            name: `wl-${interaction.user.username}`,
                            type: ChannelType.GuildText,
                            parent: config.categoryOpenId || null,
                            permissionOverwrites: [
                                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.EmbedLinks] },
                            ],
                        });

                        // Create Whitelist App in WAITING_BACKGROUND state
                        await WhitelistApp.create({
                            userId: interaction.user.id,
                            guildId: interaction.guild.id,
                            channelId: channel.id,
                            status: 'WAITING_BACKGROUND',
                            startTime: new Date()
                        });

                        // Create Background submission record linked to this channel
                        await Background.create({
                            userId: interaction.user.id,
                            guildId: interaction.guild.id,
                            channelId: channel.id,
                            status: 'PENDING'
                        });

                        // Send Background Instructions Embed
                        const bgInstructions = buildEmbed(bgConfig.embeds.instructions, {
                            user: interaction.user,
                            guild: interaction.guild.name
                        }, bgConfig);

                        const submitButton = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('submit_background')
                                .setLabel('Conferma Invio Dossier')
                                .setStyle(ButtonStyle.Success)
                                .setEmoji('✅')
                        );

                        await channel.send({ content: `${interaction.user} (Fase 1: Background)`, embeds: [bgInstructions], components: [submitButton] });
                        
                        const startMsg = await messageService.get(interaction.guild.id, 'whitelist', 'start_success', {
                            channelId: channel.id
                        });
                        return interaction.editReply({ embeds: [startMsg] });
                    }

                    // ELSE (PANEL FLOW): Standard blocking behavior
                    const embed = await messageService.get(interaction.guild.id, 'system', 'module_disabled', {
                        module: 'Dossier Personale'
                    });
                    return interaction.editReply({ embeds: [embed] });
                }
            }

            // --- 3. CONCURRENCY & STATE CHECK ---
            // Check if user already has an active, submitted, or accepted application
            const existingApp = await WhitelistApp.findOne({ 
                userId: interaction.user.id, 
                guildId: interaction.guild.id, 
                status: { $in: ['PENDING', 'SUBMITTED', 'WAITING_VOICE', 'ACCEPTED', 'WAITING_BACKGROUND', 'SUBMITTED_BACKGROUND'] } 
            });

            if (existingApp) {
                if (existingApp.status === 'PENDING' || existingApp.status === 'WAITING_BACKGROUND' || existingApp.status === 'SUBMITTED_BACKGROUND') {
                    // VERIFICATION: Check if the channel still exists on Discord
                    const channelExists = interaction.guild.channels.cache.has(existingApp.channelId) || 
                                         await interaction.guild.channels.fetch(existingApp.channelId).catch(() => null);

                    if (!channelExists) {
                        // Channel was manually deleted, mark app as CANCELLED and proceed
                        logger.info(`[Whitelist] Cleaning up stale session for ${interaction.user.tag} (Channel ${existingApp.channelId} not found)`);
                        existingApp.status = 'CANCELLED';
                        await existingApp.save();
                    } else {
                        const embed = await messageService.get(interaction.guild.id, 'whitelist', 'already_exists', {
                            channelId: existingApp.channelId
                        });
                        return interaction.editReply({ embeds: [embed] });
                    }
                } else if (existingApp.status === 'SUBMITTED') {
                    const embed = await messageService.get(interaction.guild.id, 'whitelist', 'already_exists', {
                        guild: interaction.guild.name
                    });
                    return interaction.editReply({ embeds: [embed] });
                } else if (existingApp.status === 'ACCEPTED' || existingApp.status === 'WAITING_VOICE') {
                    const embed = await messageService.get(interaction.guild.id, 'whitelist', 'already_exists', {
                        guild: interaction.guild.name
                    });
                    return interaction.editReply({ embeds: [embed] });
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
                    
                    const embed = await messageService.get(interaction.guild.id, 'whitelist', 'cooldown_error', {
                        time: `${hours}h ${minutes}m`
                    });
                    return interaction.editReply({ embeds: [embed] });
                }
            }

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

            // Start using shared utility
            await startWrittenSession(interaction, channel, config);

            // Done!
            const embed = await messageService.get(interaction.guild.id, 'whitelist', 'start_success', {
                channelId: channel.id
            });
            await interaction.editReply({ embeds: [embed] });

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
            if (interaction.deferred || interaction.replied) {
                await messageService.reply(interaction, 'system', 'generic_error', {}, { ephemeral: true });
            } else {
                await messageService.reply(interaction, 'system', 'generic_error', {}, { ephemeral: true });
            }
        }
    },
};
