import mongoose from 'mongoose';

// ─────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────

const discordIdRegex = /^\d{17,20}$/;

const buttonConfigSchema = new mongoose.Schema({
    customId: { type: String, required: true },
    label: { type: String, default: '' },
    emoji: { type: String, default: '' },
    style: {
        type: String,
        enum: ['PRIMARY', 'SUCCESS', 'DANGER', 'SECONDARY'],
        default: 'PRIMARY'
    },
    enabled: { type: Boolean, default: true }
}, { _id: false });

const notificationEventSchema = new mongoose.Schema({
    dm: { type: Boolean, default: false },
    channel: { type: Boolean, default: false },
    channelId: { type: String, default: null, match: discordIdRegex }
}, { _id: false });

// ─────────────────────────────────────────────
// Main Schema (Max 2 Levels Deep)
// ─────────────────────────────────────────────

const globalConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true, match: discordIdRegex },
    adminRoleIds: { type: [String], default: [] },
    language: { type: String, enum: ['it', 'en', 'es', 'fr'], default: 'en' },

    // ── UI SYSTEM ──────────────────────────────
    ui: {
        whitelistButtons: {
            type: [buttonConfigSchema],
            default: [
                { customId: 'start_wl', label: 'Start Application', emoji: '⚖️', style: 'PRIMARY', enabled: true },
                { customId: 'confirm_wl', label: 'Confirm', emoji: '✅', style: 'SUCCESS', enabled: true },
                { customId: 'cancel_wl', label: 'Cancel', emoji: '❌', style: 'DANGER', enabled: true }
            ]
        },
        ticketButtons: {
            type: [buttonConfigSchema],
            default: [
                { customId: 'tk_claim', label: 'Claim', emoji: '🙋‍♂️', style: 'SUCCESS', enabled: true },
                { customId: 'tk_close', label: 'Close', emoji: '🔒', style: 'DANGER', enabled: true },
                { customId: 'tk_quick_reply', label: 'Quick Replies', emoji: '📝', style: 'PRIMARY', enabled: true },
                { customId: 'tk_tag', label: 'Tag', emoji: '🏷️', style: 'SECONDARY', enabled: true },
                { customId: 'tk_transcript', label: 'Logs', emoji: '📄', style: 'SECONDARY', enabled: true }
            ]
        },
        voiceButtons: {
            type: [buttonConfigSchema],
            default: [
                { customId: 'approve_voice', label: 'Approve', emoji: '✅', style: 'SUCCESS', enabled: true },
                { customId: 'deny_voice', label: 'Deny', emoji: '❌', style: 'DANGER', enabled: true },
                { customId: 'reset_timer_voice', label: 'Reset Timer', emoji: '⏱️', style: 'SECONDARY', enabled: true }
            ]
        }
    },

    // ── NOTIFICATION SYSTEM ────────────────────
    notifications: {
        whitelist_onSubmit: { type: notificationEventSchema, default: { dm: true, channel: false, channelId: null } },
        whitelist_onAccept: { type: notificationEventSchema, default: { dm: true, channel: false, channelId: null } },
        whitelist_onReject: { type: notificationEventSchema, default: { dm: true, channel: false, channelId: null } },
        tickets_onOpen:     { type: notificationEventSchema, default: { dm: false, channel: false, channelId: null } },
        tickets_onClose:    { type: notificationEventSchema, default: { dm: false, channel: false, channelId: null } }
    },

    // ── LOG SYSTEM ─────────────────────────────
    logs: {
        enabled:   { type: Boolean, default: true },
        channelId: { type: String, default: null, match: discordIdRegex },
        // Events flattened to 2nd level
        log_onSubmit:  { type: Boolean, default: true },
        log_onAccept:  { type: Boolean, default: true },
        log_onReject:  { type: Boolean, default: true },
        log_onOpen:    { type: Boolean, default: true },
        log_onClose:   { type: Boolean, default: true },
        log_onVoiceStart: { type: Boolean, default: true },
        log_onVoiceEnd:   { type: Boolean, default: false }
    },

    // ── NAMING SYSTEM ──────────────────────────
    naming: {
        voiceChannel: { type: String, default: 'apply-{user}' },
        ticket:       { type: String, default: '{emoji}-{type}-{user}' }
    }

}, { timestamps: true });

export default mongoose.model('GlobalConfig', globalConfigSchema);
