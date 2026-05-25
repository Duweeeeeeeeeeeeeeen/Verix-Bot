import { z } from 'zod';
import { discordId, colorHex } from './common.js';

export const ticketSchema = z.object({
    enabled: z.boolean().optional(),
    closeMode: z.enum(['MOVE', 'DELETE']).optional(),
    inputType: z.enum(['BUTTONS', 'SELECT']).optional(),
    panelChannelId: discordId.or(z.literal('')).optional().nullable(),
    categoryOpenId: discordId.or(z.literal('')).optional().nullable(),
    categoryClosedId: discordId.or(z.literal('')).optional().nullable(),
    staffRoleIds: z.array(z.string()).optional(),
    logChannelId: discordId.or(z.literal('')).optional().nullable(),
    enabledTypes: z.array(z.string()).optional(),
    typesConfig: z.record(z.string(), z.object({
        label: z.string().max(32).optional(),
        color: colorHex.optional(),
        emoji: z.string().max(32).optional(),
        style: z.enum(['PRIMARY', 'SECONDARY', 'SUCCESS', 'DANGER', 'LINK']).optional(),
        url: z.string().url().or(z.string().length(0)).optional().nullable(),
        image: z.string().url().or(z.string().length(0)).optional().nullable(),
        staffRoleIds: z.array(z.string()).optional(),
        panelChannelId: discordId.or(z.literal('')).optional().nullable(),
        panelMessageId: discordId.or(z.literal('')).optional().nullable()
    }).passthrough()).optional(),
    notifications: z.object({
        mode: z.enum(['DM', 'CHANNEL', 'BOTH', 'NONE']).default('DM'),
        channelId: discordId.or(z.literal('')).optional().nullable()
    }).optional(),
    transcriptionEnabled: z.boolean().optional(),
    inactivityTimeout: z.number().min(1).max(720).optional(),
    cannedResponses: z.array(z.object({
        label: z.string().min(1).max(50),
        content: z.string().min(1).max(2000)
    })).optional(),
    panelImage: z.string().url().or(z.string().length(0)).optional().nullable(),
    embeds: z.object({
        panel: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            color: colorHex.optional(),
            image: z.string().url().or(z.string().length(0)).optional().nullable(),
            thumbnail: z.string().url().or(z.string().length(0)).optional().nullable(),
            footer: z.string().optional().nullable()
        }).partial().optional().nullable(),
        ticket: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            color: colorHex.optional()
        }).partial().optional().nullable(),
        close: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            color: colorHex.optional()
        }).partial().optional().nullable()
    }).partial().optional().nullable(),
    messages: z.object({
        cooldown: z.string().optional(),
        alreadyExists: z.string().optional(),
        successOpen: z.string().optional(),
        successClose: z.string().optional(),
        staffClaimed: z.string().optional()
    }).partial().optional().nullable(),
    buttons: z.object({
        claim: z.object({ label: z.string(), emoji: z.string(), style: z.string() }).partial().optional(),
        close: z.object({ label: z.string(), emoji: z.string(), style: z.string() }).partial().optional(),
        quickReply: z.object({ label: z.string(), emoji: z.string(), style: z.string() }).partial().passthrough().optional(),
        tag: z.object({ label: z.string(), emoji: z.string(), style: z.string() }).partial().passthrough().optional(),
        transcript: z.object({ label: z.string(), emoji: z.string(), style: z.string() }).partial().passthrough().optional()
    }).partial().passthrough().optional().nullable(),
    panels: z.array(z.object({
        id: z.string(),
        name: z.string().min(1).max(50),
        channelId: discordId.or(z.literal('')).optional().nullable(),
        messageId: z.string().optional().nullable(),
        inputType: z.enum(['BUTTONS', 'SELECT']).optional(),
        categories: z.array(z.string()).optional(),
        staffRoleIds: z.array(z.string()).optional(),
        categoryOpenId: discordId.or(z.literal('')).optional().nullable(),
        categoryClosedId: discordId.or(z.literal('')).optional().nullable(),
        logChannelId: discordId.or(z.literal('')).optional().nullable(),
        closeMode: z.enum(['MOVE', 'DELETE']).optional(),
        cannedResponses: z.array(z.object({
            label: z.string().min(1).max(50),
            content: z.string().min(1).max(2000)
        })).optional(),
        embed: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            color: colorHex.optional(),
            image: z.string().url().or(z.string().length(0)).optional().nullable(),
            thumbnail: z.string().url().or(z.string().length(0)).optional().nullable(),
            footer: z.string().optional().nullable()
        }).partial().optional().nullable()
    })).optional()
}).passthrough();
