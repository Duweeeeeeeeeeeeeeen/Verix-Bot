import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
    emoji: { type: String, required: true },
    label: { type: String, required: true },
    votes: { type: [String], default: [] } // Array of User IDs
});

const pollSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, unique: true, sparse: true },
    question: { type: String, required: true },
    options: [pollOptionSchema],
    endTime: { type: Date, required: true },
    mode: { type: String, enum: ['SINGLE', 'MULTIPLE'], default: 'SINGLE' },
    status: { type: String, enum: ['ACTIVE', 'ENDED'], default: 'ACTIVE' },
    creatorId: { type: String, required: true },
    color: { type: String, default: '#5865F2' }
}, { timestamps: true });

pollSchema.index({ status: 1, endTime: 1 });
pollSchema.index({ guildId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Poll', pollSchema);
