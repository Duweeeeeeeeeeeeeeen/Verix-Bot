import mongoose from 'mongoose';

const tempVoiceSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true,
        unique: true
    },
    ownerId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('TempVoice', tempVoiceSchema);
