import express from 'express';
import { adminCheck } from '../middleware/adminCheck.js';
import WhitelistApp from '../../../src/models/WhitelistApp.js';
import Background from '../../../src/models/Background.js';
import User from '../../../src/models/User.js';
import VoiceQueue from '../../../src/models/VoiceQueue.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

/**
 * GET /api/management/:guildId/users
 * Returns a list of all users who have interacted with the guild (Whitelist/Background).
 */
router.get('/:guildId/users', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;

        // 1. Get all unique userIds from WhitelistApp and Background in this guild
        const [wlUsers, bgUsers] = await Promise.all([
            WhitelistApp.distinct('userId', { guildId }),
            Background.distinct('userId', { guildId })
        ]);

        // Merge and unique
        const allUserIds = [...new Set([...wlUsers, ...bgUsers])];

        // 2. Fetch User profiles
        const users = await User.find({ discordId: { $in: allUserIds } })
            .select('discordId username lastWhitelistAttempt lastBackgroundAttempt')
            .sort({ username: 1 });

        // Map to include a lastActivity field for easy sorting/display
        const formattedUsers = users.map(u => ({
            discordId: u.discordId,
            username: u.username || 'Utente Sconosciuto',
            lastActivity: u.lastWhitelistAttempt > u.lastBackgroundAttempt ? u.lastWhitelistAttempt : u.lastBackgroundAttempt
        }));

        res.json({ success: true, data: formattedUsers });
    } catch (error) {
        console.error('[Management_API] Users List Error:', error);
        res.status(500).json({ success: false, error: 'Errore nel recupero della lista utenti.' });
    }
});

/**
 * GET /api/management/:guildId/search/:userId
 * Searches for all records related to a Discord User in a specific guild.
 */
router.get('/:guildId/search/:userId', adminCheck, async (req, res) => {
    try {
        const { guildId, userId } = req.params;
        console.log(`[Management_API] Searching Guild: ${guildId}, User: ${userId}`);

        if (!userId || userId.length < 15) {
            return res.status(400).json({ success: false, error: 'ID Utente non valido.' });
        }

        // Fetch everything in parallel
        const [user, whitelistApps, backgrounds, voiceEntries] = await Promise.all([
            User.findOne({ discordId: userId }),
            WhitelistApp.find({ guildId, userId }).sort({ createdAt: -1 }),
            Background.find({ guildId, userId }).sort({ createdAt: -1 }),
            VoiceQueue.find({ guildId, userId }).sort({ joinedAt: -1 })
        ]);

        console.log(`[Management_API] Results for ${userId}: WL=${whitelistApps.length}, BG=${backgrounds.length}`);

        res.json({
            success: true,
            data: {
                user: user || { discordId: userId, info: 'Utente non ancora nel database globale' },
                whitelist: whitelistApps,
                backgrounds: backgrounds,
                voice: voiceEntries
            }
        });
    } catch (error) {
        console.error('[Management_API] Search Error:', error);
        res.status(500).json({ success: false, error: 'Errore durante la ricerca dei record.' });
    }
});

/**
 * DELETE /api/management/:guildId/records/:type/:id
 * Deletes a specific record by type and ID.
 */
router.delete('/:guildId/records/:type/:id', adminCheck, async (req, res) => {
    try {
        const { type, id } = req.params;
        let result;

        switch (type.toLowerCase()) {
            case 'whitelist':
                result = await WhitelistApp.findByIdAndDelete(id);
                break;
            case 'background':
                result = await Background.findByIdAndDelete(id);
                break;
            case 'voice':
                result = await VoiceQueue.findByIdAndDelete(id);
                break;
            default:
                return res.status(400).json({ success: false, error: 'Tipo di record non valido.' });
        }

        if (!result) {
            return res.status(404).json({ success: false, error: 'Record non trovato o già eliminato.' });
        }

        await logAudit(req, `DELETE_RECORD_${type.toUpperCase()}`, { id });

        res.json({ success: true, message: 'Record eliminato con successo.' });
    } catch (error) {
        console.error('[Management_API] Delete Error:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'eliminazione.' });
    }
});

/**
 * POST /api/management/:guildId/reset-user/:userId
 * Resets all citizen status for a user (Deletes all records and clears cooldowns).
 */
router.post('/:guildId/reset-user/:userId', adminCheck, async (req, res) => {
    try {
        const { guildId, userId } = req.params;

        // Bulk delete applications
        const [wlResult, bgResult, vqResult] = await Promise.all([
            WhitelistApp.deleteMany({ guildId, userId }),
            Background.deleteMany({ guildId, userId }),
            VoiceQueue.deleteMany({ guildId, userId })
        ]);

        // Clear cooldowns in User model
        await User.updateOne(
            { discordId: userId },
            { 
                $set: { 
                    lastWhitelistAttempt: null,
                    lastBackgroundAttempt: null
                } 
            }
        );

        await logAudit(req, 'RESET_USER_RECORDS', { userId });

        res.json({
            success: true,
            message: 'Stato utente resettato con successo.',
            summary: {
                whitelistDeleted: wlResult.deletedCount,
                backgroundDeleted: bgResult.deletedCount,
                voiceDeleted: vqResult.deletedCount
            }
        });
    } catch (error) {
        console.error('[Management_API] Reset Error:', error);
        res.status(500).json({ success: false, error: 'Errore durante il reset dell\'utente.' });
    }
});

export default router;
