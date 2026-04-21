import mongoose from 'mongoose';
import { ChannelType } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import VoiceQueue from '../../../models/VoiceQueue.js';
import logger from '../../../utils/logger.js';

/**
 * Scans all guilds and cleans up orphaned or empty Voice Interview channels.
 * Runs on bot startup.
 * @param {import('discord.js').Client} client 
 */
export async function initVoiceCleanup(client) {
    if (mongoose.connection.readyState !== 1) return;
    logger.info('[VoiceCleanup] Starting startup cleanup scan...');

    try {
        const configs = await WhitelistConfig.find({ 'voiceSettings.joinChannelId': { $ne: '' } });
        const guildsWithVoice = configs.map(c => c.guildId);

        if (guildsWithVoice.length === 0) {
            return logger.info('[VoiceCleanup] No guilds with voice interview system configured.');
        }

        let totalDeleted = 0;

        for (const guildId of guildsWithVoice) {
            const guild = await client.guilds.fetch(guildId).catch(() => null);
            if (!guild) continue;

            const channels = await guild.channels.fetch().catch(() => null);
            if (!channels) continue;

            // Filter for voice channels starting with 'wl-'
            const tempVoiceChannels = channels.filter(c => 
                c.type === ChannelType.GuildVoice && 
                c.name.startsWith('wl-')
            );

            for (const [id, channel] of tempVoiceChannels) {
                let shouldDelete = false;
                let reason = '';

                // Criterion A: Empty Channel
                if (channel.members.size === 0) {
                    shouldDelete = true;
                    reason = 'Channel is empty';
                } else {
                    // Criterion B: No active session in DB
                    const session = await VoiceQueue.findOne({ voiceChannelId: id, status: 'ACTIVE' });
                    if (!session) {
                        shouldDelete = true;
                        reason = 'No active session found in database';
                    }
                }

                if (shouldDelete) {
                    try {
                        await channel.delete();
                        totalDeleted++;
                        logger.info(`[VoiceCleanup] Deleted orphaned channel ${channel.name} in ${guild.name} (Reason: ${reason})`);
                    } catch (err) {
                        logger.error(`[VoiceCleanup] Failed to delete channel ${channel.name}: ${err.message}`);
                    }
                }
            }
        }

        logger.info(`[VoiceCleanup] Cleanup finished. Total channels purged: ${totalDeleted}`);

    } catch (error) {
        logger.error('[VoiceCleanup] Error during startup scan:', error);
    }
}
