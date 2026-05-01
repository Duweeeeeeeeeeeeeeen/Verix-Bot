import mongoose from 'mongoose';

const giveawayConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    managerRoles: {
        type: [String],
        default: []
    }
}, { timestamps: true });

export default mongoose.model('GiveawayConfig', giveawayConfigSchema);
