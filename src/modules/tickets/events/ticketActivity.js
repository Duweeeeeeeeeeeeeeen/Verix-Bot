import { Events } from 'discord.js';
import Ticket from '../../../models/Ticket.js';
import TicketConfig from '../../../models/TicketConfig.js';
import { updateLastActivity } from '../utils/ticketHelper.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        // Check if message is in a ticket channel
        const ticket = await Ticket.findOne({ channelId: message.channel.id, status: { $ne: 'CLOSED' } });
        if (!ticket) return;

        await updateLastActivity(message.channel.id).catch(() => {});

        // --- 1. First Response tracking (SLA) ---
        if (!ticket.firstResponseAt) {
            const config = await TicketConfig.findOne({ guildId: message.guild.id });
            const member = await message.guild.members.fetch(message.author.id);
            
            // If the sender is staff
            if (config?.staffRoleIds?.some(roleId => member.roles.cache.has(roleId))) {
                const now = new Date();
                const diffMs = now.getTime() - new Date(ticket.openedAt).getTime();
                
                ticket.firstResponseAt = now;
                ticket.responseTimeMs = diffMs;
                await ticket.save();

                const mins = Math.floor(diffMs / 60000);
                const secs = Math.floor((diffMs % 60000) / 1000);
                
                await message.channel.send({ 
                    content: `⏱️ **SLA Tracked:** Prima risposta registrata in \`${mins}m ${secs}s\`.` 
                }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            }
        }
    },
};
