import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events } from 'discord.js';
import Guild from '../../models/Guild.js';
import logger from '../../utils/logger.js';
import multiBotManager from '../../core/multiBotManager.js';

const dashboardBaseUrl = () => (process.env.DASHBOARD_FRONTEND_URL || process.env.PUBLIC_APP_URL || 'https://verixbot.com').replace(/\/+$/, '');
const supportUrl = () => process.env.SUPPORT_SERVER_URL || process.env.DISCORD_SUPPORT_URL || `${dashboardBaseUrl()}/`;

async function sendWelcomeDm(guild, client) {
    const owner = await guild.fetchOwner().catch(() => null);
    if (!owner?.user) {
        logger.warn(`[Bot] Could not fetch owner for welcome DM in guild ${guild.id}.`);
        return;
    }

    const dashboardUrl = `${dashboardBaseUrl()}/config/${guild.id}`;
    const guideUrl = `${dashboardUrl}/guide`;
    const avatarUrl = client.user?.displayAvatarURL({ size: 256 });

    const embed = new EmbedBuilder()
        .setColor('#60a5fa')
        .setTitle("Hi, I'm Verix!")
        .setDescription('Thanks for inviting Verix, let’s get your server set up!')
        .setThumbnail(avatarUrl)
        .addFields({
            name: 'Getting started?',
            value: [
                `To start using Verix, open the dashboard and log in with your Discord account.`,
                'The setup only takes a few minutes, and you can configure every module from the web interface.',
                '',
                `If you have any questions or run into problems, join our support server and we’ll help you out.`
            ].join('\n')
        });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Dashboard')
            .setStyle(ButtonStyle.Link)
            .setURL(dashboardUrl),
        new ButtonBuilder()
            .setLabel('Documentation / Guides')
            .setStyle(ButtonStyle.Link)
            .setURL(guideUrl),
        new ButtonBuilder()
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL(supportUrl())
    );

    await owner.user.send({ embeds: [embed], components: [row] });
    logger.success(`[Bot] Sent welcome DM to ${owner.user.tag} for guild ${guild.name} (${guild.id}).`);
}

export default {
    name: Events.GuildCreate,
    async execute(guild, client) {
        if (!guild) return;
        if (!multiBotManager.shouldHandle(guild.id, client)) return;

        logger.info(`[Bot] Joined new guild: ${guild.name} (${guild.id})`);

        try {
            // Find or create guild config, and force setupCompleted to false
            const guildData = await Guild.findOneAndUpdate(
                { guildId: guild.id },
                { $set: { setupCompleted: false } },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
            );
            
            logger.success(`[Bot] Reset setupCompleted to false for guild: ${guild.name} to trigger dashboard onboarding.`);
        } catch (error) {
            logger.error(`[Bot] Failed to handle guildCreate for ${guild.id}:`, error);
        }

        try {
            await sendWelcomeDm(guild, client);
        } catch (error) {
            logger.warn(`[Bot] Could not send welcome DM for guild ${guild.name} (${guild.id}): ${error.message}`);
        }
    },
};
