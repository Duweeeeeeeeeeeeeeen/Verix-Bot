import { Events, EmbedBuilder } from 'discord.js';
import ModerationConfig from '../../../models/ModerationConfig.js';
import logger from '../../../utils/logger.js';

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

        // Send log if configured
        if (config.ghostPing.logInChannel && config.logChannelId) {
            try {
                const logChannel = await message.guild.channels.fetch(config.logChannelId).catch(() => null);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('👻 Ghost Ping Rilevato')
                        .setDescription(`Un messaggio contenente menzioni è stato eliminato.`)
                        .addFields(
                            { name: '👤 Autore', value: `${message.author} (${message.author.id})`, inline: true },
                            { name: '📍 Canale', value: `${message.channel}`, inline: true },
                            { name: '💬 Contenuto', value: message.content || '_Contenuto non disponibile (non in cache)_' }
                        )
                        .setColor('#ff4757')
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });
                }
            } catch (error) {
                logger.error('[Moderation] Error logging ghost ping:', error);
            }
        }
    }
};
