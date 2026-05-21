import mongoose from 'mongoose';

const discordIdRegex = /^\d{17,20}$/;

const messageConfigSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null, match: discordIdRegex },
    embed: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        color: { type: String, default: '#5865F2' },
        image: { type: String, default: '' },
        thumbnail: { type: String, default: '' },
        footer: { type: String, default: '' }
    }
}, { _id: false });

const welcomeConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true, match: discordIdRegex },
    enabled: { type: Boolean, default: false },
    
    welcome: {
        type: messageConfigSchema,
        default: () => ({
            enabled: false,
            embed: {
                title: 'Welcome to the server!',
                description: 'Hi {user_mention}, welcome to **{guild}**! You are member **#{member_count}**.',
                color: '#5865F2'
            }
        })
    },

    leave: {
        type: messageConfigSchema,
        default: () => ({
            enabled: false,
            embed: {
                title: 'Member left',
                description: '{user_tag} left **{guild}**. We now have **{member_count}** members.',
                color: '#ED4245'
            }
        })
    },

    colors: {
        primary: { type: String, default: '#5865F2' },
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    }

}, { timestamps: true });

export default mongoose.model('WelcomeConfig', welcomeConfigSchema);
