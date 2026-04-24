import logger from '../../../src/utils/logger.js';

export const adminCheck = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const guildId = req.params.guildId || req.body.guildId;
    if (!guildId) return res.status(400).json({ error: 'Guild ID is required' });

    const guild = req.user.guilds?.find(g => g.id === guildId);

    if (!guild) {
        logger.warn(`[adminCheck] Guild ${guildId} not found in user guilds (user: ${req.user?.id})`);
        return res.status(403).json({ error: 'Forbidden: Admin access required on this guild' });
    }

    // Discord permission 0x8 = ADMINISTRATOR
    if (!(guild.permissions & 0x8)) {
        logger.warn(`[adminCheck] User ${req.user?.id} has no ADMINISTRATOR on guild ${guildId}`);
        return res.status(403).json({ error: 'Forbidden: Admin access required on this guild' });
    }

    next();
};
