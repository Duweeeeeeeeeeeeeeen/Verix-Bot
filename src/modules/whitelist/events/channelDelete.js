import { Events } from 'discord.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.ChannelDelete,
    /**
     * @param {import('discord.js').NonThreadGuildBasedChannel} channel 
     */
    async execute(channel) {
        if (!channel.guild) return;

        try {
            // Check if this channel belonged to a whitelist application
            const app = await WhitelistApp.findOne({ channelId: channel.id, status: 'PENDING' });
            
            if (app) {
                logger.info(`[Whitelist] Channel ${channel.name} (${channel.id}) deleted. Cancelling application for user ${app.userId}.`);
                
                app.status = 'CANCELLED';
                await app.save();
            }
        } catch (error) {
            logger.error('[Whitelist] Error during channelDelete sync:', error);
        }
    },
};
