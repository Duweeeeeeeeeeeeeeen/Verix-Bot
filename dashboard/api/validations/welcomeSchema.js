import { z } from 'zod';
import { discordId, colorHex } from './common.js';

const messageConfig = z.object({
    enabled: z.boolean(),
    channelId: discordId.or(z.literal('')).optional().nullable(),
    style: z.enum(['SIMPLE', 'ARTICULATED']),
    message: z.string().max(1000),
    useImage: z.boolean(),
    color: colorHex.optional().nullable()
});

export const welcomeSchema = z.object({
    enabled: z.boolean().optional(),
    welcome: messageConfig.optional(),
    leave: messageConfig.optional()
}).passthrough();
