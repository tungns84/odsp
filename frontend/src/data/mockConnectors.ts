import type { Connector } from '../types/connector';

export const mockConnectors: Connector[] = [
    {
        id: '1',
        name: 'PostgreSQL Prod DB',
        type: 'DATABASE',
        status: 'APPROVED',
        createdAt: '2023-10-26',
        config: { host: 'localhost', port: 5432, database: 'production' }
    },
    {
        id: '2',
        name: 'Salesforce API',
        type: 'API',
        status: 'INIT',
        createdAt: '2023-10-25',
        config: { endpoint: 'https://api.salesforce.com', apiKey: '••••••••' }
    },
    {
        id: '3',
        name: 'Google Analytics',
        type: 'API',
        status: 'APPROVED',
        createdAt: '2023-10-24',
        config: { endpoint: 'https://analytics.google.com', apiKey: '••••••••' }
    },
    {
        id: '4',
        name: 'S3 Bucket',
        type: 'FILE_SYSTEM',
        status: 'REJECTED',
        createdAt: '2023-10-23',
        config: { path: '/data/files', bucket: 'my-bucket' }
    },
    {
        id: '5',
        name: 'Stripe Webhooks',
        type: 'API',
        status: 'APPROVED',
        createdAt: '2023-10-22',
        config: { endpoint: 'https://api.stripe.com', apiKey: '••••••••' }
    }
];

// Only approved connectors for wizard
export const approvedConnectors = mockConnectors.filter(c => c.status === 'APPROVED');
