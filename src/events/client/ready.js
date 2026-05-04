import logger from '../../utils/logger.js';
import config from '../../../config/config.js';
import { Events, REST, Routes } from 'discord.js';
import { recoverWhitelistSessions } from '../../modules/whitelist/utils/recovery.js';
import { initVoiceCleanup } from '../../modules/whitelist/utils/voiceCleanup.js';
import whiteLabelHelper from '../../utils/whiteLabelHelper.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.success(`Logged in as ${client.user.tag}!`);
        
        // Register slash commands
        const rest = new REST({ version: '10' }).setToken(config.token);
        const commands = Array.from(client.commands.values()).map(c => c.data.toJSON());

        try {
            logger.info(`Started refreshing application (/) commands for Client: ${config.clientId}${config.devMode ? ` in Guild: ${config.guildId}` : ' (Global)'}`);

            if (config.devMode && config.guildId) {
                try {
                    await rest.put(
                        Routes.applicationGuildCommands(config.clientId, config.guildId),
                        { body: commands },
                    );
                    logger.success(`Successfully reloaded ${commands.length} commands for guild ${config.guildId}`);
                } catch (guildError) {
                    if (guildError.code === 50001) {
                        logger.warn('Guild registration failed with Missing Access. Trying global fallback...');
                        await rest.put(
                            Routes.applicationCommands(config.clientId),
                            { body: commands },
                        );
                        logger.success(`Successfully reloaded ${commands.length} commands GLOBALLY (Fallback).`);
                    } else {
                        throw guildError;
                    }
                }
            } else {
                // Global registration
                await rest.put(
                    Routes.applicationCommands(config.clientId),
                    { body: commands },
                );
                logger.success(`Successfully reloaded ${commands.length} application (/) commands globally.`);
            }
        } catch (error) {
            logger.error('Failed to register application commands:', error);
            if (error.code === 50001) {
                logger.error('CRITICAL: The bot still lacks "applications.commands" scope. Please ensure you used the correct invite link.');
            }
        }

        // Recover active whitelist sessions
        await recoverWhitelistSessions(client);

        // Cleanup orphaned voice channels (Startup Sanity Check)
        setTimeout(() => initVoiceCleanup(client), 5000); // 5s delay to ensure cache is ready

        // White-label: Sync global status (Rotation check every 5s)
        await whiteLabelHelper.syncGlobalStatus(client);
        setInterval(() => whiteLabelHelper.syncGlobalStatus(client), 5 * 1000);
    },
};
