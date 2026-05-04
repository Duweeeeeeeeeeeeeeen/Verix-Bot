import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Import using absolute path or correct relative path
import Guild from '../../../src/models/Guild.js';

async function listPremium() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const premiumGuilds = await Guild.find({ isPremium: true });
        console.log('Premium Guilds count:', premiumGuilds.length);
        premiumGuilds.forEach(g => console.log(`- ${g.guildId} (${g.guildName || 'Unknown'})`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listPremium();
