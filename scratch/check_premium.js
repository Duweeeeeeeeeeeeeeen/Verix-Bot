import mongoose from 'mongoose';
import Guild from './src/models/Guild.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkPremium() {
    await mongoose.connect(process.env.MONGO_URI);
    const guilds = await Guild.find({ isPremium: true });
    console.log('Premium Guilds:', guilds.map(g => ({ id: g.guildId, name: g.guildName, isPremium: g.isPremium, customBotName: g.customBotName })));
    process.exit(0);
}

checkPremium();
