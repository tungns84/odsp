import type { AuditLog } from '../types/connector';

export const mockAuditLogs: AuditLog[] = [
    {
        id: '1',
        action: 'CREATED',
        user: 'admin@example.com',
        timestamp: '2023-10-26 10:30:00',
        details: 'Connector created'
    },
    {
        id: '2',
        action: 'UPDATED',
        user: 'admin@example.com',
        timestamp: '2023-10-26 11:15:00',
        details: 'Configuration updated'
    },
    {
        id: '3',
        action: 'APPROVED',
        user: 'manager@example.com',
        timestamp: '2023-10-26 14:20:00',
        details: 'Connector approved for use'
    }
];
