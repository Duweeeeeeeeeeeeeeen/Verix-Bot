import mongoose from 'mongoose';

const autoClearSlotSchema = new mongoose.Schema({
    id: { type: String, required: true },
    channelId: { type: String, required: true },
    intervalMinutes: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 1, max: 100, default: 100 },
    enabled: { type: Boolean, default: true },
    lastClearedAt: { type: Date, default: null }
}, { _id: false });

const autoMessageSlotSchema = new mongoose.Schema({
    id: { type: String, required: true },
    channelId: { type: String, required: true },
    content: { type: String, default: '' },
    useEmbed: { type: Boolean, default: false },
    embed: { type: Object, default: null },
    triggerType: { type: String, enum: ['TIME', 'MESSAGES', 'ONCE'], default: 'TIME' },
    triggerValue: { type: Number, required: true, min: 1 },
    scheduledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    enabled: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date, default: null },
    messageCountSinceLast: { type: Number, default: 0 },
    ignoredChannels: { type: [String], default: [] },
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
}, { _id: false });

const automationConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    autoClear: {
        enabled: { type: Boolean, default: true },
        slots: [autoClearSlotSchema]
    },
    autoMessage: {
        enabled: { type: Boolean, default: true },
        slots: [autoMessageSlotSchema]
    }
}, { timestamps: true });

const AutomationConfig = mongoose.models.AutomationConfig || mongoose.model('AutomationConfig', automationConfigSchema);

export default AutomationConfig;
