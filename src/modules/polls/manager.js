import Poll from '../../models/Poll.js';
import PollConfig from '../../models/PollConfig.js';
import logger from '../../utils/logger.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import messageService from '../../utils/messageService.js';

class PollManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    async init() {
        logger.info('[Polls] Manager initialized.');
        this.startLoop();
    }

    startLoop() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.checkPolls(), 60000); // Every minute
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async checkPolls() {
        try {
            const now = new Date();
            const expiredPolls = await Poll.find({ 
                endTime: { $lte: now }, 
                status: 'ACTIVE' 
            });

            for (const poll of expiredPolls) {
                await this.endPoll(poll);
            }
        } catch (error) {
            logger.error('[Polls] Error in check loop:', error);
        }
    }

    async handleInteraction(interaction) {
        if (!interaction.isButton()) return;
        
        const parts = interaction.customId.split('_');
        if (parts.length < 3 || parts[0] !== 'poll') return;

        const action = parts[1]; // 'vote'
        if (action !== 'vote') return;

        const hasPollId = parts.length >= 4;
        const pollId = hasPollId ? parts[2] : null;
        const optionIndex = parseInt(hasPollId ? parts[3] : parts[2], 10);
        if (!Number.isInteger(optionIndex)) return;

        const poll = pollId
            ? await Poll.findOne({ _id: pollId, messageId: interaction.message.id }).catch(() => null)
            : await Poll.findOne({ messageId: interaction.message.id });
        if (!poll || poll.status !== 'ACTIVE') {
            return messageService.reply(interaction, 'poll', 'ended', {}, { ephemeral: true });
        }

        const userId = interaction.user.id;
        
        // Handle Single/Multiple voting mode
        if (poll.mode === 'SINGLE') {
            // Remove user from all other options
            poll.options.forEach((opt, idx) => {
                if (idx !== optionIndex) {
                    opt.votes = opt.votes.filter(id => id !== userId);
                }
            });
        }

        const option = poll.options[optionIndex];
        if (!option) {
            return messageService.reply(interaction, 'poll', 'invalid_option', {}, { ephemeral: true });
        }
        const hasVoted = option.votes.includes(userId);

        if (hasVoted) {
            option.votes = option.votes.filter(id => id !== userId);
            await messageService.reply(interaction, 'poll', 'vote_removed', {}, { ephemeral: true });
        } else {
            option.votes.push(userId);
            await messageService.reply(interaction, 'poll', 'vote_recorded', {}, { ephemeral: true });
        }

        await poll.save();
        await this.updatePollMessage(poll);
    }

    async updatePollMessage(poll) {
        const guild = this.client.guilds.cache.get(poll.guildId) || await this.client.guilds.fetch(poll.guildId).catch(() => null);
        if (!guild) return;

        const channel = await guild.channels.fetch(poll.channelId).catch(() => null);
        if (!channel) return;

        const message = await channel.messages.fetch(poll.messageId).catch(() => null);
        if (!message) return;

        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
        
        const embed = new EmbedBuilder()
            .setTitle(`📊 Sondaggio: ${poll.question}`)
            .setColor(poll.color || '#5865F2')
            .setFooter({ text: `Voti totali: ${totalVotes} | Termina il` })
            .setTimestamp(poll.endTime);

        let description = '';
        poll.options.forEach((opt, idx) => {
            const count = opt.votes.length;
            const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const bar = this.createProgressBar(percent);
            description += `${opt.emoji} **${opt.label}**\n${bar} ${percent}% (${count})\n\n`;
        });

        embed.setDescription(description);

        await message.edit({ embeds: [embed] });
    }

    async endPoll(poll) {
        try {
            poll.status = 'ENDED';
            await poll.save();

            const guild = this.client.guilds.cache.get(poll.guildId) || await this.client.guilds.fetch(poll.guildId).catch(() => null);
            if (!guild) return;

            const channel = await guild.channels.fetch(poll.channelId).catch(() => null);
            if (!channel) return;

            const message = await channel.messages.fetch(poll.messageId).catch(() => null);
            
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
            
            const embed = new EmbedBuilder()
                .setTitle(`🏁 Risultati Sondaggio: ${poll.question}`)
                .setColor('#2ed573')
                .setFooter({ text: `Sondaggio terminato • Voti totali: ${totalVotes}` })
                .setTimestamp();

            let description = '';
            // Sort options by votes to show winners
            const sortedOptions = [...poll.options].sort((a, b) => b.votes.length - a.votes.length);
            
            sortedOptions.forEach((opt) => {
                const count = opt.votes.length;
                const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const bar = this.createProgressBar(percent);
                const isWinner = count > 0 && count === sortedOptions[0].votes.length;
                description += `${isWinner ? '🏆 ' : ''}${opt.emoji} **${opt.label}**\n${bar} ${percent}% (${count})\n\n`;
            });

            embed.setDescription(description);

            if (message) {
                await message.edit({ embeds: [embed], components: [] });
            } else {
                await channel.send({ embeds: [embed] });
            }

            logger.info(`[Polls] Ended poll ${poll._id} in ${guild.name}`);
        } catch (error) {
            logger.error(`[Polls] Error ending poll ${poll._id}:`, error);
        }
    }

    createProgressBar(percent) {
        const size = 10;
        const progress = Math.round((size * percent) / 100);
        const emptyProgress = size - progress;

        const progressText = '▇'.repeat(progress);
        const emptyProgressText = '—'.repeat(emptyProgress);

        return `\`${progressText}${emptyProgressText}\``;
    }
}

export default PollManager;
