import { z } from 'zod';
import { discordId, embedDataSchema } from './common.js';

export const templateSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1).max(50),
    data: embedDataSchema
}).strict();

export const sendEmbedSchema = z.object({
    channelId: discordId,
    embed: embedDataSchema,
    schedule: z.object({
        type: z.enum(['NOW', 'DELAY', 'TIME']),
        delayMinutes: z.number().min(1).optional(),
        specificTime: z.string().optional(),
        recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional()
    }).optional()
}).strict();
