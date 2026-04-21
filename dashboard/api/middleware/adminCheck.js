export const adminCheck = (req, res, next) => {
    const isAuth = req.isAuthenticated();
    console.log(`[DEBUG_ADMIN] Request: ${req.method} ${req.url} | Authenticated: ${isAuth}`);

    if (!isAuth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const guildId = req.params.guildId || req.body.guildId;
    console.log(`[DEBUG_ADMIN] GuildID: ${guildId} | User Guilds: ${req.user.guilds?.length || 0}`);

    if (!guildId) return res.status(400).json({ error: 'Guild ID is required' });

    // Discord permission 0x8 is ADMINISTRATOR
    const guild = req.user.guilds.find(g => g.id === guildId);
    
    if (!guild) {
        console.log(`[DEBUG_ADMIN] Guild ${guildId} NOT found in user's guilds list.`);
        return res.status(403).json({ error: 'Forbidden: Admin access required on this guild' });
    }

    if (!(guild.permissions & 0x8)) {
        console.log(`[DEBUG_ADMIN] User has NO ADMIN (0x8) in guild ${guildId}. Perms: ${guild.permissions}`);
        return res.status(403).json({ error: 'Forbidden: Admin access required on this guild' });
    }

    console.log(`[DEBUG_ADMIN] Auth PASSED for guild ${guildId}`);
    next();
};
