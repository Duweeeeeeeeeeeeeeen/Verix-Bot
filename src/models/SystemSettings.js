import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'global' },
    trackingChannelId: { type: String, default: null },
    trackingEnabled: { type: Boolean, default: false },
    lastStatusMessageId: { type: String, default: null },
    trackingInterval: { type: Number, default: 60 } // in seconds
}, { timestamps: true });

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);
