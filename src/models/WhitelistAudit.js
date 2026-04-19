import mongoose from 'mongoose';

const whitelistAuditSchema = new mongoose.Schema({
    staffId: { type: String, required: true },
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    action: { type: String, enum: ['ACCEPTED', 'REJECTED'], required: true },
    type: { type: String, enum: ['TEXT', 'VOICE'], default: 'TEXT' },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now },
    applicationId: { type: mongoose.Schema.Types.Mixed } // Can be ObjectId or String identifier
});

export default mongoose.model('WhitelistAudit', whitelistAuditSchema);
