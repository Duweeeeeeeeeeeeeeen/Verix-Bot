import { Events, MessageFlags } from 'discord.js';
import User from '../../models/User.js';
import Guild from '../../models/Guild.js';
import logger from '../../utils/logger.js';
import { resolveModule } from '../../core/moduleManager.js';
import { getModuleConfig } from '../../core/configCache.js';
import whiteLabelHelper from '../../utils/whiteLabelHelper.js';
import multiBotManager from '../../core/multiBotManager.js';
import messageService from '../../utils/messageService.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.guild) return;

        const guildId = interaction.guild.id;
        const client = interaction.client;

        // If a Platinum private bot is enabled for this guild, the main Verix
        // client must not process commands/interactions there.
        if (!multiBotManager.shouldHandle(guildId, client)) {
            return;
        }

        // --- 0. PRIVATE BOT PROTECTION: Block interactions in unauthorized guilds ---
        if (client.isPrivateBot && client.ownerGuildId !== guildId) {
            logger.warn(`[MultiBot] Blocked interaction in unauthorized guild ${guildId} for private bot ${client.user.tag}. Leaving...`);
            try {
                await interaction.guild.leave();
            } catch (e) {
                logger.error(`[MultiBot] Failed to leave unauthorized guild ${guildId}:`, e);
            }
            return; // Stop execution
        }

        // --- 1. PRE-EXECUTION MIDDLEWARE: MODULE SYNC CHECK (CACHED) ---
        const moduleName = resolveModule(interaction);

        // If it's a module interaction and not core 'admin', check if it's enabled
        if (moduleName && moduleName !== 'admin') {
            const config = await getModuleConfig(guildId, moduleName);

            if (!config || !config.enabled) {
                logger.warn(`[MODULE BLOCKED] ${moduleName} -> ${guildId} (User: ${interaction.user.tag})`);

                // Block any further execution
                if (!interaction.replied && !interaction.deferred) {
                    return messageService.reply(
                        interaction,
                        'system',
                        'module_disabled',
                        { module: moduleName.toUpperCase() },
                        { ephemeral: true }
                    );
                }
                return; // Silent stop if already processed
            }
        }

        // --- 2. AUTOMATIC DB SYNC (Guild & User) - BACKGROUND ---
        // We do this in the background to avoid blocking the 3-second interaction window
        (async () => {
            try {
                await Guild.findOneAndUpdate(
                    { guildId },
                    { guildName: interaction.guild.name },
                    { upsert: true }
                );

                await User.findOneAndUpdate(
                    { discordId: interaction.user.id },
                    { username: interaction.user.username },
                    { upsert: true }
                );

                // White-label: Sync bot identity in this guild
                await whiteLabelHelper.syncGuildIdentity(interaction.guild);
            } catch (error) {
                logger.error('Background database sync error in InteractionCreate:', error);
            }
        })();

        // --- 3. COMMAND ROUTING ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing command ${interaction.commandName}`, error);
                const errorMsg = { content: 'An error occurred while executing this command.', flags: [MessageFlags.Ephemeral] };

                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(errorMsg);
                    } else if (interaction.isRepliable()) {
                        await interaction.reply(errorMsg);
                    }
                } catch (replyError) {
                    logger.error(`Failed to send error message to user (Token expired or interaction invalid): ${replyError.message}`);
                }
            }
        }

        // --- 4. OTHER INTERACTIONS (Buttons, Menus, Modals) ---
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('rr_')) {
                return client.reactionRoleManager.handleInteraction(interaction);
            }
            if (interaction.customId.startsWith('poll_')) {
                return client.pollManager.handleInteraction(interaction);
            }
        }

        // These are handled by specific module listeners (like tickets)
        // or through the interactionCreate event in other modules
    },
};
