import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
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
import AutoClearManager from './src/core/autoClearManager.js';
import GiveawayManager from './src/modules/giveaway/manager.js';


// Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

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
                // Disable buffering to prevent operation timeouts if connection fails
                mongoose.set('bufferCommands', false);
                
                await mongoose.connect(config.mongoUri, {
                    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                    family: 4, // Force IPv4
                });
                logger.db('Successfully connected to MongoDB.');
            } catch (error) {
                logger.error('Failed to connect to MongoDB. This is likely an IP Whitelist issue or incorrect credentials.');
                logger.error('Error details:', error.message);
                process.env.DB_CONNECTED = 'false';
            }
        } else {
            logger.warn('No MongoDB URI provided. Database features will be disabled.');
        }

        // Load Handlers
        await eventHandler(client);
        await commandHandler(client);
        await moduleHandler(client);

        // Dashboard & Ready Logic
        client.once(Events.ClientReady, () => {
            logger.info(`[Bot] Logged in as ${client.user.tag}!`);
            
            // Modules Manager
            client.photocontestManager = new PhotoContestManager(client);
            client.photocontestManager.init();

            client.fivemManager = new FiveMManager(client);
            client.fivemManager.init();

            // Persistence Manager
            client.cleanupManager = new CleanupManager(client);
            client.cleanupManager.start(60000); 

            client.embedScheduler = new EmbedSchedulerManager(client);
            client.embedScheduler.start(60000); 

            client.autoClearManager = new AutoClearManager(client);
            client.autoClearManager.start(60000); 

            client.socialManager = new SocialManager(client);
            client.socialManager.init();

            client.giveawayManager = new GiveawayManager(client);
            client.giveawayManager.init();

            startDashboard(client);
        });

        // Login
        if (config.token) {
            client.login(config.token);
        } else {
            logger.error('CRITICAL: DISCORD_TOKEN is missing in .env file!');
            process.exit(1);
        }
    };

    init();
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
});
