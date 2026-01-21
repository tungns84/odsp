import { z } from 'zod';

export const CreateTenantSchema = z.object({
    name: z.string()
        .min(1, 'Tenant name is required')
        .min(3, 'Tenant name must be at least 3 characters')
        .max(100, 'Tenant name must be less than 100 characters')
        .regex(/^[a-zA-Z0-9\s-_]+$/, 'Only alphanumeric characters, spaces, hyphens, and underscores are allowed'),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional()
        .or(z.literal(''))
});

export const EditTenantSchema = z.object({
    name: z.string()
        .min(1, 'Tenant name is required')
        .min(3, 'Tenant name must be at least 3 characters')
        .max(100, 'Tenant name must be less than 100 characters'),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional()
        .or(z.literal('')),
    isActive: z.boolean()
});

export type CreateTenantFormValues = z.infer<typeof CreateTenantSchema>;
export type EditTenantFormValues = z.infer<typeof EditTenantSchema>;
