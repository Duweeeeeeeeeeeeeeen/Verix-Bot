import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import { getModuleConfig } from '../core/configCache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store registered events to avoid duplicates on re-initialization
// Global registry to prevent double-registration across reloads
if (!global.eventRegistry) global.eventRegistry = new Map();
if (!global.registeredEvents) global.registeredEvents = new Set();

export default async (client) => {
    const eventRegistry = global.eventRegistry;
    const registeredEvents = global.registeredEvents;
    
    const modulesPath = path.join(__dirname, '../modules');
    const modulesSubfolders = await fs.readdir(modulesPath);

    logger.info('Initializing Modules...');

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
                
                // Prevent duplicate files in the same module
                const alreadyExists = moduleEvents.get(moduleName).some(e => e._filePath === filePath);
                if (!alreadyExists) {
                    event._filePath = filePath;
                    moduleEvents.get(moduleName).push(event);
                }
            }
        }
    }

    // --- Register Centralized Events ---
    for (const [eventName, moduleMap] of eventRegistry.entries()) {
        const isOnce = Array.from(moduleMap.values()).flat().some(e => e.once);

        // Skip if already registered for this event (prevents duplicates on hot-reload if used)
        if (registeredEvents.has(eventName)) {
            logger.warn(`Event ${eventName} is already registered. Skipping.`);
            continue;
        }

        const hubExecutor = async (...args) => {
            const interaction = args[0];
            const guildId = interaction?.guildId || interaction?.guild?.id;

            if (interaction && (interaction.customId || interaction.commandName)) {
                logger.debug(`[HUB] Interaction: ${interaction.customId || interaction.commandName} | Guild: ${guildId}`);
            }

            // Pre-calculate module prefixes/shortnames for matching
            const modulePrefixes = {
                'background': 'bg',
                'whitelist': 'wl',
                'photocontest': 'pc',
                'fivem': '5m',
                'verify': 'vr',
                'tickets': 'tk'
            };

            for (const [moduleName, eventFiles] of moduleMap.entries()) {
                let matchesModule = false;
                
                // Interaction Routing Logic
                if (guildId) {
                    const isInteraction = interaction.type !== undefined && 
                                         (typeof interaction.isButton === 'function' || 
                                          typeof interaction.isCommand === 'function' || 
                                          typeof interaction.isModalSubmit === 'function' ||
                                          typeof interaction.isStringSelectMenu === 'function');
                    
                    if (isInteraction) {
                        const target = (interaction.customId || interaction.commandName || "").toLowerCase();
                        const prefix = modulePrefixes[moduleName.toLowerCase()];
                        
                        // Check if it belongs to this module
                        matchesModule = target.includes(moduleName.toLowerCase()) || 
                                        (moduleName === 'tickets' && (target.includes('ticket') || target.startsWith('tk_'))) ||
                                        (prefix && (target.startsWith(`${prefix}_`) || target.includes(`_${prefix}_`) || target.endsWith(`_${prefix}`)));

                        // Skip if not admin and not matching
                        if (moduleName !== 'admin' && !matchesModule) continue;

                        // Module activation check
                        const config = await getModuleConfig(guildId, moduleName);
                        if (!config || !config.enabled) {
                            if (matchesModule) {
                                logger.warn(`[HUB] Module ${moduleName} is DISABLED for guild ${guildId} but received interaction ${target}`);
                                // Send a response to avoid "Interaction failed"
                                if (!interaction.replied && !interaction.deferred) {
                                    await interaction.reply({ 
                                        content: `❌ Il modulo **${moduleName.toUpperCase()}** è attualmente disattivato in questo server.`, 
                                        flags: [MessageFlags.Ephemeral] 
                                    }).catch(() => {});
                                }
                            }
                            continue;
                        }
                        
                        if (matchesModule) logger.debug(`[HUB] Routing ${target} to module: ${moduleName}`);
                    } else {
                        // For non-interaction events (MessageCreate), check activation
                        const config = await getModuleConfig(guildId, moduleName);
                        if (!config || !config.enabled) continue;
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
        
        registeredEvents.add(eventName);
        const count = Array.from(moduleMap.values()).flat().length;
        logger.event(`Registered Central Listener for ${eventName} (${count} handlers across ${moduleMap.size} modules)`);
    }
};
