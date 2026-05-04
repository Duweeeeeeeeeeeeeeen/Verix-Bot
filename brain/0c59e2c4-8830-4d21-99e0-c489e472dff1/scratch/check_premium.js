import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Guild from './src/models/Guild.js';

async function check(guildId) {
    await mongoose.connect(process.env.MONGODB_URI);
    const g = await Guild.findOne({ guildId });
    console.log('Guild:', guildId);
    console.log('isPremium:', g?.isPremium);
    process.exit(0);
}

const gId = process.argv[2];
if (gId) check(gId);
else {
    console.log('Usage: node scratch/check_premium.js <guildId>');
    process.exit(1);
}
