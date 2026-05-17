import express from 'express';
import { adminCheck } from '../middleware/adminCheck.js';
import GuildStats from '../../../src/models/GuildStats.js';
import Ticket from '../../../src/models/Ticket.js';
import StaffStats from '../../../src/models/StaffStats.js';
import Infraction from '../../../src/models/Infraction.js';
import Guild from '../../../src/models/Guild.js';
import WhitelistAudit from '../../../src/models/WhitelistAudit.js';
import DashboardAuditLog from '../../../src/models/DashboardAuditLog.js';
import UserExperience from '../../../src/models/UserExperience.js';

const router = express.Router();

router.get('/:guildId', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = await Guild.findOne({ guildId });
        // Allow basic access for all, but gate advanced data
        const isPremium = guild?.isPremium === true || ['premium', 'platinum'].includes(guild?.premiumTier);


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

        // 5. Activity Heatmap (Last 30 days) - Staff Productivity
        const [ticketTimeline, infractionTimeline, wlTimeline, auditTimeline] = await Promise.all([
            Ticket.find({ guildId, openedAt: { $gte: thirtyDaysAgo } }).select('openedAt'),
            Infraction.find({ guildId, createdAt: { $gte: thirtyDaysAgo } }).select('createdAt'),
            WhitelistAudit.find({ guildId, timestamp: { $gte: thirtyDaysAgo } }).select('timestamp'),
            DashboardAuditLog.find({ guildId, timestamp: { $gte: thirtyDaysAgo } }).select('timestamp')
        ]);

        // 7 days x 24 hours
        const heatmap = Array.from({ length: 7 }, () => new Array(24).fill(0));
        
        [...ticketTimeline.map(t => t.openedAt), 
         ...infractionTimeline.map(i => i.createdAt), 
         ...wlTimeline.map(w => w.timestamp), 
         ...auditTimeline.map(a => a.timestamp)
        ].forEach(date => {
            if (!date) return;
            const d = new Date(date);
            const day = d.getDay(); // 0 (Sun) - 6 (Sat)
            const hour = d.getHours();
            heatmap[day][hour]++;
        });

        // 6. Leveling Real-time Stats
        const currentExpAgg = await UserExperience.aggregate([
            { $match: { guildId } },
            { 
                $group: { 
                    _id: null, 
                    totalXp: { $sum: "$xp" }, 
                    totalMessages: { $sum: "$totalMessages" },
                    userCount: { $sum: 1 }
                } 
            }
        ]);
        const currentTotalXp = currentExpAgg[0]?.totalXp || 0;
        const currentTotalMessages = currentExpAgg[0]?.totalMessages || 0;
        const currentXpUsers = currentExpAgg[0]?.userCount || 0;

        if (!isPremium) {
            return res.json({
                success: true,
                isPro: false,
                data: {
                    tickets: { total: totalTickets },
                    moderation: { total: totalInfractions }
                }
            });
        }

        res.json({
            success: true,
            isPro: true,
            data: {
                growth: growth.map(s => ({ 
                    t: s.timestamp, 
                    count: s.memberCount,
                    totalXp: s.totalXp || 0,
                    totalMessages: s.totalMessages || 0
                })),
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
                },
                leveling: {
                    totalXp: currentTotalXp,
                    totalMessages: currentTotalMessages,
                    activeUsers: currentXpUsers
                },
                heatmap
            }
        });

    } catch (error) {
        console.error('[Analytics_API] Error:', error);
        res.status(500).json({ success: false, error: 'Errore durante il recupero dei dati analytics.' });
    }
});

export default router;
