import { Events, EmbedBuilder } from 'discord.js';
import ModerationConfig from '../../../models/ModerationConfig.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: Events.MessageDelete,
    async execute(message, client) {
        // Ignore bots and DMs
        if (message.author?.bot || !message.guild) return;

        // Check if message had pings
        const hasPings = (message.mentions?.users?.size > 0 || message.mentions?.roles?.size > 0 || message.mentions?.everyone);
        if (!hasPings) return;

        const guildId = message.guild.id;
        const config = await ModerationConfig.findOne({ guildId });
        
        if (!config || !config.enabled || !config.ghostPing?.enabled) return;

        // Ignore if user is administrator or has ignored roles
        const member = message.member;
        if (member) {
            if (member.permissions.has('Administrator')) return;
            if (config.ignoredRoles?.some(roleId => member.roles.cache.has(roleId))) return;
        }

        // Send notification using MessageService
        try {
            const logChannelId = config.ghostPing.logInChannel ? config.logChannelId : null;
            if (logChannelId) {
                const channel = await message.guild.channels.fetch(logChannelId).catch(() => null);
                if (channel) {
                    const embed = await messageService.get(message.guildId, 'moderation', 'ghost_ping', {
                        user: message.author.tag,
                        channel: message.channel.toString(),
                        content: message.content || '[No Content]'
                    });
                    await channel.send({ embeds: [embed] }).catch(() => null);
                }
            }
        } catch (error) {
            logger.error('[Moderation] Error logging ghost ping:', error);
        }
    }
};
