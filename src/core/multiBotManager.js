import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import PrivateBot from '../models/PrivateBot.js';
import logger from '../utils/logger.js';
import eventHandler from '../handlers/eventHandler.js';
import commandHandler from '../handlers/commandHandler.js';
import moduleHandler from '../handlers/moduleHandler.js';
import { PhotoContestManager } from '../modules/photoContest/manager.js';
import { FiveMManager } from '../modules/fivem/manager.js';
import CleanupManager from './cleanupManager.js';
import EmbedSchedulerManager from './EmbedSchedulerManager.js';
import { SocialManager } from '../modules/socials/manager.js';
import AutomationManager from './automationManager.js';
import GiveawayManager from '../modules/giveaway/manager.js';
import AnalyticsManager from './analyticsManager.js';
import cryptoHelper from '../utils/cryptoHelper.js';

class MultiBotManager {
    constructor() {
        this.instances = new Map(); // guildId -> client
        this.enabledPrivateBotGuilds = new Set(); // Track guilds that have a private bot ENABLED
    }

    async init(mainClient) {
        this.mainClient = mainClient;
        logger.info('[MultiBot] Initializing private bot instances...');
        const privateBots = await PrivateBot.find({ enabled: true });
        
        for (const botConfig of privateBots) {
            this.enabledPrivateBotGuilds.add(botConfig.guildId);
            await this.startBot(botConfig);
        }
        
        logger.success(`[MultiBot] Started ${this.instances.size} private bot instances.`);
    }

    /**
     * Determines if a specific bot instance should handle a guild.
     * Used to prevent main bot and private bots from performing duplicate actions.
     */
    shouldHandle(guildId, client) {
        if (!guildId) return true;

        // If a private bot is registered and enabled for this guild
        if (this.enabledPrivateBotGuilds.has(guildId)) {
            // Only the specific private bot instance for this guild should handle it
            const privateInstance = this.instances.get(guildId);
            return client === privateInstance;
        }

        // If no private bot is enabled, only the main bot should handle it
        return client === this.mainClient;
    }

    async startBot(botConfig) {
        const { token, guildId } = botConfig;
        
        this.enabledPrivateBotGuilds.add(guildId);

        if (this.instances.has(guildId)) {
            logger.warn(`[MultiBot] Bot for guild ${guildId} is already running.`);
            return;
        }

        try {
            const client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildVoiceStates,
                ]
            });

            client.commands = new Collection();
            client.isPrivateBot = true;
            client.ownerGuildId = guildId;

            // Load Handlers
            await eventHandler(client);
            await commandHandler(client);
            await moduleHandler(client);

            client.once(Events.ClientReady, async () => {
                logger.info(`[MultiBot] Private Bot logged in as ${client.user.tag} for Guild ${guildId}`);
                
                // --- PROTECTION: Leave unauthorized guilds ---
                const guilds = await client.guilds.fetch();
                for (const [id, guild] of guilds) {
                    if (id !== guildId) {
                        try {
                            const g = await client.guilds.fetch(id);
                            logger.warn(`[MultiBot] Private bot for ${guildId} found in unauthorized guild ${id} (${g.name}). Leaving...`);
                            await g.leave();
                        } catch (e) {
                            logger.error(`[MultiBot] Failed to leave unauthorized guild ${id}:`, e);
                        }
                    }
                }
                // ---------------------------------------------

                // Initialize Managers for this specific instance
                client.photocontestManager = new PhotoContestManager(client);
                client.photocontestManager.init();

                client.fivemManager = new FiveMManager(client);
                client.fivemManager.init();

                client.cleanupManager = new CleanupManager(client);
                client.cleanupManager.start(60000); 

                client.embedScheduler = new EmbedSchedulerManager(client);
                client.embedScheduler.start(60000); 

                client.automationManager = new AutomationManager(client);
                client.automationManager.start(60000); 

                client.socialManager = new SocialManager(client);
                client.socialManager.init();

                client.giveawayManager = new GiveawayManager(client);
                client.giveawayManager.init();

                client.analyticsManager = new AnalyticsManager(client);
                client.analyticsManager.start(1000 * 60 * 60);

                await PrivateBot.findByIdAndUpdate(botConfig._id, { 
                    status: 'online', 
                    lastStartedAt: new Date(),
                    clientName: client.user.username,
                    avatarUrl: client.user.displayAvatarURL()
                });
            });

            client.on(Events.GuildCreate, async (guild) => {
                if (guild.id !== guildId) {
                    logger.warn(`[MultiBot] Private bot for ${guildId} joined unauthorized guild ${guild.id} (${guild.name}). Leaving...`);
                    try {
                        await guild.leave();
                    } catch (e) {
                        logger.error(`[MultiBot] Failed to leave unauthorized guild ${guild.id}:`, e);
                    }
                }
            });

            client.on(Events.Error, (error) => {
                logger.error(`[MultiBot] Error in private bot for guild ${guildId}:`, error);
            });

            client.on(Events.MessageCreate, (message) => {
                if (client.automationManager) client.automationManager.handleMessage(message);
            });

            // Decrypt token before login
            const decryptedToken = cryptoHelper.decrypt(token);
            await client.login(decryptedToken);
            this.instances.set(guildId, client);

        } catch (error) {
            logger.error(`[MultiBot] Failed to start private bot for guild ${guildId}:`, error);
            await PrivateBot.findByIdAndUpdate(botConfig._id, { status: 'error', lastError: error.message });
            
            // Notify owner via monitoring service
            if (this.mainClient && this.mainClient.monitoring) {
                await this.mainClient.monitoring.notifyPrivateBotError(guildId, error.message);
            }
        }
    }

    async stopBot(guildId) {
        const client = this.instances.get(guildId);
        this.enabledPrivateBotGuilds.delete(guildId);
        if (client) {
            client.destroy();
            this.instances.delete(guildId);
            await PrivateBot.findOneAndUpdate({ guildId }, { status: 'offline' });
            logger.info(`[MultiBot] Stopped private bot for guild ${guildId}`);
        }
    }
}

export default new MultiBotManager();
