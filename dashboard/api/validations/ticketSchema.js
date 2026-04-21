import { z } from 'zod';
import { discordId, colorHex } from './common.js';

export const ticketSchema = z.object({
    enabled: z.boolean().optional(),
    closeMode: z.enum(['MOVE', 'DELETE']).optional(),
    panelChannelId: discordId.or(z.literal('')).optional().nullable(),
    categoryOpenId: discordId.or(z.literal('')).optional().nullable(),
    categoryClosedId: discordId.or(z.literal('')).optional().nullable(),
    staffRoleIds: z.array(z.string()).optional(),
    logChannelId: discordId.or(z.literal('')).optional().nullable(),
    enabledTypes: z.array(z.string()).optional(),
    typesConfig: z.record(z.string(), z.object({
        color: colorHex.optional(),
        emoji: z.string().max(32).optional(),
        image: z.string().url().or(z.string().length(0)).optional().nullable()
    })).optional(),
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
    }).partial().passthrough().optional().nullable()
}).passthrough();
