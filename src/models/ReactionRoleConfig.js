import mongoose from 'mongoose';

const reactionRolePanelSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Unique ID for the panel
    name: { type: String, default: 'Reaction Role Panel' },
    channelId: { type: String, required: true },
    messageId: { type: String, default: null },
    type: { type: String, enum: ['BUTTON', 'REACTION'], default: 'BUTTON' },
    roles: [{
        roleId: { type: String, required: true },
        emoji: { type: String, default: null },
        label: { type: String, default: null },
        style: { type: String, enum: ['PRIMARY', 'SECONDARY', 'SUCCESS', 'DANGER'], default: 'PRIMARY' }
    }],
    embed: {
        title: { type: String, default: 'Assegnazione Ruoli' },
        description: { type: String, default: 'Select the roles you want to receive by clicking the buttons or reacting.' },
        color: { type: String, default: '#5865F2' },
        image: { type: String, default: null },
        thumbnail: { type: String, default: null },
        footer: { type: String, default: 'Reaction Roles | Verix' }
    }
});

const reactionRoleConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    panels: [reactionRolePanelSchema],
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

export default mongoose.model('ReactionRoleConfig', reactionRoleConfigSchema);
