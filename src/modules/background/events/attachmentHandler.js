import { Events } from 'discord.js';
import Background from '../../../models/Background.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Check if message is in a background channel
        if (!message.channel.name.startsWith('bg-')) return;

        const app = await Background.findOne({ channelId: message.channel.id, userId: message.author.id, status: 'PENDING' });
        if (!app) return;

        // Check for attachments
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            app.attachmentURL = attachment.url;
            await app.save();
            
            await message.reply(`✅ **File caricato correttamente!**\nL'ufficiale ha registrato l'allegato: [${attachment.name}](${attachment.url})`);
        }
    },
};
