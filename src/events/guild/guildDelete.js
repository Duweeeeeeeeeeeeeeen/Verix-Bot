import { Events } from 'discord.js';
import Guild from '../../models/Guild.js';
import logger from '../../utils/logger.js';

export default {
    name: Events.GuildDelete,
    async execute(guild, client) {
        if (!guild) return;

        logger.info(`[Bot] Left guild: ${guild.name} (${guild.id})`);

        try {
            // Set setupCompleted to false on deletion/kick
            await Guild.findOneAndUpdate(
                { guildId: guild.id },
                { $set: { setupCompleted: false } }
            );
            logger.info(`[Bot] Reset setupCompleted to false for left guild: ${guild.id}`);
        } catch (error) {
            logger.error(`[Bot] Failed to handle guildDelete for ${guild.id}:`, error);
        }
    },
};
