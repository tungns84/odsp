import { APIRequestContext } from '@playwright/test';
import { TEST_TENANT_ID } from '../fixtures/test-data';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
}

/**
 * Create headers with tenant ID
 */
export function createHeaders(additionalHeaders?: Record<string, string>) {
    return {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TEST_TENANT_ID,
        ...additionalHeaders,
    };
}

/**
 * Check if backend is ready
 */
export async function waitForBackend(
    request: APIRequestContext,
    maxRetries = 30,
    delayMs = 1000
): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Try to access the connectors endpoint with test tenant
            const response = await request.get(`${API_BASE_URL}/api/v1/connectors`, {
                headers: createHeaders(),
                timeout: 5000,
            });
            // Accept both 200 (success) and 401/403 (auth issues) as signs backend is up
            if (response.ok() || response.status() === 401 || response.status() === 403) {
                console.log('Backend is ready!');
                return true;
            }
        } catch (error) {
            console.log(`Waiting for backend... (${i + 1}/${maxRetries})`);
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return false;
}

/**
 * Create a connector via API
 */
export async function createConnector(
    request: APIRequestContext,
    connector: {
        name: string;
        type: string;
        config: Record<string, unknown>;
    }
): Promise<ApiResponse> {
    const response = await request.post(`${API_BASE_URL}/api/v1/connectors`, {
        headers: createHeaders(),
        data: connector,
    });

    return {
        status: response.status(),
        data: await response.json(),
    };
}

/**
 * Get all connectors
 */
export async function getConnectors(
    request: APIRequestContext
): Promise<ApiResponse> {
    const response = await request.get(`${API_BASE_URL}/api/v1/connectors`, {
        headers: createHeaders(),
    });

    return {
        status: response.status(),
        data: await response.json(),
    };
}

/**
 * Delete a connector
 */
export async function deleteConnector(
    request: APIRequestContext,
    connectorId: number
): Promise<ApiResponse> {
    const response = await request.delete(
        `${API_BASE_URL}/api/v1/connectors/${connectorId}`,
        {
            headers: createHeaders(),
        }
    );

    return {
        status: response.status(),
        data: response.ok() ? {} : await response.text(),
    };
}

/**
 * Approve a connector
 */
export async function approveConnector(
    request: APIRequestContext,
    connectorId: number
): Promise<ApiResponse> {
    const response = await request.put(
        `${API_BASE_URL}/api/v1/connectors/${connectorId}/approval`,
        {
            headers: createHeaders(),
            data: { status: 'APPROVED' },
        }
    );

    return {
        status: response.status(),
        data: await response.json(),
    };
}

/**
 * Create a data endpoint
 */
export async function createDataEndpoint(
    request: APIRequestContext,
    endpoint: {
        name: string;
        pathAlias: string;
        connectorId: number;
        sourceType: string;
        sourceValue: string;
        description?: string;
    }
): Promise<ApiResponse> {
    const response = await request.post(`${API_BASE_URL}/api/v1/data-endpoints`, {
        headers: createHeaders(),
        data: endpoint,
    });

    return {
        status: response.status(),
        data: await response.json(),
    };
}

/**
 * Get all data endpoints
 */
export async function getDataEndpoints(
    request: APIRequestContext
): Promise<ApiResponse> {
    const response = await request.get(`${API_BASE_URL}/api/v1/data-endpoints`, {
        headers: createHeaders(),
    });

    return {
        status: response.status(),
        data: await response.json(),
    };
}

/**
 * Delete a data endpoint
 */
export async function deleteDataEndpoint(
    request: APIRequestContext,
    endpointId: number
): Promise<ApiResponse> {
    const response = await request.delete(
        `${API_BASE_URL}/api/v1/data-endpoints/${endpointId}`,
        {
            headers: createHeaders(),
        }
    );

    return {
        status: response.status(),
        data: response.ok() ? {} : await response.text(),
    };
}

/**
 * Query data from an endpoint
 */
export async function queryEndpoint(
    request: APIRequestContext,
    pathAlias: string,
    params?: Record<string, string>
): Promise<ApiResponse> {
    const queryString = params
        ? '?' + new URLSearchParams(params).toString()
        : '';
    const response = await request.get(
        `${API_BASE_URL}/api/v1/data/${pathAlias}${queryString}`,
        {
            headers: createHeaders(),
        }
    );

    return {
        status: response.status(),
        data: await response.json(),
    };
}

/**
 * Clean up all test data
 */
export async function cleanupTestData(
    request: APIRequestContext
): Promise<void> {
    try {
        // Get all connectors
        const connectorsResponse = await getConnectors(request);
        if (connectorsResponse.status === 200 && Array.isArray(connectorsResponse.data)) {
            const testConnectors = connectorsResponse.data.filter((c: { name: string }) =>
                c.name.includes('E2E Test') || c.name.includes('connector_')
            );

            // Delete test connectors
            for (const connector of testConnectors) {
                await deleteConnector(request, (connector as { id: number }).id);
            }
        }

        // Get all endpoints
        const endpointsResponse = await getDataEndpoints(request);
        if (endpointsResponse.status === 200 && Array.isArray(endpointsResponse.data)) {
            const testEndpoints = endpointsResponse.data.filter((e: { name: string }) =>
                e.name.includes('E2E Test') || e.name.includes('endpoint_')
            );

            // Delete test endpoints
            for (const endpoint of testEndpoints) {
                await deleteDataEndpoint(request, (endpoint as { id: number }).id);
            }
        }
    } catch (error) {
        console.error('Error cleaning up test data:', error);
    }
}
