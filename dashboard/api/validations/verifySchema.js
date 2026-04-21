import { z } from 'zod';
import { discordId, embedDataSchema } from './common.js';

const buttonSchema = z.object({
    label: z.string().max(80).optional(),
    emoji: z.string().optional(),
    style: z.enum(['PRIMARY', 'SECONDARY', 'SUCCESS', 'DANGER']).optional()
});

export const verifySchema = z.object({
    enabled: z.boolean().optional(),
    channelId: discordId.or(z.literal('')).optional().nullable(),
    roleId: discordId.or(z.literal('')).optional().nullable(),
    removeRoleId: discordId.or(z.literal('')).optional().nullable(),
    logChannelId: discordId.or(z.literal('')).optional().nullable(),
    embeds: z.object({
        panel: embedDataSchema.optional(),
        dm: embedDataSchema.optional()
    }).optional(),
    buttons: z.object({
        verify: buttonSchema.optional()
    }).optional(),
    messages: z.object({
        alreadyVerified: z.string().max(500).optional(),
        successResponse: z.string().max(500).optional(),
        errorResponse: z.string().max(500).optional()
    }).optional(),
    dmEnabled: z.boolean().optional(),
    logEnabled: z.boolean().optional()
}).passthrough();
