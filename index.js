import { Client, Collection, GatewayIntentBits, Events, Partials } from 'discord.js';
import mongoose from 'mongoose';
import config from './config/config.js';
import logger from './src/utils/logger.js';
import eventHandler from './src/handlers/eventHandler.js';
import commandHandler from './src/handlers/commandHandler.js';
import moduleHandler from './src/handlers/moduleHandler.js';
import { startDashboard } from './src/core/dashboardManager.js';
import { PhotoContestManager } from './src/modules/photoContest/manager.js';
import { FiveMManager } from './src/modules/fivem/manager.js';
import CleanupManager from './src/core/cleanupManager.js';
import EmbedSchedulerManager from './src/core/EmbedSchedulerManager.js';
import { SocialManager } from './src/modules/socials/manager.js';
import AutomationManager from './src/core/automationManager.js';
import GiveawayManager from './src/modules/giveaway/manager.js';
import AnalyticsManager from './src/core/analyticsManager.js';
import multiBotManager from './src/core/multiBotManager.js';
import ReactionRoleManager from './src/modules/reactionRoles/manager.js';
import PollManager from './src/modules/polls/manager.js';
import MonitoringService from './src/services/monitoringService.js';
import installRuntimeGuards from './src/utils/runtimeGuards.js';
import * as voiceXpHandler from './src/handlers/voiceXpHandler.js';

// Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
});

installRuntimeGuards(client);

// Collections
client.commands = new Collection();

// Singleton check to prevent double-initialization
if (global.botInitialized) {
    logger.warn('Bot already initialized in this process. Skipping second initialization.');
} else {
    global.botInitialized = true;
    global.sessionId = Math.random().toString(36).substring(7).toUpperCase();
    
    // Execute Handlers
    const init = async () => {
        logger.info(`Initializing bot [Session: ${global.sessionId}]...`);
        client.setMaxListeners(25);
        
        // Connect to Database
        if (config.mongoUri) {
            try {
                // Enable command buffering to handle temporary connection delays
                mongoose.set('bufferCommands', true);
                
                logger.info('Connecting to MongoDB...');
                await mongoose.connect(config.mongoUri, {
                    serverSelectionTimeoutMS: 5000,
                    family: 4,
                });
                logger.db('Successfully connected to MongoDB.');
            } catch (error) {
                logger.error('CRITICAL: Failed to connect to MongoDB:', error.message);
                logger.error('The bot requires a database connection to function. Please check your MONGO_URI and IP whitelist.');
                process.exit(1); // Exit if DB is required but fails
            }
        } else {
            logger.error('CRITICAL: MONGO_URI is missing in .env!');
            process.exit(1);
        }

        // Load Handlers
        await eventHandler(client);
        await commandHandler(client);
        await moduleHandler(client);

        // Dashboard & Ready Logic
        client.once(Events.ClientReady, async () => {
            logger.info(`[Bot] Logged in as ${client.user.tag}!`);
            
            // Modules Manager
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

            client.reactionRoleManager = new ReactionRoleManager(client);
            client.reactionRoleManager.init();

            client.pollManager = new PollManager(client);
            client.pollManager.init();

            client.monitoring = new MonitoringService(client);
            await client.monitoring.init();

            // Start Voice XP tracking
            voiceXpHandler.start(client);

            startDashboard(client);

            // Initialize Multi-Bot Manager
            await multiBotManager.init(client);
            client.multiBotManager = multiBotManager;
        });

        // Login
        if (config.token) {
            client.login(config.token);
        } else {
            logger.error('CRITICAL: DISCORD_TOKEN is missing!');
            process.exit(1);
        }
    };

    client.on(Events.MessageCreate, (message) => {
        if (client.automationManager) client.automationManager.handleMessage(message);
    });

    init().catch((error) => {
        logger.error('Fatal initialization error:', error);
        process.exit(1);
    });
}
