import express from 'express';
import { adminCheck } from '../middleware/adminCheck.js';
import WhitelistApp from '../../../src/models/WhitelistApp.js';
import Background from '../../../src/models/Background.js';
import WhitelistAudit from '../../../src/models/WhitelistAudit.js';
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
        res.status(500).json({ success: false, error: 'Error while fetching the user list.' });
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
            return res.status(400).json({ success: false, error: 'Invalid user ID.' });
        }

        const [user, whitelistApps, backgrounds, voiceEntries, whitelistAudits] = await Promise.all([
            User.findOne({ discordId: userId }).select('-__v'),
            WhitelistApp.find({ guildId, userId })
                .select('status channelId startTime submittedAt reviewedBy rejectionReason deletionScheduledAt')
                .sort({ startTime: -1 }),
            Background.find({ guildId, userId })
                .select('status channelId link description reviewedBy rejectionReason createdAt submittedAt deletionScheduledAt')
                .sort({ createdAt: -1 }),
            VoiceQueue.find({ guildId, userId }).select('status joinedAt').sort({ joinedAt: -1 }),
            WhitelistAudit.find({ guildId, userId })
                .select('action type reason staffId timestamp applicationId')
                .sort({ timestamp: -1 })
        ]);

        console.log(`[Management_API] Results for ${userId}: WL=${whitelistApps.length}, BG=${backgrounds.length}`);

        const formatRecord = (record, fallbackDateField = 'createdAt') => ({
            _id: record._id,
            status: record.status,
            channelId: record.channelId,
            reviewedBy: record.reviewedBy,
            rejectionReason: record.rejectionReason,
            timestamp: record.submittedAt || record.startTime || record.createdAt || record[fallbackDateField],
            deletionScheduledAt: record.deletionScheduledAt
        });

        const formattedWhitelist = whitelistApps.map(record => formatRecord(record, 'startTime'));
        const formattedBackgrounds = backgrounds.map(record => ({
            ...formatRecord(record, 'createdAt'),
            link: record.link,
            description: record.description
        }));

        const whitelistAuditEvents = whitelistAudits.map(record => ({
            _id: record._id,
            source: 'whitelist',
            type: record.type || 'TEXT',
            action: record.action,
            status: record.action,
            staffId: record.staffId,
            reason: record.reason,
            timestamp: record.timestamp,
            applicationId: record.applicationId
        }));

        const backgroundEvents = formattedBackgrounds
            .filter(record => ['ACCEPTED', 'REJECTED', 'SUBMITTED'].includes(record.status))
            .map(record => ({
                _id: `bg-${record._id}`,
                recordId: record._id,
                source: 'background',
                type: 'BACKGROUND',
                action: record.status,
                status: record.status,
                staffId: record.reviewedBy,
                reason: record.rejectionReason,
                link: record.link,
                description: record.description,
                timestamp: record.timestamp
            }));

        const activity = [...whitelistAuditEvents, ...backgroundEvents]
            .filter(event => event.timestamp)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            data: {
                user: user || { discordId: userId, info: 'Utente non ancora nel database globale' },
                whitelist: {
                    status: formattedWhitelist[0]?.status || null,
                    history: formattedWhitelist
                },
                background: {
                    status: formattedBackgrounds[0]?.status || null,
                    history: formattedBackgrounds
                },
                backgrounds: formattedBackgrounds,
                voice: voiceEntries,
                activity
            }
        });
    } catch (error) {
        console.error('[Management_API] Search Error:', error);
        res.status(500).json({ success: false, error: 'Error while searching records.' });
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
            return res.status(404).json({ success: false, error: 'Record not found or already deleted.' });
        }

        await logAudit(req, `DELETE_RECORD_${type.toUpperCase()}`, { id });

        res.json({ success: true, message: 'Record eliminato con successo.' });
    } catch (error) {
        console.error('[Management_API] Delete Error:', error);
        res.status(500).json({ success: false, error: 'Error while deleting.' });
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
            message: 'User state reset successfully.',
            summary: {
                whitelistDeleted: wlResult.deletedCount,
                backgroundDeleted: bgResult.deletedCount,
                voiceDeleted: vqResult.deletedCount
            }
        });
    } catch (error) {
        console.error('[Management_API] Reset Error:', error);
        res.status(500).json({ success: false, error: 'Error while resetting the user.' });
    }
});

export default router;
