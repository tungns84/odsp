import { z } from 'zod';

export const FilterConditionSchema = z.object({
    field: z.string().min(1, 'Field is required'),
    operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN']),
    value: z.string().min(1, 'Value is required'),
});

export const SortConfigSchema = z.object({
    field: z.string().min(1, 'Field is required'),
    direction: z.enum(['ASC', 'DESC']),
});

export const TableQueryConfigSchema = z.object({
    type: z.literal('table'),
    tableName: z.string().min(1, 'Table name is required'),
    columns: z.array(z.string()).min(1, 'At least one column must be selected'),
    filters: z.array(FilterConditionSchema).optional(),
    sortOrder: SortConfigSchema.optional(),
});

export const CustomSQLConfigSchema = z.object({
    type: z.literal('customSQL'),
    sqlQuery: z.string().min(1, 'SQL query is required'),
});

export const QueryConfigSchema = z.discriminatedUnion('type', [
    TableQueryConfigSchema,
    CustomSQLConfigSchema,
]);

export const DataEndpointSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    connectorId: z.string().min(1, 'Connector is required'),
    queryConfig: QueryConfigSchema,
});

export type DataEndpointFormValues = z.infer<typeof DataEndpointSchema>;
