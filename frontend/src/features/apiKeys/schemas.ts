import { z } from 'zod';

export const GenerateApiKeySchema = z.object({
    name: z.string()
        .min(1, 'Key name is required')
        .min(3, 'Key name must be at least 3 characters')
        .max(100, 'Key name must be less than 100 characters'),
    expiresAt: z.string()
        .optional()
        .or(z.literal(''))
});

export type GenerateApiKeyFormValues = z.infer<typeof GenerateApiKeySchema>;
