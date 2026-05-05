import logger from '../../../src/utils/logger.js';

export const superAdminCheck = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const ownerId = process.env.OWNER_ID;
    if (!ownerId) {
        logger.error('[superAdminCheck] OWNER_ID not defined in .env');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (req.user.id !== ownerId) {
        logger.warn(`[superAdminCheck] Unauthorized access attempt by user ${req.user.id}`);
        return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    next();
};
