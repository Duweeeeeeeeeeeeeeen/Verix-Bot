import express from 'express';
import passport from 'passport';
import Guild from '../../../src/models/Guild.js';

const router = express.Router();
const FRONTEND_URL = process.env.DASHBOARD_FRONTEND_URL;
console.log(`[AUTH] Frontend URL initialized as: ${FRONTEND_URL}`);

// Discord Login
router.get('/login', passport.authenticate('discord'));

// Discord Callback
router.get('/callback', passport.authenticate('discord', {
    failureRedirect: `${FRONTEND_URL}/login?error=true`,
    successRedirect: `${FRONTEND_URL}/selector`
}));

// Get current user session with augmented guild data
router.get('/user', async (req, res) => {
    if (req.isAuthenticated()) {
        const client = req.discordClient;
        
        if (!client) {
            console.error('[Dashboard_API] Discord client missing in request context!');
            return res.status(500).json({ success: false, error: 'Sistema Discord non inizializzato.' });
        }

        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

        // Check if guilds exist to avoid map errors
        const guilds = req.user.guilds || [];
        
        // Log for transparency
        console.log(`[Dashboard_API] User ${req.user.username} (${req.user.id}) fetching guilds: ${guilds.length} found.`);

        const guildsWithPremium = await Promise.all(guilds.map(async (guild) => {
            const guildSettings = await Guild.findOne({ guildId: guild.id });
            const isPrivateBotActive = guildSettings?.privateBot?.enabled && guildSettings?.privateBot?.token;
            
            return {
                ...guild,
                botInGuild: client.guilds.cache.has(guild.id) || isPrivateBotActive,
                inviteUrl: `${inviteUrl}&guild_id=${guild.id}`,
                isPremium: guildSettings ? !!guildSettings.isPremium : false,
                premiumTier: guildSettings?.premiumTier || (guildSettings?.isPremium ? 'premium' : 'none')
            };
        }));

        const augmentedUser = {
            ...req.user,
            guilds: guildsWithPremium
        };

        res.json(augmentedUser);
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.json({ success: true });
    });
});

export default router;
