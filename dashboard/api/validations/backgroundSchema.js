import { z } from 'zod';
import { embedDataSchema } from './common.js';

export const backgroundSchema = z.object({
    enabled: z.boolean().optional(),
    panelChannelId: z.string().optional().nullable(),
    logChannelId: z.string().optional().nullable(),
    entryPoint: z.enum(['PANEL', 'INTEGRATED']).optional(),
    staffRoleIds: z.array(z.string()).optional(),
    cooldown: z.number().min(0).max(720).optional(),
    correctionCooldown: z.number().min(0).max(720).optional(),
    colors: z.object({
        primary: z.string().optional(),
        success: z.string().optional(),
        error: z.string().optional()
    }).optional(),
    embeds: z.object({
        panel: embedDataSchema.optional(),
        instructions: embedDataSchema.optional(),
        dm_received: embedDataSchema.optional(),
        dm_accepted: embedDataSchema.extend({
            enabled: z.boolean().optional()
        }).optional(),
        dm_rejected: embedDataSchema.extend({
            enabled: z.boolean().optional()
        }).optional(),
        staff_received: embedDataSchema.optional(),
        staff_accepted: embedDataSchema.optional(),
        staff_rejected: embedDataSchema.optional(),
        integrated_accepted: embedDataSchema.optional(),
        integrated_rejected: embedDataSchema.optional()
    }).optional()
}).passthrough();
