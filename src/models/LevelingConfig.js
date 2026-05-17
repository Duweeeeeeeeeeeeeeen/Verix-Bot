import mongoose from 'mongoose';

const levelingConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    xpRate: { type: Number, default: 1 }, // Multiplier
    cooldown: { type: Number, default: 60 }, // Seconds
    notifyLevelUp: { type: Boolean, default: true },
    notifyChannelId: { type: String, default: null }, // null = DM or current channel
    ignoredChannels: { type: [String], default: [] },
    ignoredRoles: { type: [String], default: [] },
    roleRewards: [{
        level: { type: Number, required: true },
        roleId: { type: String, required: true }
    }],
    rankCardBackground: { type: String, default: null }, // Platinum feature
    dailyXpCap: { type: Number, default: 0 }, // 0 = Unlimited
    xpMultiplier: { type: Number, default: 1 },
    voiceXpRate: { type: Number, default: 10 },
    voiceXpInterval: { type: Number, default: 5 }, // in minutes
    voiceMinUsers: { type: Number, default: 2 },
    notifyTextTemplate: { type: String, default: null },
    giveawayEntryXp: { type: Number, default: 0 },
    photoContestEntryXp: { type: Number, default: 0 },
    doubleXpScheduled: { type: Boolean, default: false },
    doubleXpStartHour: { type: String, default: "00:00" },
    doubleXpEndHour: { type: String, default: "23:59" },
    doubleXpDays: { type: [Number], default: [] },
    levelUpNotificationType: { type: String, default: 'channel' },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('LevelingConfig', levelingConfigSchema);
