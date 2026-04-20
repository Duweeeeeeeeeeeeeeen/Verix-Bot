import { z } from 'zod';

export const utilitySchema = z.object({
    enabled: z.boolean().default(true),
    allowedRoles: z.array(z.string()).default([])
});
