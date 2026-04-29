import { Events } from 'discord.js';
import Ticket from '../../../models/Ticket.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        // Try to find if this channel is a ticket channel
        // We use a small optimization: check if channel name contains 'ticket' or 'pratica' or 'closed'
        // or just query the DB. Since this runs on every message, we should be careful.
        // However, with indexing on channelId, it's fast.
        
        const ticket = await Ticket.findOne({ channelId: message.channel.id });
        if (ticket && ticket.status !== 'CLOSED') {
            ticket.lastActivityAt = new Date();
            
            // If it's the first response from staff, record it
            if (!ticket.firstResponseAt && message.member.roles.cache.some(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('moderatore'))) {
                ticket.firstResponseAt = new Date();
                ticket.responseTimeMs = ticket.firstResponseAt.getTime() - ticket.openedAt.getTime();
            }
            
            await ticket.save();
        }
    },
};
