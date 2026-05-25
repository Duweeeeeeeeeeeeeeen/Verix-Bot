import mongoose from 'mongoose';

const pollConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    logChannelId: { type: String, default: null },
    defaultColor: { type: String, default: '#5865F2' },
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

pollConfigSchema.index({ enabled: 1 });

export default mongoose.model('PollConfig', pollConfigSchema);
