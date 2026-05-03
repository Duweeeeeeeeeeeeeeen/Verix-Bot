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
    content: { type: String, required: true },
    triggerType: { type: String, enum: ['TIME', 'MESSAGES'], default: 'TIME' },
    triggerValue: { type: Number, required: true, min: 1 },
    enabled: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date, default: null },
    messageCountSinceLast: { type: Number, default: 0 }
}, { _id: false });

const automationConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
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
