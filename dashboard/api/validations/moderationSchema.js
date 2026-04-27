import { z } from 'zod';
import { notificationSchema } from './common.js';

export const moderationSchema = z.object({
    enabled: z.boolean().default(true),
    logChannelId: z.string().nullable().optional(),
    notifications: notificationSchema,
    
    antispam: z.object({
        enabled: z.boolean().default(false),
        maxMessages: z.number().min(1).max(50).default(5),
        timeWindow: z.number().min(1000).max(60000).default(5000),
    }).default({}),

    capsLock: z.object({
        enabled: z.boolean().default(false),
        minCharacters: z.number().min(1).max(500).default(10),
        percentage: z.number().min(1).max(100).default(70),
    }).default({}),

    mentionSpam: z.object({
        enabled: z.boolean().default(false),
        limit: z.number().min(1).max(50).default(5),
    }).default({}),

    blacklist: z.object({
        enabled: z.boolean().default(false),
        words: z.array(z.string()).default([]),
    }).default({}),

    punishments: z.array(z.object({
        level: z.number().min(1).max(100),
        action: z.enum(['warn', 'timeout', 'mute', 'kick', 'ban']),
        duration: z.number().min(0).max(43200).optional(),
        message: z.string().max(500).optional()
    })).default([]),

    ignoredRoles: z.array(z.string()).default([]),
    ignoredChannels: z.array(z.string()).default([]),
    resetTime: z.number().min(1).max(1440).default(30)
});
