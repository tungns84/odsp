import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDataQuery } from '../useDataQuery';
import { dataEndpointService } from '../../services';

vi.mock('../../services', () => ({
    dataEndpointService: {
        queryData: vi.fn(),
    },
}));

describe('useDataQuery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useDataQuery());

        expect(result.current.data).toEqual([]);
        expect(result.current.columns).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.pagination).toEqual({
            page: 0,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0
        });
    });

    it('fetches data successfully', async () => {
        const mockResponse = {
            data: {
                data: [{ id: 1, name: 'Test' }],
                totalElements: 1,
                totalPages: 1
            }
        };
        (dataEndpointService.queryData as any).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useDataQuery());

        await act(async () => {
            await result.current.fetchData('endpoint-1', 0, 10);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual(mockResponse.data.data);
        expect(result.current.columns).toEqual(['id', 'name']);
        expect(result.current.pagination).toEqual({
            page: 0,
            pageSize: 10,
            totalElements: 1,
            totalPages: 1
        });
    });

    it('handles fetch error', async () => {
        (dataEndpointService.queryData as any).mockRejectedValue(new Error('Failed'));

        const { result } = renderHook(() => useDataQuery());

        await act(async () => {
            await result.current.fetchData('endpoint-1', 0, 10);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeTruthy();
        expect(result.current.data).toEqual([]);
    });

    it('updates pagination', () => {
        const { result } = renderHook(() => useDataQuery());

        act(() => {
            result.current.setPage(2);
        });
        expect(result.current.pagination.page).toBe(2);

        act(() => {
            result.current.setPageSize(20);
        });
        expect(result.current.pagination.pageSize).toBe(20);
        expect(result.current.pagination.page).toBe(0); // Should reset to 0
    });

    it('resets state', () => {
        const { result } = renderHook(() => useDataQuery());

        act(() => {
            result.current.setPage(2);
            result.current.reset();
        });

        expect(result.current.pagination.page).toBe(0);
        expect(result.current.data).toEqual([]);
    });
});
