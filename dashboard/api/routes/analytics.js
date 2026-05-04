import express from 'express';
import { adminCheck } from '../middleware/adminCheck.js';
import GuildStats from '../../../src/models/GuildStats.js';
import Ticket from '../../../src/models/Ticket.js';
import StaffStats from '../../../src/models/StaffStats.js';
import Infraction from '../../../src/models/Infraction.js';
import Guild from '../../../src/models/Guild.js';

const router = express.Router();

router.get('/:guildId', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = await Guild.findOne({ guildId });

        if (!guild || !guild.isPremium) {
            return res.status(403).json({ success: false, error: 'Analytics PRO richiedono un abbonamento Premium attivo.' });
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // 1. Member Growth (Last 30 days)
        const growth = await GuildStats.find({ 
            guildId, 
            timestamp: { $gte: thirtyDaysAgo } 
        }).sort({ timestamp: 1 });

        // 2. Ticket Stats
        const [totalTickets, ticketsLast7Days, closedTickets] = await Promise.all([
            Ticket.countDocuments({ guildId }),
            Ticket.countDocuments({ guildId, createdAt: { $gte: sevenDaysAgo } }),
            Ticket.countDocuments({ guildId, status: 'CLOSED' })
        ]);

        // 3. Staff Performance
        const staffPerformance = await StaffStats.find({ guildId })
            .sort({ ticketsClosed: -1 })
            .limit(5);

        // 4. Moderation Stats
        const [totalInfractions, activeMutes] = await Promise.all([
            Infraction.countDocuments({ guildId }),
            Infraction.countDocuments({ guildId, type: 'MUTE', active: true })
        ]);

        res.json({
            success: true,
            data: {
                growth: growth.map(s => ({ t: s.timestamp, count: s.memberCount })),
                tickets: {
                    total: totalTickets,
                    new7d: ticketsLast7Days,
                    closed: closedTickets
                },
                staff: staffPerformance.map(s => ({
                    id: s.staffId,
                    closed: s.ticketsClosed,
                    avgResponse: s.averageResponseTimeMs
                })),
                moderation: {
                    total: totalInfractions,
                    activeMutes
                }
            }
        });

    } catch (error) {
        console.error('[Analytics_API] Error:', error);
        res.status(500).json({ success: false, error: 'Errore durante il recupero dei dati analytics.' });
    }
});

export default router;
