import { Events } from 'discord.js';
import Guild from '../../models/Guild.js';
import logger from '../../utils/logger.js';
import multiBotManager from '../../core/multiBotManager.js';

export default {
    name: Events.GuildCreate,
    async execute(guild, client) {
        if (!guild) return;
        if (!multiBotManager.shouldHandle(guild.id, client)) return;

        logger.info(`[Bot] Joined new guild: ${guild.name} (${guild.id})`);

        try {
            // Find or create guild config, and force setupCompleted to false
            const guildData = await Guild.findOneAndUpdate(
                { guildId: guild.id },
                { $set: { setupCompleted: false } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            
            logger.success(`[Bot] Reset setupCompleted to false for guild: ${guild.name} to trigger dashboard onboarding.`);
        } catch (error) {
            logger.error(`[Bot] Failed to handle guildCreate for ${guild.id}:`, error);
        }
    },
};
