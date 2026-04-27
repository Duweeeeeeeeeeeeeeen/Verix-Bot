import { EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import Ticket from '../../../models/Ticket.js';
import messageService from '../../../utils/messageService.js';

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
            return messageService.reply(interaction, 'tickets', 'error', { reason: 'Nessun dato trovato per questo server/staffer.' }, { ephemeral: true });
        }

        // Calculate Stats
        const total = closedTickets.length;
        const withResponse = closedTickets.filter(t => t.responseTimeMs != null);
        const avgResponseMs = withResponse.reduce((acc, t) => acc + t.responseTimeMs, 0) / (withResponse.length || 1);

        const avgMinutes = Math.floor(avgResponseMs / (1000 * 60));
        const avgSeconds = Math.floor((avgResponseMs / 1000) % 60);

        let lbValue = '';
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
                lbValue = sorted.map(([id, count], idx) => `${['🥇', '🥈', '🥉'][idx]} <@${id}>: \`${count}\` ticket`).join('\n');
            }
        }

        const statsStr = `🎫 Ticket Chiusi: \`${total}\`\n⏳ Risposta Media: \`${avgMinutes}m ${avgSeconds}s\`\n${lbValue ? `\n🏆 **Top Performers:**\n${lbValue}` : ''}`;
        
        return messageService.reply(interaction, 'tickets', 'stats_display', { stats: statsStr });
    },
};
