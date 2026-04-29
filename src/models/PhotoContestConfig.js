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
            default: 'La città è alla ricerca di scorci unici. Cattura un momento memorabile e depositalo in questa galleria per partecipare al concorso cittadino.'
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
            { name: 'Natura' }, { name: 'Architettura' }, { name: 'Tramonti' }, 
            { name: 'Cibo' }, { name: 'Minimalismo' }, { name: 'Cyberpunk' }, 
            { name: 'Ritratti' }, { name: 'Animali' }
        ]
    },
    notifications: {
        mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
        channelId: { type: String, default: null }
    }
});

export default mongoose.model('PhotoContestConfig', photoContestConfigSchema);
