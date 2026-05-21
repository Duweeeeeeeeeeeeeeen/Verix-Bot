import mongoose from 'mongoose';

const photoContestConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    channelId: {
        type: String,
        default: ''
    },
    prizeRoleId: {
        type: String,
        default: ''
    },
    interval: {
        type: Number,
        default: 168 // Default 1 week (in hours)
    },
    duration: {
        type: Number,
        default: 24 // Default 24 hours (in hours)
    },
    embedSettings: {
        title: {
            type: String,
            default: '🖼️ Galleria d\'Arte: Esposizione Fotografica'
        },
        description: {
            type: String,
            default: 'Submit your best photo and let the community vote for the winner.'
        },
        color: {
            type: String,
            default: '#F39C12'
        },
        thumbnail: {
            type: String,
            default: 'https://i.imgur.com/89k5I5L.png' // Updated Camera Icon
        }
    },
    lastWinnerId: {
        type: String,
        default: null
    },
    nextContestAt: {
        type: Date,
        default: null
    },
    hallOfFameChannelId: {
        type: String,
        default: ''
    },
    staffRoleIds: {
        type: [String],
        default: []
    },
    automaticThemes: {
        type: Boolean,
        default: false
    },
    themesList: {
        type: [new mongoose.Schema({
            name: String,
            duration: { type: Number, default: null }
        }, { _id: false })],
        default: [
            { name: 'Nature' }, { name: 'Architecture' }, { name: 'Sunsets' },
            { name: 'Food' }, { name: 'Minimalism' }, { name: 'Gaming' },
            { name: 'Portraits' }, { name: 'Animals' }
        ]
    },
    notifications: {
        mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
        channelId: { type: String, default: null }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    },
    submitLabel: {
        type: String,
        default: 'Submit Photo'
    },
    submitEmoji: {
        type: String,
        default: '📸'
    },
    voteLabel: {
        type: String,
        default: 'Leaderboard'
    },
    voteEmoji: {
        type: String,
        default: '🏆'
    },
    upvoteEmoji: {
        type: String,
        default: '👍'
    },
    downvoteEmoji: {
        type: String,
        default: '👎'
    },
    // Premium features
    multiWinner: {
        type: Boolean,
        default: false
    },
    winnersCount: {
        type: Number,
        default: 1
    }
});

export default mongoose.model('PhotoContestConfig', photoContestConfigSchema);
