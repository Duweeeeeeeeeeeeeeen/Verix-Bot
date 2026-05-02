import mongoose from 'mongoose';

const SystemBroadcastSchema = new mongoose.Schema({
    title: { type: String, required: true },
    version: { type: String, required: true },
    description: { type: String, required: true },
    changes: { type: [String], default: [] },
    type: { type: String, enum: ['standard', 'emergency'], default: 'standard' },
    sentBy: { type: String, required: true }, // User ID
    sentAt: { type: Date, default: Date.now },
    stats: {
        success: { type: Number, default: 0 },
        failed: { type: Number, default: 0 }
    }
});

export default mongoose.models.SystemBroadcast || mongoose.model('SystemBroadcast', SystemBroadcastSchema);
