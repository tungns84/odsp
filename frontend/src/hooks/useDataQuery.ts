import { useState, useCallback } from 'react';
import { dataEndpointService } from '../services';

interface PaginationState {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

interface UseDataQueryReturn {
    data: any[];
    columns: string[];
    loading: boolean;
    error: string | null;
    pagination: PaginationState;
    fetchData: (endpointId: string, page: number, pageSize: number) => Promise<void>;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    reset: () => void;
}

export const useDataQuery = (): UseDataQueryReturn => {
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pagination, setPaginationState] = useState<PaginationState>({
        page: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0
    });

    const setPage = (page: number) => {
        setPaginationState(prev => ({ ...prev, page }));
    };

    const setPageSize = (pageSize: number) => {
        setPaginationState(prev => ({ ...prev, pageSize, page: 0 })); // Reset to first page on size change
    };

    const reset = useCallback(() => {
        setData([]);
        setColumns([]);
        setError(null);
        setPaginationState({
            page: 0,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0
        });
    }, []);

    const fetchData = useCallback(async (endpointId: string, page: number, pageSize: number) => {
        if (!endpointId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await dataEndpointService.queryData(endpointId, page, pageSize);
            const responseData = response.data;

            setData(responseData.data);
            setPaginationState(prev => ({
                ...prev,
                page,
                pageSize,
                totalElements: responseData.totalElements,
                totalPages: responseData.totalPages
            }));

            if (responseData.data.length > 0) {
                setColumns(Object.keys(responseData.data[0]));
            } else {
                setColumns([]);
            }
        } catch (err: any) {
            console.error('Failed to query data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data. Ensure the endpoint is active and query is valid.');
            setData([]);
            setColumns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        data,
        columns,
        loading,
        error,
        pagination,
        fetchData,
        setPage,
        setPageSize,
        reset
    };
};
