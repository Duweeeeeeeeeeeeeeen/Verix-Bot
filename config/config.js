import 'dotenv/config';

const config = {
    token: process.env.DISCORD_TOKEN,
    mongoUri: process.env.MONGO_URI,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    
    // Developer settings
    devMode: String(process.env.DEV_MODE || '').toLowerCase() === 'true',
    
    // Customizable colors for embeds
    colors: {
        primary: '#5865F2', // Blurple
        success: '#57F287',
        danger: '#ED4245',
        warning: '#FEE75C'
    }
};

export default config;
