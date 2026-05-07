
export const ownerCheck = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // You can add multiple owner IDs here
    const ownerIds = [process.env.BOT_OWNER_ID, '361159834688552960', '314417452395626496'].filter(Boolean); // User ID provided in previous context or from env

    if (!ownerIds.includes(req.user.id)) {
        return res.status(403).json({ error: 'Forbidden: Bot Owner access required.' });
    }

    next();
};
