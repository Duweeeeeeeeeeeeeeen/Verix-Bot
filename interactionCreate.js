import { Events, MessageFlags } from 'discord.js';
import User from '../../models/User.js';
import Guild from '../../models/Guild.js';
import logger from '../../utils/logger.js';
import { resolveModule } from '../../core/moduleManager.js';
import { getModuleConfig } from '../../core/configCache.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.guild) return;

        const guildId = interaction.guild.id;

        // --- 1. PRE-EXECUTION MIDDLEWARE: MODULE SYNC CHECK (CACHED) ---
        const moduleName = resolveModule(interaction);

        // If it's a module interaction and not core 'admin', check if it's enabled
        if (moduleName && moduleName !== 'admin') {
            const config = await getModuleConfig(guildId, moduleName);

            if (!config || !config.enabled) {
                logger.warn(`[MODULE BLOCKED] ${moduleName} -> ${guildId} (User: ${interaction.user.tag})`);
                const message = `❌ Il modulo **${moduleName.toUpperCase()}** è attualmente disattivato. Puoi riattivarlo dalla dashboard amministrativa.`;

                // Block any further execution
                if (!interaction.replied && !interaction.deferred) {
                    return interaction.reply({ content: message, flags: [MessageFlags.Ephemeral] });
                }
                return; // Silent stop if already processed
            }
        }

        // --- 2. AUTOMATIC DB SYNC (Guild & User) - BACKGROUND ---
        // Run in parallel (fire-and-forget) to avoid blocking the 3s interaction window
        Promise.all([
            Guild.findOneAndUpdate(
                { guildId },
                { guildName: interaction.guild.name },
                { upsert: true }
            ),
            User.findOneAndUpdate(
                { discordId: interaction.user.id },
                { username: interaction.user.username },
                { upsert: true }
            )
        ]).catch(error => {
            logger.error('Background database sync error in InteractionCreate:', error);
        });

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
        // These are handled by specific module listeners, but our check at Step 1
        // has already validated their activation status.
    },
};
