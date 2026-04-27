import { z } from 'zod';

export const supportSchema = z.object({
    enabled: z.boolean().optional(),
    staffRoleIds: z.array(z.string()).optional(),
    logChannelId: z.string().nullable().optional(),
    voiceSettings: z.object({
        joinChannelId: z.string().nullable().optional(),
        categoryId: z.string().nullable().optional(),
        autoDelete: z.boolean().optional(),
        maxConcurrent: z.number().min(1).max(10).optional(),
        queueCooldown: z.number().min(0).optional(),
        vipRoleId: z.string().nullable().optional(),
        paused: z.boolean().optional(),
        pingStaffOnJoin: z.boolean().optional(),
        channelNameTemplate: z.string().optional(),
        messages: z.object({
            paused: z.string().optional(),
            cooldown: z.string().optional(),
            queueFull: z.string().optional(),
            sessionStart: z.string().optional()
        }).optional()
    }).optional(),
    embeds: z.object({
        staffLog: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            color: z.string().optional()
        }).optional()
    }).optional()
});
