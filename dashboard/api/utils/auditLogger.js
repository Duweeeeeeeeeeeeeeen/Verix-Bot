import DashboardAuditLog from '../../../src/models/DashboardAuditLog.js';

/**
 * Creates an entry in the Dashboard Audit Log.
 * @param {import('express').Request} req 
 * @param {string} action - The action identifier (e.g. UPDATE_WHITELIST)
 * @param {object} changes - The validated changes made
 */
export const logAudit = async (req, action, changes) => {
    try {
        await DashboardAuditLog.create({
            guildId: req.params.guildId,
            userId: req.user.id,
            username: req.user.username,
            action,
            changes
        });
    } catch (err) {
        console.error('[AuditLogger] Error:', err);
    }
};
