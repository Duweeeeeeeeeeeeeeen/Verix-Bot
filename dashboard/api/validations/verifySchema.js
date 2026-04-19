import { z } from 'zod';
import { discordId, colorHex } from './common.js';

export const verifySchema = z.object({
    enabled: z.boolean().optional(),
    channelId: discordId.or(z.literal('')).optional().nullable(),
    roleId: discordId.or(z.literal('')).optional().nullable(),
    removeRoleId: discordId.or(z.literal('')).optional().nullable(),
    logChannelId: discordId.or(z.literal('')).optional().nullable(),
    embed: z.object({
        title: z.string().max(256).optional(),
        description: z.string().max(2048).optional(),
        color: colorHex.optional()
    }).optional(),
    dmMessage: z.string().max(500).optional().nullable()
});
