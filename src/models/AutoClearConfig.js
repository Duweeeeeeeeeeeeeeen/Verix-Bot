import mongoose from 'mongoose';

const autoClearSlotSchema = new mongoose.Schema({
    id: { type: String, required: true },
    channelId: { type: String, required: true },
    intervalMinutes: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 1, max: 100 },
    enabled: { type: Boolean, default: true },
    lastClearedAt: { type: Date, default: null },
    ignoredRoles: { type: [String], default: [] },
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
}, { _id: false, timestamps: true });

const autoClearConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    slots: [autoClearSlotSchema]
}, { timestamps: true });

const AutoClearConfig = mongoose.models.AutoClearConfig || mongoose.model('AutoClearConfig', autoClearConfigSchema);

export default AutoClearConfig;
