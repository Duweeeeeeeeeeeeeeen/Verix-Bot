import mongoose from 'mongoose';
import SocialConfig from '../src/models/SocialConfig.js';
import dotenv from 'dotenv';
dotenv.config();

async function dumpConfig() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const configs = await SocialConfig.find({});
        console.log(JSON.stringify(configs, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

dumpConfig();
