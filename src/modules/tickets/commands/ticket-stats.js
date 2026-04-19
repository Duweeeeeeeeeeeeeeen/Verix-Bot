import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Ticket from '../../../models/Ticket.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket-stats')
        .setDescription('📊 Visualizza le statistiche di produttività dello staff.')
        .addUserOption(opt => opt.setName('staffer').setDescription('Visualizza statistiche per uno staffer specifico'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const targetStaff = interaction.options.getUser('staffer');
        const guildId = interaction.guild.id;

        const query = { guildId, status: 'CLOSED' };
        if (targetStaff) query.assignedStaffId = targetStaff.id;

        const closedTickets = await Ticket.find(query);

        if (closedTickets.length === 0) {
            return interaction.reply({ content: '❌ Nessun dato trovato per questo server/staffer.', ephemeral: true });
        }

        // Calculate Stats
        const total = closedTickets.length;
        const withResponse = closedTickets.filter(t => t.responseTimeMs != null);
        const avgResponseMs = withResponse.reduce((acc, t) => acc + t.responseTimeMs, 0) / (withResponse.length || 1);

        const avgMinutes = Math.floor(avgResponseMs / (1000 * 60));
        const avgSeconds = Math.floor((avgResponseMs / 1000) % 60);

        const embed = new EmbedBuilder()
            .setTitle(`📊 Statistiche Performance: ${targetStaff?.tag || 'Globali'}`)
            .setColor('#3498db')
            .addFields(
                { name: '🎫 Ticket Chiusi', value: `\`${total}\``, inline: true },
                { name: '⏳ Risposta Media (SLA)', value: `\`${avgMinutes}m ${avgSeconds}s\``, inline: true },
                { name: '📈 Efficienza', value: total > 50 ? 'Eccellente 🏆' : (total > 10 ? 'Buona ✅' : 'In crescita 🌱'), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Analisi Produttività Staff' });

        if (!targetStaff) {
            // Leaderboard (Top 3)
            const staffStats = {};
            closedTickets.forEach(t => {
                if (t.assignedStaffId) {
                    staffStats[t.assignedStaffId] = (staffStats[t.assignedStaffId] || 0) + 1;
                }
            });

            const sorted = Object.entries(staffStats).sort((a, b) => b[1] - a[1]).slice(0, 3);
            if (sorted.length > 0) {
                const lbValue = sorted.map(([id, count], idx) => `${['🥇', '🥈', '🥉'][idx]} <@${id}>: \`${count}\` ticket`).join('\n');
                embed.addFields({ name: '🏆 Top Performers', value: lbValue });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
};
