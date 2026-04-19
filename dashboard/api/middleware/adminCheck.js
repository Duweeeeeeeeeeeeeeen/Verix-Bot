export const adminCheck = (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

    const guildId = req.params.guildId || req.body.guildId;
    console.log(`[DEBUG_ADMIN_CHECK] GuildID found: ${guildId} (Source: ${req.params.guildId ? 'params' : 'body'})`);
    if (!guildId) return res.status(400).json({ error: 'Guild ID is required' });

    // Discord permission 0x8 is ADMINISTRATOR
    const guild = req.user.guilds.find(g => g.id === guildId);
    
    if (!guild || !(guild.permissions & 0x8)) {
        return res.status(403).json({ error: 'Forbidden: Admin access required on this guild' });
    }

    next();
};
