export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface SortConfig {
    field: string;
    direction: 'ASC' | 'DESC';
}

export interface FilterCondition {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
    value: string;
}
