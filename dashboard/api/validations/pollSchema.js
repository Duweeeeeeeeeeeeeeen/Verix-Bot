import { z } from 'zod';

export const pollConfigSchema = z.object({
    enabled: z.boolean().default(false),
    logChannelId: z.string().nullable().optional().transform(value => value || null),
    defaultColor: z.string().default('#5865F2')
});

export const pollCreateSchema = z.object({
    channelId: z.string(),
    question: z.string().min(1).max(256),
    options: z.array(z.object({
        emoji: z.string(),
        label: z.string().min(1).max(80)
    })).min(2).max(20),
    duration: z.number().min(1), // Minutes
    mode: z.enum(['SINGLE', 'MULTIPLE']).default('SINGLE'),
    color: z.string().default('#5865F2')
});
