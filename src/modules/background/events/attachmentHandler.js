import { Events } from 'discord.js';
import Background from '../../../models/Background.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Check if message is in a background channel or a whitelist channel (integrated flow)
        const isBGChannel = message.channel.name.startsWith('bg-');
        const isWLChannel = message.channel.name.startsWith('wl-');
        
        if (!isBGChannel && !isWLChannel) return;

        let app;
        if (isBGChannel) {
            app = await Background.findOne({ channelId: message.channel.id, userId: message.author.id, status: { $in: ['PENDING', 'REJECTED'] } });
        } else {
            // Integrative: check if the WhitelistApp is waiting for BG or submitted
            const wlApp = await (await import('../../../models/WhitelistApp.js')).default.findOne({ 
                channelId: message.channel.id, 
                userId: message.author.id, 
                status: { $in: ['WAITING_BACKGROUND', 'SUBMITTED_BACKGROUND'] } 
            });
            if (!wlApp) return;
            
            app = await Background.findOne({ channelId: message.channel.id, userId: message.author.id, status: { $in: ['PENDING', 'REJECTED'] } });
        }

        if (!app) return;

        // Check for cooldown if REJECTED
        if (app.status === 'REJECTED') {
            const config = await BackgroundConfig.findOne({ guildId: message.guild.id });
            const isWL = message.channel.name.startsWith('wl-');
            
            // Choose the correct cooldown
            const cooldownHours = isWL 
                ? (config?.correctionCooldown !== undefined ? config.correctionCooldown : 2)
                : (config?.cooldown || 24);

            if (cooldownHours > 0) {
                const cooldownMs = cooldownHours * 60 * 60 * 1000;
                const timePassed = Date.now() - app.updatedAt.getTime();

                if (timePassed < cooldownMs) {
                    const nextDate = new Date(app.updatedAt.getTime() + cooldownMs);
                    return message.reply(`⚠️ **Cooldown attivo!** Potrai inviare una nuova versione del tuo background <t:${Math.floor(nextDate.getTime() / 1000)}:R>.\nUsa questo tempo per correggere la storia secondo le indicazioni dello staff.`);
                }
            }
            
            // Cooldown passed or 0, reset status to allow editing
            app.status = 'PENDING';
            await app.save();
        }

        // Check for attachments
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            app.attachmentURL = attachment.url;
            await app.save();
            
            await message.reply(`✅ **File caricato correttamente!**\nL'ufficiale ha registrato l'allegato: [${attachment.name}](${attachment.url})`);
        }
    },
};
