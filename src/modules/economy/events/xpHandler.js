import { Events } from 'discord.js';
import User from '../../../models/User.js';
import Guild from '../../../models/Guild.js';
import logger from '../../../utils/logger.js';

const xpCooldowns = new Set();

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Check if economy module is enabled for this guild
        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData || !guildData.enabledModules?.includes('economy')) return;

        // XP Cooldown to prevent spam (1 minute)
        if (xpCooldowns.has(message.author.id)) return;

        try {
            const xpToAdd = Math.floor(Math.random() * 11) + 15;
            
            const userData = await User.findOneAndUpdate(
                { discordId: message.author.id },
                { 
                    $inc: { xp: xpToAdd },
                    username: message.author.username
                },
                { upsert: true, new: true }
            );

            // Level up logic
            const nextLevelXp = userData.level * 100 * 1.5;
            if (userData.xp >= nextLevelXp) {
                userData.level += 1;
                userData.xp = 0;
                await userData.save();
                logger.info(`[ECONOMY] ${message.author.username} leveled up to ${userData.level}`);
            }

            xpCooldowns.add(message.author.id);
            setTimeout(() => xpCooldowns.delete(message.author.id), 60000);

        } catch (error) {
            logger.error('Error in economy xpHandler:', error);
        }
    },
};
