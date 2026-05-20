import mongoose from 'mongoose';

const socialPlatformSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false },
    notificationChannelId: { type: String, default: null },
    roleId: { type: String, default: null }, // Role to mention
    liveRoleId: { type: String, default: null }, // Role to give when live
    mentionEveryone: { type: Boolean, default: false },
    pingMessage: { type: String, default: '{role} **{username}** è live!' },
    embed: {
        title: { type: String, default: 'Nuovo contenuto!' },
        description: { type: String, default: '**{title}**\n\n[Guarda ora]({url})' },
        color: { type: String, default: '#ffffff' },
        thumbnail: { type: String, default: '' },
        image: { type: String, default: '' },
        footer: { type: String, default: 'Social Notifications | Verix' }
    },
    accounts: [{
        username: { type: String, required: true }, // The username or ID of the channel/account
        discordUserId: { type: String, default: null }, // Linked Discord user (mostly used for Twitch roles)
        lastPostId: { type: String, default: null }, // Last video/stream/post ID to avoid duplicates
        seenPostIds: { type: [String], default: [] }, // Array of notified post IDs to prevent duplicates/spam
        resolvedId: { type: String, default: null }, // Persisted resolved ID (e.g. UC...)
        cachedProfileImage: { type: String, default: null },
        isLive: { type: Boolean, default: false }, // Specific to Twitch
        lastCheckAt: { type: Date, default: null },
        bridgeErrorCount: { type: Number, default: 0 },
        lastBridgeErrorAt: { type: Date, default: null },
        bridgeBackoffUntil: { type: Date, default: null }
    }],
    webhookToken: { type: String, default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) }
});

const socialConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    platforms: {
        twitch: { type: socialPlatformSchema, default: () => ({ embed: { color: '#6441a5', title: '📡 {streamer} è in diretta!', description: '### {title}\n\nEhi! **{streamer}** ha appena acceso la camera su Twitch. Non perderti lo show!\n\n[Entra in Live]({url})' } }) },
        youtube: { type: socialPlatformSchema, default: () => ({ embed: { color: '#ff0000', title: '🎥 Nuovo video di {streamer}!', description: '### {title}\n\nÈ appena uscito un nuovo video sul canale! Corri a lasciare un like.' } }) },
        instagram: { type: socialPlatformSchema, default: () => ({ embed: { color: '#e1306c', title: '📸 Nuovo post di {streamer}', description: '### {title}\n\nNuovo contenuto caricato su Instagram! Passa a dare un\'occhiata.' } }) },
        tiktok: { type: socialPlatformSchema, default: () => ({ embed: { color: '#000000', title: '🎵 Nuovo TikTok di {streamer}', description: '### {title}\n\nÈ appena stato pubblicato un nuovo video su TikTok! Guarda subito.' } }) },
        twitter: { type: socialPlatformSchema, default: () => ({ embed: { color: '#1da1f2', title: '🐦 Nuovo Tweet di {streamer}', description: '{description}' } }) },
        reddit: { type: socialPlatformSchema, default: () => ({ embed: { color: '#ff4500', title: '👾 Nuovo Post su r/{username}!', description: '### {title}\n\n**{author}** ha pubblicato un nuovo contenuto su **r/{username}**!\n\n{description}' } }) },
        steam: { type: socialPlatformSchema, default: () => ({ embed: { color: '#1b2838', title: '🎮 Nuovo Annuncio per {username}!', description: '### {title}\n\n**{username}** ha rilasciato un nuovo annuncio/aggiornamento!\n\n{description}' } }) },
        kick: { type: socialPlatformSchema, default: () => ({ embed: { color: '#53fc18', title: '🟢 **{streamer}** is live on Kick!', description: '### {title}\n\nWatch the stream now on Kick.' } }) },
        github: { type: socialPlatformSchema, default: () => ({ embed: { color: '#24292f', title: '🐙 New GitHub update for **{username}**', description: '### {title}\n\n{description}' } }) },
        rss: { type: socialPlatformSchema, default: () => ({ embed: { color: '#f97316', title: '📰 New update from **{username}**', description: '### {title}\n\n{description}' } }) },
        telegram: { type: socialPlatformSchema, default: () => ({ embed: { color: '#26a5e4', title: '✈️ New Telegram post from **{username}**', description: '### {title}\n\n{description}' } }) }
    },
    colors: {
        primary: { type: String, default: '#5865F2' },
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    }
}, { timestamps: true });

export default mongoose.model('SocialConfig', socialConfigSchema);
