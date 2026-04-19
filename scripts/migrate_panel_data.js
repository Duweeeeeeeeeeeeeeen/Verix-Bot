import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WhitelistConfig from '../src/models/WhitelistConfig.js';
import VerifyConfig from '../src/models/VerifyConfig.js';

dotenv.config();

async function migrate() {
    console.log('--- Database Migration: Panel Tracking Fields ---');
    
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // 1. Whitelist Migration
        const wlConfigs = await WhitelistConfig.find({ 
            $or: [
                { lastPanelMessageId: null },
                { lastPanelChannelId: null }
            ],
            panelMessageId: { $ne: null }
        });
        
        console.log(`Whitelist: Found ${wlConfigs.length} documents needing migration.`);
        for (const config of wlConfigs) {
            config.lastPanelMessageId = config.panelMessageId;
            config.lastPanelChannelId = config.panelChannelId;
            await config.save();
            console.log(`  > Migrated Whitelist for Guild: ${config.guildId}`);
        }

        // 2. Verify Migration
        const vConfigs = await VerifyConfig.find({ 
            $or: [
                { lastPanelMessageId: null },
                { lastPanelChannelId: null }
            ],
            panelMessageId: { $ne: null }
        });
        
        console.log(`Verify: Found ${vConfigs.length} documents needing migration.`);
        for (const config of vConfigs) {
            config.lastPanelMessageId = config.panelMessageId;
            config.lastPanelChannelId = config.channelId;
            await config.save();
            console.log(`  > Migrated Verify for Guild: ${config.guildId}`);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

migrate();
