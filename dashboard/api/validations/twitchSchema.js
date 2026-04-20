import { z } from 'zod';

const streamerSchema = z.object({
    twitchUsername: z.string().min(1),
    discordUserId: z.string().optional().nullable(),
}).passthrough();

export const twitchSchema = z.object({
    enabled: z.boolean().optional(),
    notificationChannelId: z.string().optional().nullable(),
    streamingRoleId: z.string().optional().nullable(),
    mentionEveryone: z.boolean().optional(),
    embed: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        thumbnail: z.string().optional().nullable(),
        image: z.string().optional().nullable(),
        footer: z.string().optional(),
    }).passthrough().optional(),
    streamers: z.array(streamerSchema).optional(),
}).passthrough();
