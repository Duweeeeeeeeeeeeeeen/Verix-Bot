import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    priority: { type: String, enum: ['NORMALE', 'IMPORTANTE', 'URGENTE'], default: 'NORMALE' },
    status: { type: String, enum: ['OPEN', 'PROCESSING', 'WAITING', 'CLOSED'], default: 'OPEN' },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    closedBy: { type: String },
    assignedStaffId: { type: String, default: null },
    lastActivityAt: { type: Date, default: Date.now },
    firstResponseAt: { type: Date },
    responseTimeMs: { type: Number },
    tags: { type: [String], default: [] },
    transcriptURL: { type: String },
    metadata: { type: Map, of: String, default: {} }, // For custom data (like report subject)
    internalNotes: [{
        staffId: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    deletionScheduledAt: { type: Date, default: null }
});

// Performance Indexes
ticketSchema.index({ guildId: 1 });
ticketSchema.index({ userId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ guildId: 1, status: 1 });

export default mongoose.model('Ticket', ticketSchema);
