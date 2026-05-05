import express from 'express';
import { superAdminCheck } from '../middleware/superAdminCheck.js';
import Guild from '../../../src/models/Guild.js';
import PrivateBot from '../../../src/models/PrivateBot.js';
import Ticket from '../../../src/models/Ticket.js';
import logger from '../../../src/utils/logger.js';

const router = express.Router();

// Get Global Stats (Super Admin Only)
router.get('/stats', superAdminCheck, async (req, res) => {
    try {
        const [
            totalGuilds,
            premiumGuilds,
            platinumGuilds,
            totalTickets,
            activePrivateBots,
            recentGuilds
        ] = await Promise.all([
            Guild.countDocuments(),
            Guild.countDocuments({ premiumTier: 'premium' }),
            Guild.countDocuments({ premiumTier: 'platinum' }),
            Ticket.countDocuments(),
            PrivateBot.countDocuments({ enabled: true }),
            Guild.find().sort({ joinedAt: -1 }).limit(10).select('guildName guildId joinedAt premiumTier')
        ]);

        res.json({
            success: true,
            data: {
                counts: {
                    guilds: totalGuilds,
                    premium: premiumGuilds,
                    platinum: platinumGuilds,
                    tickets: totalTickets,
                    privateBots: activePrivateBots
                },
                recentGuilds
            }
        });
    } catch (error) {
        logger.error('[AdminAPI] Stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch global stats' });
    }
});

export default router;
