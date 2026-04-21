import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WhitelistConfig from './src/models/WhitelistConfig.js';
import TicketConfig from './src/models/TicketConfig.js';
import VerifyConfig from './src/models/VerifyConfig.js';
import PhotoContestConfig from './src/models/PhotoContestConfig.js';
import TwitchConfig from './src/models/TwitchConfig.js';

dotenv.config();

const guildId = '1424363754996371460';

async function checkConfigs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const twitch = await TwitchConfig.findOne({ guildId });
        console.log('Twitch Title:', twitch?.embed?.title);

        const whitelist = await WhitelistConfig.findOne({ guildId });
        console.log('Whitelist Title:', whitelist?.title);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkConfigs();
