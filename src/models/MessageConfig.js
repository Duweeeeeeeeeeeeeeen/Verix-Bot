import mongoose from 'mongoose';

const embedSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    color: { type: String, default: '#5865F2' },
    footer: { type: String, default: '' },
    image: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    timestamp: { type: Boolean, default: true }
}, { _id: false });

const messageConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true }, // 'whitelist', 'tickets', 'verify', 'system'
    messages: {
        type: Map,
        of: embedSchema,
        default: {}
    }
}, { timestamps: true });

// Compound index for fast lookup
messageConfigSchema.index({ guildId: 1, module: 1 }, { unique: true });

export default mongoose.model('MessageConfig', messageConfigSchema);
