import mongoose from 'mongoose';

const staffAppConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    logChannelId: { type: String },
    panelChannelId: { type: String },
    panelMessageId: { type: String, default: null },
    staffRoleIds: { type: [String], default: [] }, // Roles that can review
    roleToAssignOnSubmit: { type: String }, // Role given while waiting
    roleToAssignOnAccept: { type: String }, // Final staff role
    cooldown: { type: Number, default: 48 }, // Hours
    questions: [{
        text: String,
        minLength: { type: Number, default: 50 }
    }],
    colors: {
        primary: { type: String, default: '#a855f7' }, // Purple theme for staff
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    embeds: {
        panel: {
            title: { type: String, default: 'Staff Applications' },
            description: { type: String, default: 'Want to join the staff team? Submit an application and the team will review it.\n\nMake sure to answer every question with enough detail.' },
            color: { type: String, default: 'primary' },
            button: {
                label: { type: String, default: 'Apply Now' },
                emoji: { type: String, default: '🛡️' },
                style: { type: String, default: 'PRIMARY' }
            }
        },
        dm_accepted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Application Accepted!' },
            description: { type: String, default: 'Great news {user}! Your staff application for {guild} has been approved. Welcome to the team!' },
            color: { type: String, default: 'success' }
        },
        dm_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Application Rejected' },
            description: { type: String, default: 'Sorry {user}, your staff application for {guild} was not approved.\n\n**Reason:**\n>>> {reason}' },
            color: { type: String, default: 'error' }
        }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    }
});

export default mongoose.model('StaffAppConfig', staffAppConfigSchema);
