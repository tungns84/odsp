import type { Connector } from '../types/connectorTypes';

export const mockConnectors: Connector[] = [
    {
        id: '1',
        name: 'PostgreSQL Prod DB',
        type: 'DATABASE',
        status: 'APPROVED',
        createdAt: '2023-10-26',
        isActive: true,
        config: { host: 'localhost', port: 5432, database: 'production' }
    },
    {
        id: '2',
        name: 'Salesforce API',
        type: 'API',
        status: 'INIT',
        createdAt: '2023-10-25',
        isActive: true,
        config: { endpoint: 'https://api.salesforce.com', apiKey: '••••••••' }
    },
    {
        id: '3',
        name: 'Google Analytics',
        type: 'API',
        status: 'APPROVED',
        createdAt: '2023-10-24',
        isActive: true,
        config: { endpoint: 'https://analytics.google.com', apiKey: '••••••••' }
    },
    {
        id: '4',
        name: 'S3 Bucket',
        type: 'FILE_SYSTEM',
        status: 'REJECTED',
        createdAt: '2023-10-23',
        isActive: false,
        config: { path: '/data/files', bucket: 'my-bucket' }
    },
    {
        id: '5',
        name: 'Stripe Webhooks',
        type: 'API',
        status: 'APPROVED',
        createdAt: '2023-10-22',
        isActive: true,
        config: { endpoint: 'https://api.stripe.com', apiKey: '••••••••' }
    }
];

// Only approved connectors for wizard
export const approvedConnectors = mockConnectors.filter(c => c.status === 'APPROVED');
