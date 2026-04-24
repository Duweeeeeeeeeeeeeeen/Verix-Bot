import mongoose from 'mongoose';

const socialPlatformSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false },
    notificationChannelId: { type: String, default: null },
    roleId: { type: String, default: null },
    mentionEveryone: { type: Boolean, default: false },
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
        isLive: { type: Boolean, default: false }, // Specific to Twitch
        lastCheckAt: { type: Date, default: null }
    }],
    webhookToken: { type: String, default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) }
});

const socialConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    platforms: {
        twitch: { type: socialPlatformSchema, default: () => ({ embed: { color: '#6441a5', title: '📡 {streamer} è in Live!', description: '**{title}**\n\n[Connettiti alla frequenza]({url})' } }) },
        youtube: { type: socialPlatformSchema, default: () => ({ embed: { color: '#ff0000', title: '🎥 Nuovo Video di {streamer}!', description: '**{title}**\n\n[Guarda il video]({url})' } }) },
        instagram: { type: socialPlatformSchema, default: () => ({ embed: { color: '#e1306c', title: '📸 Nuovo Post di {streamer}', description: '**{title}**\n\n[Vedi su Instagram]({url})' } }) },
        tiktok: { type: socialPlatformSchema, default: () => ({ embed: { color: '#000000', title: '🎵 Nuovo TikTok da {streamer}', description: '**{title}**\n\n[Guarda il TikTok]({url})' } }) },
        twitter: { type: socialPlatformSchema, default: () => ({ embed: { color: '#1da1f2', title: '🐦 Nuovo Tweet da {streamer}', description: '{description}\n\n[Vai al Tweet]({url})' } }) }
    }
}, { timestamps: true });

export default mongoose.model('SocialConfig', socialConfigSchema);
