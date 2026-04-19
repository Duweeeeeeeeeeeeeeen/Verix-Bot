import { z } from 'zod';
import { discordId, embedDataSchema } from './common.js';

const messageConfig = z.object({
    enabled: z.boolean(),
    channelId: discordId.or(z.literal('')).optional().nullable(),
    embed: embedDataSchema.optional().nullable()
});

export const welcomeSchema = z.object({
    enabled: z.boolean().optional(),
    welcome: messageConfig.optional(),
    leave: messageConfig.optional()
}).passthrough();
