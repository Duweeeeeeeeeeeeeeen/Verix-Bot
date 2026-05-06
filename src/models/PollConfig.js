import mongoose from 'mongoose';

const pollConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    logChannelId: { type: String, default: null },
    defaultColor: { type: String, default: '#5865F2' }
}, { timestamps: true });

export default mongoose.model('PollConfig', pollConfigSchema);
