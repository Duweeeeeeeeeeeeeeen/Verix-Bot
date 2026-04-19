import mongoose from 'mongoose';

const dashboardAuditLogSchema = new mongoose.Schema({
    guildId: { 
        type: String, 
        required: true, 
        index: true 
    },
    userId: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String,
        required: true
    },
    action: { 
        type: String, 
        required: true 
    }, // e.g. UPDATE_WHITELIST, RESET_TICKETS, SAVE_TEMPLATE
    changes: { 
        type: Object 
    }, // Validated data that was sent
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

// Index for fast retrieval in chronological order
dashboardAuditLogSchema.index({ guildId: 1, timestamp: -1 });

// TTL Index for automatic cleanup (Expire after 90 days)
dashboardAuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('DashboardAuditLog', dashboardAuditLogSchema);
