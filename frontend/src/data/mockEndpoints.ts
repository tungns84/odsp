import type { DataEndpoint } from '../types/dataEndpoint';

export const mockEndpoints: DataEndpoint[] = [
    {
        id: '1',
        name: 'users-active',
        description: 'Active users from production database',
        connectorId: '1',
        queryConfig: {
            type: 'table',
            tableName: 'users',
            columns: ['id', 'name', 'email', 'created_at'],
            filters: [{ field: 'status', operator: '=', value: 'active' }],
            sortOrder: { field: 'created_at', direction: 'DESC' }
        },
        status: 'ACTIVE',
        createdAt: '2023-10-26'
    },
    {
        id: '2',
        name: 'orders-recent',
        description: 'Recent orders from last 30 days',
        connectorId: '1',
        queryConfig: {
            type: 'customSQL',
            sqlQuery: 'SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 30 DAY'
        },
        status: 'ACTIVE',
        createdAt: '2023-10-25'
    },
    {
        id: '3',
        name: 'analytics-summary',
        description: 'Analytics summary data',
        connectorId: '3',
        queryConfig: {
            type: 'customSQL',
            sqlQuery: 'SELECT * FROM analytics_summary'
        },
        status: 'INACTIVE',
        createdAt: '2023-10-24'
    }
];
