import StaffStats from '../models/StaffStats.js';
import logger from '../utils/logger.js';

class StaffStatsService {
    static async recordClaim(guildId, staffId) {
        try {
            await StaffStats.findOneAndUpdate(
                { guildId, staffId },
                { 
                    $inc: { ticketsClaimed: 1 },
                    $set: { lastActivityAt: new Date() }
                },
                { upsert: true }
            );
        } catch (error) {
            logger.error(`[StaffStatsService] Error recording claim for ${staffId}:`, error);
        }
    }

    static async recordClose(guildId, staffId, responseTimeMs = 0) {
        try {
            const stats = await StaffStats.findOne({ guildId, staffId });
            
            let update = {
                $inc: { ticketsClosed: 1 },
                $set: { lastActivityAt: new Date() }
            };

            if (responseTimeMs > 0) {
                const newTotalResponseTime = (stats?.totalResponseTimeMs || 0) + responseTimeMs;
                const newTicketsClaimed = (stats?.ticketsClaimed || 1); // Avoid div by zero
                update.$set.totalResponseTimeMs = newTotalResponseTime;
                update.$set.averageResponseTimeMs = Math.round(newTotalResponseTime / newTicketsClaimed);
            }

            await StaffStats.findOneAndUpdate(
                { guildId, staffId },
                update,
                { upsert: true }
            );
        } catch (error) {
            logger.error(`[StaffStatsService] Error recording close for ${staffId}:`, error);
        }
    }

    static async getLeaderboard(guildId) {
        return await StaffStats.find({ guildId })
            .sort({ ticketsClosed: -1 })
            .limit(10);
    }
}

export default StaffStatsService;
