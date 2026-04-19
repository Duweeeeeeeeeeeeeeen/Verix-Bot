import { z } from 'zod';
import { discordId } from './common.js';

export const guildSchema = z.object({
    prefix: z.string().min(1).max(5).optional(),
    logChannelId: discordId.or(z.literal('')).optional().nullable(),
    welcomeChannelId: discordId.or(z.literal('')).optional().nullable(),
    isPremium: z.boolean().optional(),
    enabledModules: z.array(z.string()).optional()
});
