
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const GUILD_ID = '1424363754996371460';

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const ticketConfigs = db.collection('ticketconfigs');
        
        const config = await ticketConfigs.findOne({ guildId: GUILD_ID });
        
        if (!config) {
            console.log('No config found for guild', GUILD_ID);
        } else {
            console.log('--- RAW CONFIG FROM DB ---');
            console.log(JSON.stringify(config, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
