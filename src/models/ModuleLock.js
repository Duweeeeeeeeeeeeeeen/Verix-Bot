import mongoose from 'mongoose';

const moduleLockSchema = new mongoose.Schema({
    guildId: { 
        type: String, 
        required: true 
    },
    module: { 
        type: String, 
        required: true 
    }, // e.g. 'tickets', 'welcome', 'verify', etc.
    userId: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    expiresAt: { 
        type: Date, 
        required: true 
    }
});

// Compound index so that we don't have multiple locks for the same module in the same guild
moduleLockSchema.index({ guildId: 1, module: 1 }, { unique: true });

// TTL index to automatically remove expired locks in the background
moduleLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('ModuleLock', moduleLockSchema);
