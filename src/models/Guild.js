import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    guildName: String,
    joinedAt: {
        type: Date,
        default: Date.now
    },
    // Configuration fields
    prefix: {
        type: String,
        default: '!'
    },
    logChannelId: {
        type: String,
        default: null
    },
    welcomeChannelId: {
        type: String,
        default: null
    },

    isPremium: {
        type: Boolean,
        default: false
    },
    premiumTier: {
        type: String,
        enum: ['none', 'lite', 'premium', 'platinum'],
        default: 'none'
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    stripeSubscriptionId: {
        type: String,
        default: null
    },
    stripePaymentMode: {
        type: String,
        enum: ['subscription', 'payment', null],
        default: null
    },
    premiumLifetime: {
        type: Boolean,
        default: false
    },

    enabledModules: {
        type: [String],
        default: ['whitelist', 'tickets', 'voice', 'verify', 'logs', 'background', 'support']
    },

    setupCompleted: {
        type: Boolean,
        default: false
    },
    
    // White-label Premium features
    customBotName: { type: String, default: null },
    customStatuses: {
        type: [{
            text: String,
            type: { type: Number, default: 0 }
        }],
        default: []
    },
    statusRotationInterval: { type: Number, default: 60 }, // Seconds
    hideBranding: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Guild', guildSchema);
