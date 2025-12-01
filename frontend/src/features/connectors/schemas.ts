import { z } from 'zod';

export const ConnectorTypeSchema = z.enum(['DATABASE', 'API', 'FILE_SYSTEM']);

export const DatabaseConfigSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.number().int().positive('Port must be positive'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    databaseName: z.string().min(1, 'Database Name is required'),
    schema: z.string().optional().default('public'),
});

export const ApiConfigSchema = z.object({
    endpoint: z.string().url('Invalid URL'),
    authType: z.enum(['NONE', 'BASIC', 'BEARER', 'API_KEY']),
    apiKey: z.string().optional(),
});

export const FileSystemConfigSchema = z.object({
    path: z.string().min(1, 'Path is required'),
});

// Step 1: Connection Details Schema
export const WizardStep1Schema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    type: ConnectorTypeSchema,
    config: z.record(z.string(), z.unknown()),
}).superRefine((data, ctx) => {
    if (data.type === 'DATABASE') {
        const result = DatabaseConfigSchema.safeParse(data.config);
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                ctx.addIssue({
                    ...issue,
                    path: ['config', ...issue.path],
                });
            });
        }
    } else if (data.type === 'API') {
        const result = ApiConfigSchema.safeParse(data.config);
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                ctx.addIssue({
                    ...issue,
                    path: ['config', ...issue.path],
                });
            });
        }
    } else if (data.type === 'FILE_SYSTEM') {
        const result = FileSystemConfigSchema.safeParse(data.config);
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                ctx.addIssue({
                    ...issue,
                    path: ['config', ...issue.path],
                });
            });
        }
    }
});

// Step 2: Table Selection Schema
export const TableSelectionSchema = z.object({
    registeredTables: z.array(z.object({
        name: z.string(),
        columns: z.array(z.object({
            name: z.string(),
            dataType: z.string()
        }))
    })).min(1, 'Please select at least one table'),
});

// Combined Schema for final submission
export const CreateConnectorSchema = WizardStep1Schema.merge(TableSelectionSchema);

export type WizardStep1FormValues = z.infer<typeof WizardStep1Schema>;
export type TableSelectionFormValues = z.infer<typeof TableSelectionSchema>;
export type CreateConnectorFormValues = z.infer<typeof CreateConnectorSchema>;
