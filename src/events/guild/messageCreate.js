import { Events } from 'discord.js';
import User from '../../models/User.js';
import Guild from '../../models/Guild.js';
import logger from '../../utils/logger.js';

const xpCooldowns = new Set();

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // --- 1. COMMAND HANDLER (Legacy Prefix Support) ---
        try {
            const guildData = await Guild.findOne({ guildId: message.guild.id });
            const prefix = guildData?.prefix || '!';

            if (message.content.startsWith(prefix)) {
                const args = message.content.slice(prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();

                const command = message.client.commands.get(commandName);
                if (command) {
                    logger.cmd(`[Prefix] ${message.author.tag} executed ${commandName} in ${message.guild.name}`);
                    
                    // Create a pseudo-interaction to reuse slash command logic if possible
                    // Or just handle the help command specifically for now as it's the most requested
                    if (commandName === 'help') {
                        return command.execute({
                            guild: message.guild,
                            client: message.client,
                            user: message.author,
                            reply: (opt) => message.reply(opt),
                            // Basic mock for other interaction properties
                            replied: false,
                            deferred: false,
                            isRepliable: () => true,
                            displayAvatarURL: () => message.author.displayAvatarURL(),
                            member: message.member,
                            createdAt: message.createdAt
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Error in messageCreate command handler:', error);
        }

        // --- 2. XP SYSTEM ---
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
