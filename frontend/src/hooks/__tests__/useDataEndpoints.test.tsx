import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDataEndpoints } from '../useDataEndpoints';
import { dataEndpointService } from '../../services';

vi.mock('../../services', () => ({
    dataEndpointService: {
        getAll: vi.fn(),
        delete: vi.fn(),
        toggleStatus: vi.fn(),
    },
}));

describe('useDataEndpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads endpoints on mount', async () => {
        const mockEndpoints = [{ id: '1', name: 'Test Endpoint' }];
        (dataEndpointService.getAll as any).mockResolvedValue({ data: mockEndpoints });

        const { result } = renderHook(() => useDataEndpoints());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.endpoints).toEqual(mockEndpoints);
        expect(result.current.error).toBeNull();
    });

    it('deletes an endpoint', async () => {
        const mockEndpoints = [{ id: '1', name: 'Test Endpoint' }];
        (dataEndpointService.getAll as any).mockResolvedValue({ data: mockEndpoints });
        (dataEndpointService.delete as any).mockResolvedValue({});

        const { result } = renderHook(() => useDataEndpoints());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.deleteEndpoint('1');
        });

        expect(result.current.endpoints).toEqual([]);
    });

    it('toggles status', async () => {
        const mockEndpoints = [{ id: '1', name: 'Test Endpoint', status: 'ACTIVE' }];
        (dataEndpointService.getAll as any).mockResolvedValue({ data: mockEndpoints });
        (dataEndpointService.toggleStatus as any).mockResolvedValue({});

        const { result } = renderHook(() => useDataEndpoints());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.toggleStatus('1');
        });

        expect(result.current.endpoints[0].status).toBe('INACTIVE');
    });
});
