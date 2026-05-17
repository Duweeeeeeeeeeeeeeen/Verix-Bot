import { z } from 'zod';
import { embedDataSchema } from './common.js';

export const staffAppSchema = z.object({
    enabled: z.boolean().optional(),
    panelChannelId: z.string().optional().nullable(),
    logChannelId: z.string().optional().nullable(),
    staffRoleIds: z.array(z.string()).optional(),
    roleToAssignOnSubmit: z.string().optional().nullable(),
    roleToAssignOnAccept: z.string().optional().nullable(),
    cooldown: z.number().min(0).optional(),
    questions: z.array(z.object({
        text: z.string(),
        minLength: z.number().optional()
    })).optional(),
    colors: z.object({
        primary: z.string().optional(),
        success: z.string().optional(),
        error: z.string().optional()
    }).optional(),
    embeds: z.object({
        panel: embedDataSchema.optional(),
        dm_accepted: embedDataSchema.extend({
            enabled: z.boolean().optional()
        }).optional(),
        dm_rejected: embedDataSchema.extend({
            enabled: z.boolean().optional()
        }).optional()
    }).optional()
}).passthrough();
