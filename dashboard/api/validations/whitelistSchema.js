import { z } from 'zod';
import { discordId, colorHex, embedDataSchema } from './common.js';

export const whitelistSchema = z.object({
    enabled: z.boolean().optional(),
    title: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    color: colorHex.optional().nullable(),
    panelChannelId: discordId.or(z.literal('')).optional().nullable(),
    categoryOpenId: discordId.or(z.literal('')).optional().nullable(),
    staffRoleId: discordId.or(z.literal('')).optional().nullable(),
    logChannelId: discordId.or(z.literal('')).optional().nullable(),
    staffRoleIds: z.array(z.string()).optional().nullable(),
    questions: z.array(z.object({
        text: z.string().min(1).max(500),
        minLength: z.number().min(0).max(2000),
        category: z.string().max(50).optional()
    }).passthrough()).optional().nullable(),
    questionsPerSession: z.number().min(1).max(50).optional().nullable(),
    timeLimit: z.number().min(1).max(1440).optional().nullable(),
    timeLimitEnabled: z.boolean().optional().nullable(),
    cooldown: z.number().min(0).max(720).optional().nullable(),
    cooldownEnabled: z.boolean().optional().nullable(),
    mode: z.enum(['TEXT', 'VOICE', 'HYBRID']).optional(),
    rolesToAddOnTextPass: z.array(z.string()).optional().nullable(),
    rolesToRemoveOnTextPass: z.array(z.string()).optional().nullable(),
    voiceSettings: z.object({
        joinChannelId: discordId.or(z.literal('')).optional().nullable(),
        categoryId: discordId.or(z.literal('')).optional().nullable(),
        autoDelete: z.boolean().optional().nullable(),
        maxConcurrent: z.number().min(1).max(20).optional().nullable(),
        queueCooldown: z.number().min(0).optional().nullable(),
        rejectionCooldown: z.number().min(0).optional().nullable(),
        rolesToAdd: z.array(z.string()).optional().nullable(),
        rolesToRemove: z.array(z.string()).optional().nullable(),
        vipRoleId: discordId.or(z.literal('')).optional().nullable(),
        paused: z.boolean().optional().nullable(),
        pingStaffOnJoin: z.boolean().optional().nullable(),
        dashboardChannelId: discordId.optional().nullable(),
        dashboardMsgId: discordId.optional().nullable(),
        recentActionsCount: z.number().optional().nullable(),
        interviewChecklist: z.array(z.string()).optional().nullable(),
        voiceMessages: z.object({
            cooldown: z.string().optional(),
            queueFull: z.string().optional(),
            staffApproved: z.string().optional(),
            staffDenied: z.string().optional()
        }).partial().optional().nullable(),
        voiceButtons: z.object({
            approve: z.object({ label: z.string(), emoji: z.string(), style: z.string() }).partial().optional(),
            deny: z.object({ label: z.string(), emoji: z.string(), style: z.string() }).partial().optional(),
            reset: z.object({ label: z.string(), emoji: z.string(), style: z.string() }).partial().optional()
        }).partial().optional().nullable()
    }).partial().optional().nullable(),
    flowRequirements: z.object({
        requireTextWL: z.boolean().optional().nullable(),
        requireBackground: z.boolean().optional().nullable()
    }).partial().optional().nullable(),
    colors: z.object({
        primary: colorHex.optional().nullable(),
        success: colorHex.optional().nullable(),
        error: colorHex.optional().nullable()
    }).partial().optional().nullable(),
    embeds: z.record(z.string(), embedDataSchema).optional().nullable()
}).passthrough();
