import { z } from 'zod';

const platformSchema = z.object({
    enabled: z.boolean().default(false),
    notificationChannelId: z.string().nullable().optional(),
    roleId: z.string().nullable().optional(),
    liveRoleId: z.string().nullable().optional(),
    mentionEveryone: z.boolean().default(false),
    embed: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        thumbnail: z.string().optional(),
        image: z.string().optional(),
        footer: z.string().optional()
    }).passthrough().optional(),
    accounts: z.array(z.union([
        z.string().transform(v => ({ username: v })),
        z.object({
            username: z.string().min(1, 'Username is required'),
            discordUserId: z.string().nullable().optional()
        }).passthrough()
    ])).default([]),
    webhookToken: z.string().nullable().optional()
}).passthrough().optional();

export const socialSchema = z.object({
    platforms: z.object({
        twitch: platformSchema,
        youtube: platformSchema,
        instagram: platformSchema,
        tiktok: platformSchema,
        twitter: platformSchema,
        reddit: platformSchema,
        steam: platformSchema,
        kick: platformSchema,
        github: platformSchema,
        rss: platformSchema,
        telegram: platformSchema
    }).passthrough().optional()
}).passthrough();
