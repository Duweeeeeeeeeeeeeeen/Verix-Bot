import mongoose from 'mongoose';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import PhotoContestConfig from '../../models/PhotoContestConfig.js';
import PhotoContest from '../../models/PhotoContest.js';
import PhotoSubmission from '../../models/PhotoSubmission.js';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';
import { checkBotPermissions } from '../../utils/permissionHelper.js';

export class PhotoContestManager {
    constructor(client) {
        this.client = client;
        this.checkInterval = null;
    }

    /**
     * Initialize the manager and start the periodic check.
     */
    init() {
        this.checkInterval = setInterval(() => this.checkContests(), 60000);
        logger.info('[PhotoContest] Manager initialized.');
    }

    /**
     * Main periodic check logic.
     */
    async checkContests() {
        if (mongoose.connection.readyState !== 1) return;
        try {
            const configs = await PhotoContestConfig.find({ enabled: true });

            for (const config of configs) {
                const activeContest = await PhotoContest.findOne({ guildId: config.guildId, status: 'ACTIVE' });

                if (activeContest) {
                    if (new Date() >= activeContest.endTime) {
                        await this.endContest(activeContest);
                    }
                } else {
                    if (!config.nextContestAt || new Date() >= config.nextContestAt) {
                        await this.startContest(config);
                    }
                }
            }
        } catch (error) {
            logger.error('[PhotoContest] Error in periodic check:', error);
        }
    }

    /**
     * Start a new contest for a guild.
     */
    async startContest(config) {
        try {
            const guild = await this.client.guilds.fetch(config.guildId).catch(() => null);
            const channel = guild ? await guild.channels.fetch(config.channelId).catch(() => null) : null;

            if (!channel) return;

            // --- PERMISSION CHECK ---
            const permCheck = checkBotPermissions(channel, [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ManageMessages // For bulkDelete later
            ]);

            if (!permCheck.hasPermission) {
                logger.error(`[PhotoContest] Missing permissions in ${channel.name} (${guild.name}): ${permCheck.missing.join(', ')}`);
                // Postpone contest start if bot can't operate
                config.nextContestAt = new Date(Date.now() + 30 * 60000); // 30 mins delay
                await config.save();
                return;
            }

            let theme = null;
            if (config.automaticThemes && config.themesList.length > 0) {
                theme = config.themesList[Math.floor(Math.random() * config.themesList.length)];
            }

            const endTime = new Date(Date.now() + config.duration * 3600000);
            
            const newContest = await PhotoContest.create({
                guildId: config.guildId,
                status: 'ACTIVE',
                startTime: new Date(),
                endTime: endTime,
                theme: theme
            });

            const embed = new EmbedBuilder()
                .setTitle(config.embedSettings.title + (theme ? `: ${theme}` : ''))
                .setDescription(config.embedSettings.description + `\n\n**Tema:** ${theme || 'Libero'}\n**Scadenza:** <t:${Math.floor(endTime.getTime() / 1000)}:R>`)
                .setColor(config.embedSettings.color)
                .setThumbnail('https://i.imgur.com/8Qj8XzX.png') // Optional: Camera Icon
                .setTimestamp();

            const msg = await channel.send({ embeds: [embed] });
            newContest.announcementMessageId = msg.id;
            await newContest.save();

            logger.info(`[PhotoContest] Started themed contest [${theme || 'FREE'}] in ${guild.name}`);
        } catch (error) {
            logger.error(`[PhotoContest] Error starting contest for guild ${config.guildId}:`, error);
        }
    }

    /**
     * End a contest, select winner, and cleanup.
     */
    async endContest(contest) {
        try {
            contest.status = 'FINISHED';
            await contest.save();

            const config = await PhotoContestConfig.findOne({ guildId: contest.guildId });
            if (!config) return;

            const submissions = await PhotoSubmission.find({ contestId: contest._id }).sort({ score: -1, createdAt: 1 });

            const guild = await this.client.guilds.fetch(contest.guildId);
            const channel = await guild.channels.fetch(config.channelId);

            if (!channel) return;

            // --- PERMISSION CHECK ---
            const permCheck = checkBotPermissions(channel);
            if (!permCheck.hasPermission) {
                logger.error(`[PhotoContest] Missing permissions in ${channel.name} (${guild.name}) to end contest.`);
                return;
            }

            if (submissions.length === 0) {
                await channel.send('😔 Il contest è terminato senza partecipanti.');
                this.scheduleNext(config);
                return;
            }

            const winner = submissions[0];
            contest.winnerId = winner.userId;
            await contest.save();

            // Track Leaderboard
            await User.findOneAndUpdate(
                { discordId: winner.userId },
                { $inc: { photoWins: 1 } },
                { upsert: true }
            );

            // Prize Role logic
            if (config.prizeRoleId) {
                if (config.lastWinnerId) {
                    const lastWinnerMember = await guild.members.fetch(config.lastWinnerId).catch(() => null);
                    if (lastWinnerMember) await lastWinnerMember.roles.remove(config.prizeRoleId).catch(() => null);
                }

                const winnerMember = await guild.members.fetch(winner.userId).catch(() => null);
                if (winnerMember) {
                    await winnerMember.roles.add(config.prizeRoleId).catch(() => null);
                    config.lastWinnerId = winner.userId;
                    await config.save();
                }
            }

            const winnerEmbed = new EmbedBuilder()
                .setTitle('🏆 Vincitore del Contest!')
                .setDescription(`Congratulazioni a <@${winner.userId}> per aver vinto il contest [${contest.theme || 'Libero'}]!\n\n**Punteggio:** ${winner.score} pt`)
                .setImage(winner.imageUrl)
                .setColor('#FFD700')
                .setTimestamp();

            const winnerMsg = await channel.send({ content: `Festeggiamo il nostro vincitore! <@${winner.userId}>`, embeds: [winnerEmbed] });

            // Post to Hall of Fame
            if (config.hallOfFameChannelId) {
                const hofChannel = await guild.channels.fetch(config.hallOfFameChannelId).catch(() => null);
                if (hofChannel) {
                    const hofPermCheck = checkBotPermissions(hofChannel);
                    if (hofPermCheck.hasPermission) {
                        const hofEmbed = new EmbedBuilder()
                            .setTitle(`🌟 Hall of Fame: ${contest.theme || 'Photo Contest'}`)
                            .setAuthor({ name: (await this.client.users.fetch(winner.userId)).username })
                            .setImage(winner.imageUrl)
                            .setDescription(`Vinto da <@${winner.userId}> con **${winner.score} pt**\nData: ${new Date().toLocaleDateString()}`)
                            .setColor('#F1C40F');
                        await hofChannel.send({ embeds: [hofEmbed] });
                    }
                }
            }

            // Cleanup
            setTimeout(async () => {
                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    const toDelete = messages.filter(m => m.id !== winnerMsg.id && !m.pinned);
                    if (toDelete.size > 0 && channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.ManageMessages)) {
                        await channel.bulkDelete(toDelete, true).catch(() => null);
                    }
                } catch (err) {}
            }, 10000);

            this.scheduleNext(config);
        } catch (error) {
            logger.error(`[PhotoContest] Error ending contest ${contest._id}:`, error);
        }
    }

    scheduleNext(config) {
        config.nextContestAt = new Date(Date.now() + config.interval * 3600000);
        config.save();
    }
}
