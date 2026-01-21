import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConnectors } from '../useConnectors';
import { connectorService } from '../../services';

vi.mock('../../services', () => ({
    connectorService: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        updateApprovalStatus: vi.fn(),
    },
}));

describe('useConnectors', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads connectors on mount', async () => {
        const mockConnectors = [{ id: '1', name: 'Test Connector' }];
        (connectorService.getAll as any).mockResolvedValue({ data: mockConnectors });

        const { result } = renderHook(() => useConnectors());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.connectors).toEqual(mockConnectors);
        expect(result.current.error).toBeNull();
    });

    it('handles load error', async () => {
        (connectorService.getAll as any).mockRejectedValue(new Error('Failed'));

        const { result } = renderHook(() => useConnectors());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
    });

    it('creates a connector', async () => {
        const mockConnector = { id: '1', name: 'New Connector' };
        (connectorService.getAll as any).mockResolvedValue({ data: [] });
        (connectorService.create as any).mockResolvedValue({ data: mockConnector });

        const { result } = renderHook(() => useConnectors());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.createConnector({ name: 'New Connector' } as any);
        });

        expect(result.current.connectors).toContainEqual(mockConnector);
    });

    it('deletes a connector', async () => {
        const mockConnectors = [{ id: '1', name: 'Test Connector' }];
        (connectorService.getAll as any).mockResolvedValue({ data: mockConnectors });
        (connectorService.delete as any).mockResolvedValue({});

        const { result } = renderHook(() => useConnectors());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.deleteConnector('1');
        });

        expect(result.current.connectors).toEqual([]);
    });
});
