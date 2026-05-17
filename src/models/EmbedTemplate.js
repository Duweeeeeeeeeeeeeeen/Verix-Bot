import mongoose from 'mongoose';

const embedTemplateSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    targetChannelId: {
        type: String,
        default: ''
    },
    data: {
        title: String,
        description: String,
        color: String,
        image: String,
        thumbnail: String,
        footer: String,
        author: {
            name: String,
            iconURL: String
        },
        fields: [{
            name: String,
            value: String,
            inline: Boolean
        }]
    }
}, { timestamps: true });

export default mongoose.model('EmbedTemplate', embedTemplateSchema);
