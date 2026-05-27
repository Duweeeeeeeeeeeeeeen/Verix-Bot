import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TicketConfig from './src/models/TicketConfig.js';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const configs = await TicketConfig.find({});
        console.log('--- ALL TICKET CONFIGS ---');
        for (const config of configs) {
            console.log(`Guild: ${config.guildId}`);
            console.log(`Staff Role IDs:`, JSON.stringify(config.staffRoleIds, null, 2));
            console.log(`Buttons:`, JSON.stringify(config.buttons, null, 2));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
