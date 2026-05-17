import mongoose from 'mongoose';

const guildStatsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    memberCount: { type: Number, required: true },
    onlineCount: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 }
});

guildStatsSchema.index({ guildId: 1, timestamp: -1 });

export default mongoose.model('GuildStats', guildStatsSchema);
