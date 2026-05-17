import { Events } from 'discord.js';
import User from '../../models/User.js';
import Guild from '../../models/Guild.js';
import logger from '../../utils/logger.js';


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

        // --- 2. XP SYSTEM (Leveling & Rewards) ---
        try {
            const { handleMessageXp } = await import('../../handlers/levelingHandler.js');
            await handleMessageXp(message);
        } catch (error) {
            logger.error('Error in messageCreate Leveling system:', error);
        }
    },
};
