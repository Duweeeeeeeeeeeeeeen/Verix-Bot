import { Events } from 'discord.js';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';

const xpCooldowns = new Set();

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // XP Cooldown to prevent spam (1 minute)
        if (xpCooldowns.has(message.author.id)) return;

        try {
            const xpToAdd = Math.floor(Math.random() * 11) + 15; // 15-25 XP
            
            const userData = await User.findOneAndUpdate(
                { discordId: message.author.id },
                { 
                    $inc: { xp: xpToAdd },
                    username: message.author.username
                },
                { upsert: true, returnDocument: 'after' }
            );

            // Level up logic
            const nextLevelXp = userData.level * 100 * 1.5;
            if (userData.xp >= nextLevelXp) {
                userData.level += 1;
                userData.xp = 0;
                await userData.save();
                
                // Optional: Send level up message
                // message.reply(`Congratulazioni ${message.author}! Sei salito al livello **${userData.level}**!`);
                logger.info(`${message.author.username} leveled up to ${userData.level}`);
            }

            // Set cooldown
            xpCooldowns.add(message.author.id);
            setTimeout(() => xpCooldowns.delete(message.author.id), 60000);

        } catch (error) {
            logger.error('Error in messageCreate XP system:', error);
        }
    },
};
