import mongoose from 'mongoose';

const staffStatsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    staffId: { type: String, required: true },
    ticketsClaimed: { type: Number, default: 0 },
    ticketsClosed: { type: Number, default: 0 },
    totalResponseTimeMs: { type: Number, default: 0 }, // For average calculation
    averageResponseTimeMs: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now }
}, { timestamps: true });

staffStatsSchema.index({ guildId: 1, staffId: 1 }, { unique: true });

export default mongoose.model('StaffStats', staffStatsSchema);
