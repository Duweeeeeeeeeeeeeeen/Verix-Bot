import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import SocialConfig from '../src/models/SocialConfig.js';

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const guildId = '1424363754996371460';
        console.log('Searching for guild:', guildId);
        
        let config = await SocialConfig.findOne({ guildId });
        console.log('Found config:', JSON.stringify(config, null, 2));

        if (!config) {
            console.log('Creating new config...');
            config = await SocialConfig.create({ guildId });
            console.log('Created config:', JSON.stringify(config, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
}

check();
