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
    }).optional(),
    hallOfFameChannelId: discordId.or(z.literal('')).optional().nullable(),
    automaticThemes: z.boolean().optional(),
    themesList: z.array(z.string()).optional(),
    enableNotifications: z.boolean().optional()
});
