import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WhitelistConfig from './src/models/WhitelistConfig.js';
import TicketConfig from './src/models/TicketConfig.js';
import VerifyConfig from './src/models/VerifyConfig.js';
import PhotoContestConfig from './src/models/PhotoContestConfig.js';
import SocialConfig from './src/models/SocialConfig.js';

dotenv.config();

async function checkConfigs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const guilds = ['1493304266859876525', '1424363754996371460'];

        for (const guildId of guilds) {
            console.log(`\n--- Checking Guild: ${guildId} ---`);
            
            const social = await SocialConfig.findOne({ guildId });
            console.log('Twitch Title (from Socials):', social?.platforms?.twitch?.embed?.title || 'Not Set');

            const whitelist = await WhitelistConfig.findOne({ guildId });
            console.log('Whitelist Title:', whitelist?.title || 'Not Set');

            const ticket = await TicketConfig.findOne({ guildId });
            console.log('Ticket Panel Title:', ticket?.embeds?.panel?.title || 'Not Set');

            const verify = await VerifyConfig.findOne({ guildId });
            console.log('Verify Panel Title:', verify?.embeds?.panel?.title || 'Not Set');

            const photo = await PhotoContestConfig.findOne({ guildId });
            console.log('Photo Contest Title:', photo?.embedSettings?.title || 'Not Set');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkConfigs();
