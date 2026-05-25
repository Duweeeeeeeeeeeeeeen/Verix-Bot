import logger from '../../../src/utils/logger.js';
import Guild from '../../../src/models/Guild.js';

/**
 * General check: Allows access if the user is a native Discord Administrator/Manage Server holder
 * OR if the user is registered in the database as a Collaborator for the guild.
 */
export const adminCheck = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const guildId = req.params.guildId || req.body.guildId || req.query.guildId;
    if (!guildId) return res.status(400).json({ error: 'Guild ID is required' });

    try {
        // 1. Quick check: does the user have native Discord admin rights?
        const guild = req.user.guilds?.find(g => g.id === guildId);
        if (guild && ((guild.permissions & 0x8) || (guild.permissions & 0x20))) {
            return next();
        }

        // 2. Fallback check: is the user a database collaborator?
        const dbGuild = await Guild.findOne({ guildId });
        const isCollaborator = dbGuild?.collaborators?.some(c => c.userId === req.user.id);
        if (isCollaborator) {
            return next();
        }

        logger.warn(`[adminCheck] User ${req.user?.id} has no native permissions nor collaborator record on guild ${guildId}`);
        return res.status(403).json({ error: 'Forbidden: Manage Server or Collaborator permission required on this guild' });
    } catch (err) {
        logger.error('[adminCheck] Error during permission verification:', err);
        return res.status(500).json({ error: 'Internal Server Error checking permissions' });
    }
};

/**
 * Strict check: Allows access ONLY if the user has native Discord Administrator/Manage Server rights.
 * Used for billing, adding/removing collaborators, and other owner-only operations.
 */
export const nativeAdminCheck = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const guildId = req.params.guildId || req.body.guildId || req.query.guildId;
    if (!guildId) return res.status(400).json({ error: 'Guild ID is required' });

    const guild = req.user.guilds?.find(g => g.id === guildId);

    if (!guild) {
        logger.warn(`[nativeAdminCheck] Guild ${guildId} not found in user guilds (user: ${req.user?.id})`);
        return res.status(403).json({ error: 'Forbidden: Manage Server permission required on this guild' });
    }

    // Discord permissions: 0x8 = Administrator, 0x20 = Manage Server.
    if (!((guild.permissions & 0x8) || (guild.permissions & 0x20))) {
        logger.warn(`[nativeAdminCheck] User ${req.user?.id} has no MANAGE_GUILD/ADMINISTRATOR on guild ${guildId}`);
        return res.status(403).json({ error: 'Forbidden: Manage Server permission required on this guild' });
    }

    next();
};
