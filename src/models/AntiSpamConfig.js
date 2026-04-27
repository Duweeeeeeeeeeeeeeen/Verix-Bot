import mongoose from 'mongoose';

const antiSpamSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    
    // Detection logic
    maxMessages: { type: Number, default: 5 }, // X messages
    timeWindow: { type: Number, default: 5000 }, // in Y milliseconds
    
    // Actions
    deleteSpam: { type: Boolean, default: true },
    warnUser: { type: Boolean, default: true },
    warnMessage: { type: String, default: '⚠️ {user}, per favore non spammare! Hai inviato troppi messaggi in poco tempo.' },
    
    // Exceptions
    ignoredRoles: { type: [String], default: [] },
    ignoredChannels: { type: [String], default: [] }
    
}, { timestamps: true });

export default mongoose.model('AntiSpamConfig', antiSpamSchema);
