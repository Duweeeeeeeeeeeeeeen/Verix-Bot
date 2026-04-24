import mongoose from 'mongoose';

const infractionSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    count: { type: Number, default: 0 },
    lastInfraction: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique index per user per guild
infractionSchema.index({ guildId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Infraction', infractionSchema);
