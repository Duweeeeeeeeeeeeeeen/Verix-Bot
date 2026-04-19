import { z } from 'zod';
import { discordId, embedDataSchema, urlOrEmpty } from './common.js';

const buttonSchema = z.object({
    label: z.string().max(80).optional(),
    url: urlOrEmpty,
    emoji: z.string().optional(),
    style: z.enum(['LINK', 'PRIMARY', 'SECONDARY', 'SUCCESS', 'DANGER']).optional()
});

const serverTrackerSchema = z.object({
    id: z.string().optional(),
    enabled: z.boolean().optional(),
    serverIp: z.string().optional(),
    statusChannelId: discordId.or(z.literal('')).optional().nullable(),
    onlineEmbed: embedDataSchema.optional(),
    offlineEmbed: embedDataSchema.optional(),
    buttons: z.array(buttonSchema).optional()
});

export const fivemSchema = z.object({
    enabled: z.boolean().optional(),
    staffRoleIds: z.array(discordId).optional().nullable(),
    servers: z.array(serverTrackerSchema).optional()
});
