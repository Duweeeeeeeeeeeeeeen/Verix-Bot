import mongoose from 'mongoose';

const tempVoiceConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    creatorChannelId: {
        type: String,
        default: null
    },
    categoryId: {
        type: String,
        default: null
    },
    channelNameTemplate: {
        type: String,
        default: '🔊 {user}'
    },
    defaultUserLimit: {
        type: Number,
        default: 0
    },
    maxConcurrent: { type: Number, default: 50 },
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

export default mongoose.model('TempVoiceConfig', tempVoiceConfigSchema);
