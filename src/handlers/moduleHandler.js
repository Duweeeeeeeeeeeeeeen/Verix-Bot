import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (client) => {
    const modulesPath = path.join(__dirname, '../modules');
    const modulesSubfolders = await fs.readdir(modulesPath);

    logger.info('Initializing Modules...');

    // Event Registry: eventName -> Map<moduleName, Array<eventObject>>
    const eventRegistry = new Map();

    for (const moduleName of modulesSubfolders) {
        const modulePath = path.join(modulesPath, moduleName);
        const stat = await fs.stat(modulePath);

        if (!stat.isDirectory()) continue;

        // --- Load Commands ---
        const commandsPath = path.join(modulePath, 'commands');
        if (await fs.exists(commandsPath)) {
            const commandFiles = (await fs.readdir(commandsPath)).filter(f => f.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const fileUri = `file://${filePath.replace(/\\/g, '/')}`;
                const command = (await import(fileUri)).default;

                if (command.data && command.execute) {
                    command.module = moduleName;
                    client.commands.set(command.data.name, command);
                    logger.cmd(`[${moduleName.toUpperCase()}] Command Loaded: ${command.data.name}`);
                }
            }
        }

        // --- Stage Events for Registration ---
        const eventsPath = path.join(modulePath, 'events');
        if (await fs.exists(eventsPath)) {
            const eventFiles = (await fs.readdir(eventsPath)).filter(f => f.endsWith('.js'));
            for (const file of eventFiles) {
                const filePath = path.join(eventsPath, file);
                const fileUri = `file://${filePath.replace(/\\/g, '/')}`;
                const event = (await import(fileUri)).default;

                if (!event || !event.name || !event.execute) continue;

                event.module = moduleName;

                if (!eventRegistry.has(event.name)) {
                    eventRegistry.set(event.name, new Map());
                }

                const moduleEvents = eventRegistry.get(event.name);
                if (!moduleEvents.has(moduleName)) {
                    moduleEvents.set(moduleName, []);
                }
                moduleEvents.get(moduleName).push(event);
            }
        }
    }

    // --- Register Centralized Events ---
    for (const [eventName, moduleMap] of eventRegistry.entries()) {
        const isOnce = Array.from(moduleMap.values()).flat().some(e => e.once);

        const hubExecutor = async (...args) => {
            const interaction = args[0];
            const guildId = interaction?.guildId || interaction?.guild?.id;

            // Iterate through each module that has listeners for this event
            for (const [moduleName, eventFiles] of moduleMap.entries()) {
                
                // If it's a specific module and not 'admin', check activation
                if (guildId && moduleName !== 'admin') {
                    const { getModuleConfig } = await import('../core/configCache.js');
                    const config = await getModuleConfig(guildId, moduleName);

                    if (!config || !config.enabled) {
                        // Professional feedback ONLY if this is precisely the interaction intended for this module
                        // and it hasn't been replied to yet.
                        // We check if the customId or command name belongs to this module (if available)
                        const matchesModule = interaction?.customId?.toLowerCase().includes(moduleName.toLowerCase()) || 
                                              interaction?.commandName?.toLowerCase().includes(moduleName.toLowerCase());

                        if (matchesModule && interaction?.isInteraction && !interaction.replied && !interaction.deferred) {
                            await interaction.reply({ 
                                content: `❌ Il modulo **${moduleName.toUpperCase()}** è attualmente disattivato dalla dashboard amministrativa.`, 
                                ephemeral: true 
                            }).catch(() => {});
                        }
                        continue; // Block execution for THIS module's files
                    }
                }

                // Execute all files for this module
                for (const eventFile of eventFiles) {
                    try {
                        await eventFile.execute(...args, client);
                    } catch (error) {
                        logger.error(`Error in module event [${moduleName.toUpperCase()}] (${eventName}):`, error);
                    }
                }
            }
        };

        if (isOnce) {
            client.once(eventName, hubExecutor);
        } else {
            client.on(eventName, hubExecutor);
        }
        
        const count = Array.from(moduleMap.values()).flat().length;
        logger.event(`Registered Central Listener for ${eventName} (${count} handlers across ${moduleMap.size} modules)`);
    }
};
