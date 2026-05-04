import mongoose from 'mongoose';

const privateBotSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String, // Encrypted
        required: true
    },
    clientName: String,
    avatarUrl: String,
    enabled: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'error', 'suspended'],
        default: 'offline'
    },
    lastError: String,
    lastStartedAt: Date
}, { timestamps: true });

export default mongoose.model('PrivateBot', privateBotSchema);
