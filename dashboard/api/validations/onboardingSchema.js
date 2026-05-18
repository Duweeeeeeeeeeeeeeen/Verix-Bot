import { z } from 'zod';
import { discordId } from './common.js';

export const onboardingSchema = z.object({
    // Step 1: Base Settings
    language: z.enum(['it', 'en', 'es', 'fr', 'de']),
    adminRoleIds: z.array(discordId),
    logChannelId: discordId.nullable().optional(),

    // Step 2: Module Toggles
    modules: z.object({
        whitelist: z.boolean(),
        tickets: z.boolean(),
        verify: z.boolean()
    }),

    // Step 3: Minimal Config
    config: z.object({
        whitelist: z.object({
            categoryOpenId: discordId.nullable().optional(),
            whitelistRole: discordId.nullable().optional() // Map to rolesToAddOnTextPass
        }).optional(),
        tickets: z.object({
            categoryOpenId: discordId.nullable().optional(),
            staffRoleIds: z.array(discordId).optional()
        }).optional(),
        verify: z.object({
            channelId: discordId.nullable().optional(),
            roleId: discordId.nullable().optional()
        }).optional()
    })
});
