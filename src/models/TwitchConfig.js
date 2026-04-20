import mongoose from 'mongoose';

const twitchConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    notificationChannelId: { type: String, default: null },
    streamingRoleId: { type: String, default: null },
    mentionEveryone: { type: Boolean, default: false },
    
    // Custom Embed Settings
    embed: {
        title: { type: String, default: '📡 Segnale in Entrata: {streamer} è in Live!' },
        description: { type: String, default: '**{title}**\n\nLa rete locale sta catturando delle immagini da: **{game}**.\n\n[Connettiti alla frequenza]({url})' },
        color: { type: String, default: '#6441a5' }, // Twitch Purple
        thumbnail: { type: String, default: '' },
        image: { type: String, default: '' }, // Dynamic preview
        footer: { type: String, default: 'Notifiche Broadcast Automatiche | Verix RP' }
    },

    // List of streamers for this guild
    streamers: [{
        twitchUsername: { type: String, required: true },
        discordUserId: { type: String, default: null }, // Linked Discord user for auto-role
        lastStreamId: { type: String, default: null },
        isLive: { type: Boolean, default: false },
        lastNotifyAt: { type: Date, default: null }
    }]
}, { timestamps: true });

export default mongoose.model('TwitchConfig', twitchConfigSchema);
