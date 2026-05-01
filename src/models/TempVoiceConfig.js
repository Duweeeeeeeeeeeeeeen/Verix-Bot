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
    }
}, { timestamps: true });

export default mongoose.model('TempVoiceConfig', tempVoiceConfigSchema);
