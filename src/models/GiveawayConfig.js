import mongoose from 'mongoose';

const giveawayConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    managerRoles: {
        type: [String],
        default: []
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

export default mongoose.model('GiveawayConfig', giveawayConfigSchema);
