import { z } from 'zod';

const platformSchema = z.object({
    enabled: z.boolean().default(false),
    notificationChannelId: z.string().nullable().optional(),
    roleId: z.string().nullable().optional(),
    mentionEveryone: z.boolean().default(false),
    embed: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        thumbnail: z.string().optional(),
        image: z.string().optional(),
        footer: z.string().optional()
    }).optional(),
    accounts: z.array(z.object({
        username: z.string().min(1, 'Username is required'),
        discordUserId: z.string().nullable().optional()
    })).default([]),
    webhookToken: z.string().optional()
}).optional();

export const socialSchema = z.object({
    platforms: z.object({
        twitch: platformSchema,
        youtube: platformSchema,
        instagram: platformSchema,
        tiktok: platformSchema,
        twitter: platformSchema
    }).optional()
});
