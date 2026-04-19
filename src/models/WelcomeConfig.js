import mongoose from 'mongoose';

const discordIdRegex = /^\d{17,20}$/;

const messageConfigSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: null, match: discordIdRegex },
    style: { type: String, enum: ['SIMPLE', 'ARTICULATED'], default: 'SIMPLE' },
    message: { type: String, default: 'Benvenuto {user} nel server {guild}!' },
    useImage: { type: Boolean, default: true },
    color: { type: String, default: '#5865F2' }
}, { _id: false });

const welcomeConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true, match: discordIdRegex },
    enabled: { type: Boolean, default: false },
    
    welcome: {
        type: messageConfigSchema,
        default: () => ({
            enabled: false,
            style: 'SIMPLE',
            message: 'Ciao {user_mention}, benvenuto in **{guild}**! Sei il membro numero **{member_count}**.',
            useImage: true,
            color: '#5865F2'
        })
    },

    leave: {
        type: messageConfigSchema,
        default: () => ({
            enabled: false,
            style: 'SIMPLE',
            message: 'Oh no, {user_tag} ha lasciato il server. Ora siamo in {member_count}.',
            useImage: false,
            color: '#ED4245'
        })
    }

}, { timestamps: true });

export default mongoose.model('WelcomeConfig', welcomeConfigSchema);
