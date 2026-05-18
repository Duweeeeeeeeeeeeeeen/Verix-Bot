import { z } from 'zod';
import { discordId, colorHex } from './common.js';

export const photoContestSchema = z.object({
    enabled: z.boolean().optional(),
    channelId: discordId.or(z.literal('')).optional().nullable(),
    prizeRoleId: discordId.or(z.literal('')).optional().nullable(),
    interval: z.number().min(1).max(8760).optional(), // Max 1 year
    duration: z.number().min(1).max(168).optional(), // Max 1 week
    embedSettings: z.object({
        title: z.string().max(256).optional(),
        description: z.string().max(2048).optional(),
        color: colorHex.optional()
    }).passthrough().optional(),
    hallOfFameChannelId: discordId.or(z.literal('')).optional().nullable(),
    staffRoleIds: z.array(discordId).optional(),
    automaticThemes: z.boolean().optional(),
    themesList: z.array(z.union([
        z.string(),
        z.object({
            name: z.string(),
            duration: z.number().min(1).max(168).nullable().optional()
        })
    ])).optional(),
    notifications: z.object({
        mode: z.enum(['DM', 'CHANNEL', 'BOTH', 'NONE']).default('DM'),
        channelId: discordId.or(z.literal('')).optional().nullable()
    }).optional(),
    systemMessages: z.record(z.string(), z.string()).optional(),
    submitLabel: z.string().max(80).optional(),
    submitEmoji: z.string().max(32).optional(),
    voteLabel: z.string().max(80).optional(),
    voteEmoji: z.string().max(32).optional(),
    upvoteEmoji: z.string().max(32).optional(),
    downvoteEmoji: z.string().max(32).optional(),
    multiWinner: z.boolean().optional(),
    winnersCount: z.number().min(1).max(10).optional()
}).passthrough();
