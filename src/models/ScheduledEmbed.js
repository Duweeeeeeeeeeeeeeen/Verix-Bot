import mongoose from 'mongoose';

const scheduledEmbedSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    channelId: {
        type: String,
        required: true
    },
    embed: {
        type: Object,
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true,
        index: true
    },
    sent: {
        type: Boolean,
        default: false,
        index: true
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ScheduledEmbed = mongoose.model('ScheduledEmbed', scheduledEmbedSchema);

export default ScheduledEmbed;
