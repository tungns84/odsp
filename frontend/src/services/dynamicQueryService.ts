import { apiClient } from './api';

interface QueryResponse {
    meta: {
        page: number;
        size: number;
    };
    data: Array<Record<string, any>>;
}

/**
 * Dynamic Query Service
 * 
 * Service for querying data from data endpoints using the backend's dynamic query engine
 */
export const dynamicQueryService = {
    /**
     * Query data from a specific data endpoint
     * 
     * @param dataEndpointId - UUID of the data endpoint
     * @param page - Page number (0-indexed)
     * @param size - Number of records per page
     */
    queryData: (dataEndpointId: string, page = 0, size = 10) =>
        apiClient.get<QueryResponse>(`/api/v1/data/${dataEndpointId}`, {
            params: { page, size }
        }),
};
