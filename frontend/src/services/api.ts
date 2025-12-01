import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add tenant header interceptor
apiClient.interceptors.request.use((config) => {
    const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
    config.headers['X-Tenant-ID'] = tenantId;
    return config;
});

// Add error handling interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
