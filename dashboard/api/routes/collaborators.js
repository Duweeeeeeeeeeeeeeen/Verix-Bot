import express from 'express';
import { nativeAdminCheck } from '../middleware/adminCheck.js';
import Guild from '../../../src/models/Guild.js';
import logger from '../../../src/utils/logger.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// Helper to get limit based on premium tier
const getCollaboratorLimit = (tier) => {
    switch (tier) {
        case 'platinum': return 5;
        case 'premium': return 3;
        case 'lite': return 2;
        default: return 1; // Free tier
    }
};

/**
 * GET /api/collaborators/:guildId
 * Get a list of all collaborators in a guild
 */
router.get('/:guildId', nativeAdminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guildSettings = await Guild.findOne({ guildId });

        if (!guildSettings) {
            return res.json({ success: true, collaborators: [], limit: 1 });
        }

        const limit = getCollaboratorLimit(guildSettings.premiumTier);
        res.json({
            success: true,
            collaborators: guildSettings.collaborators || [],
            limit
        });
    } catch (error) {
        logger.error('[Collaborators_API] Error fetching collaborators:', error);
        res.status(500).json({ success: false, error: 'Error while fetching collaborators.' });
    }
});

/**
 * POST /api/collaborators/:guildId
 * Add a new collaborator to the guild
 */
router.post('/:guildId', nativeAdminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { userId } = req.body;

        if (!userId || !/^\d{17,19}$/.test(userId)) {
            return res.status(400).json({ success: false, error: 'ID Discord non valido. Deve essere numerico di 17-19 cifre.' });
        }

        if (userId === req.user.id) {
            return res.status(400).json({ success: false, error: 'Non puoi aggiungere te stesso come collaboratore!' });
        }

        // 1. Fetch guild configurations
        let guildSettings = await Guild.findOne({ guildId });
        if (!guildSettings) {
            // Create a default guild settings if not exists
            guildSettings = new Guild({ guildId, guildName: 'Guild' });
        }

        // 2. Validate premium limit
        const limit = getCollaboratorLimit(guildSettings.premiumTier);
        const currentCount = guildSettings.collaborators?.length || 0;

        if (currentCount >= limit) {
            return res.status(400).json({
                success: false,
                error: `Limite raggiunto. Il piano attuale (${guildSettings.premiumTier.toUpperCase()}) permette al massimo ${limit} collaboratori.`
            });
        }

        // 3. Check if user is already a collaborator
        const exists = guildSettings.collaborators?.some(c => c.userId === userId);
        if (exists) {
            return res.status(400).json({ success: false, error: 'This user is already a collaborator.' });
        }

        // 4. Fetch username using Discord client to ensure user validity
        let username = 'Collaboratore';
        try {
            if (req.discordClient) {
                const userObj = await req.discordClient.users.fetch(userId);
                username = userObj.username;
            }
        } catch (discordErr) {
            logger.warn(`[Collaborators_API] Failed to fetch user profile for ID ${userId}:`, discordErr.message);
            return res.status(404).json({ success: false, error: 'Discord member not found. Make sure the ID is correct.' });
        }

        // 5. Add to database
        guildSettings.collaborators.push({ userId, username, addedAt: new Date() });
        await guildSettings.save();

        await logAudit(req, 'ADD_COLLABORATOR', { userId, username });

        res.json({
            success: true,
            message: 'Collaboratore aggiunto con successo!',
            collaborators: guildSettings.collaborators
        });
    } catch (error) {
        logger.error('[Collaborators_API] Add Collaborator Error:', error);
        res.status(500).json({ success: false, error: 'Error while adding the collaborator.' });
    }
});

/**
 * DELETE /api/collaborators/:guildId/:userId
 * Remove a collaborator from the guild
 */
router.delete('/:guildId/:userId', nativeAdminCheck, async (req, res) => {
    try {
        const { guildId, userId } = req.params;

        const guildSettings = await Guild.findOne({ guildId });
        if (!guildSettings) {
            return res.status(404).json({ success: false, error: 'Server settings not found.' });
        }

        // Find and remove collaborator
        const initialLength = guildSettings.collaborators?.length || 0;
        guildSettings.collaborators = guildSettings.collaborators.filter(c => c.userId !== userId);

        if (guildSettings.collaborators.length === initialLength) {
            return res.status(404).json({ success: false, error: 'Collaborator not found.' });
        }

        await guildSettings.save();

        await logAudit(req, 'REMOVE_COLLABORATOR', { userId });

        res.json({
            success: true,
            message: 'Collaboratore rimosso con successo!',
            collaborators: guildSettings.collaborators
        });
    } catch (error) {
        logger.error('[Collaborators_API] Remove Collaborator Error:', error);
        res.status(500).json({ success: false, error: 'Error while removing del collaboratore.' });
    }
});

export default router;
