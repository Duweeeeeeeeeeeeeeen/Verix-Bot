import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load base .env
dotenv.config();

// Load .env.local if it exists (for local development overrides)
const localEnvPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath, override: true });
}

const config = {
    token: process.env.DISCORD_TOKEN,
    mongoUri: process.env.MONGO_URI,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    
    // Developer settings
    devMode: String(process.env.DEV_MODE || '').toLowerCase() === 'true',
    registerCommandsOnStart: process.env.REGISTER_COMMANDS_ON_START
        ? String(process.env.REGISTER_COMMANDS_ON_START).toLowerCase() === 'true'
        : process.env.NODE_ENV !== 'production',
    
    // Customizable colors for embeds
    colors: {
        primary: '#5865F2', // Blurple
        success: '#57F287',
        danger: '#ED4245',
        warning: '#FEE75C'
    }
};

export default config;
