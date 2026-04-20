import { Client, Collection, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';
import config from './config/config.js';
import logger from './src/utils/logger.js';
import eventHandler from './src/handlers/eventHandler.js';
import moduleHandler from './src/handlers/moduleHandler.js';
import { startDashboard } from './src/core/dashboardManager.js';
import { PhotoContestManager } from './src/modules/photoContest/manager.js';
import { FiveMManager } from './src/modules/fivem/manager.js';
import CleanupManager from './src/core/cleanupManager.js';
import EmbedSchedulerManager from './src/core/EmbedSchedulerManager.js';
import { TwitchManager } from './src/modules/twitch/manager.js';


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

// Execute Handlers
const init = async () => {
    logger.info('Initializing bot...');
    client.setMaxListeners(25);
    
    // Connect to Database
    if (config.mongoUri) {
        try {
            // Disable buffering to prevent operation timeouts if connection fails
            mongoose.set('bufferCommands', false);
            
            await mongoose.connect(config.mongoUri, {
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            });
            logger.db('Successfully connected to MongoDB.');
        } catch (error) {
            logger.error('Failed to connect to MongoDB. Check your Atlas IP Whitelist:', error.message);
            // Optionally disable features that depend on DB
            process.env.DB_CONNECTED = 'false';
        }
    } else {
        logger.warn('No MongoDB URI provided. Database features will be disabled.');
    }

    // Load Handlers
    await eventHandler(client);
    await moduleHandler(client);

    // Dashboard & Ready Logic
    client.once('clientReady', () => {
        logger.info(`[Bot] Logged in as ${client.user.tag}!`);
        
        // Modules Manager
        const photoContestManager = new PhotoContestManager(client);
        photoContestManager.init();

        const fivemManager = new FiveMManager(client);
        fivemManager.init();

        // Persistence Manager
        const cleanupManager = new CleanupManager(client);
        cleanupManager.start(60000); // Check every minute

        const embedScheduler = new EmbedSchedulerManager(client);
        embedScheduler.start(60000); // Check every minute

        const twitchManager = new TwitchManager(client);
        twitchManager.init();

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

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
});

// Trigger nodemon restart
