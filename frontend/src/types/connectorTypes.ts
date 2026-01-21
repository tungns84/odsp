export type SemanticType =
    | 'UUID' | 'ID' | 'EMAIL' | 'URL' | 'IMAGE_URL'
    | 'CURRENCY' | 'DATE' | 'DATETIME' | 'TIMESTAMP' | 'TIME'
    | 'CITY' | 'COUNTRY' | 'LATITUDE' | 'LONGITUDE'
    | 'STATUS' | 'CATEGORY' | 'TEXT' | 'NUMBER' | 'BOOLEAN';

export type Visibility = 'EVERYWHERE' | 'VISIBLE' | 'HIDDEN';

export interface ColumnFormatting {
    currency?: string;
    decimals?: number;
    format?: string;
    timezone?: string;
}

export interface ColumnMetadata {
    name: string;
    displayName?: string;
    dataType: string;
    semanticType?: SemanticType;
    visibility?: Visibility;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    formatting?: ColumnFormatting;
}

export interface TableMetadata {
    name: string;
    displayName?: string;
    visibility?: Visibility;
    lastSyncedAt?: string;
    columns: ColumnMetadata[];
}

export interface ViewInfo {
    host: string;
    port: number;
    schema: string;
    username: string;
    databaseName: string;
}

export interface ConnectorSummary {
    id: string;
    name: string;
    type: 'DATABASE' | 'API' | 'FILE_SYSTEM';
    status: 'INIT' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    isActive: boolean;
}

export interface Connector extends ConnectorSummary {
    config?: Record<string, unknown>;
    registeredTables?: TableMetadata[];
    viewInfo?: ViewInfo;
}

export interface ConnectorStats {
    total: number;
    active: number;
    pendingApproval: number;
}

export interface ConnectorFilters {
    search: string;
    type: string;
    status: string;
    createdDate: string;
}

export interface AuditLog {
    id: string;
    action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED';
    user: string;
    timestamp: string;
    details: string;
}
