export type SourceType = 'table' | 'customSQL';

export interface FilterCondition {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
    value: string;
}

export interface SortConfig {
    field: string;
    direction: 'ASC' | 'DESC';
}

export type QueryMode = 'BUILDER' | 'SQL';

export interface JoinDefinition {
    type: 'INNER' | 'LEFT' | 'RIGHT';
    table: string;
    on: string;
}

export interface ColumnDefinition {
    table: string;
    name: string;
    alias?: string;
}

export interface SortDefinition {
    field: string;
    direction: 'ASC' | 'DESC';
}

export interface BuilderQueryConfig {
    mode: 'BUILDER';
    rootTable: string;
    joins?: JoinDefinition[];
    columns?: ColumnDefinition[];
    filters?: FilterCondition[];
    sort?: SortDefinition[];
    limit?: number;
}

export interface SqlQueryConfig {
    mode: 'SQL';
    sql: string;
    params?: any[];
}

export type QueryConfig = BuilderQueryConfig | SqlQueryConfig;

export interface DataEndpoint {
    id: string;
    name: string;
    description?: string;
    connectorId: string;
    connector?: {
        id: string;
        name: string;
        type: string;
    };
    queryConfig?: QueryConfig;
    pathAlias?: string;
    targetResource?: string;
    allowedMethods?: string;
    isPublic?: boolean;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

// Wizard state interface
export interface WizardState {
    currentStep: number;
    selectedConnectorId: string | null;
    sourceType: SourceType;
    // Table mode
    tableName: string;
    selectedColumns: string[];
    filters: FilterCondition[];
    sortOrder: SortConfig | null;
    // Custom SQL mode
    customSQL: string;
    // Masking
    maskingConfig: ColumnMaskingConfig;
    // Finalize
    endpointName: string;
    description: string;
}

// Masking configuration
export type MaskingType = 'NONE' | 'MASK_ALL' | 'PARTIAL';

export interface MaskingRule {
    type: MaskingType;
    pattern?: string; // For PARTIAL masking (e.g., regex pattern)
}

export interface ColumnMaskingConfig {
    [columnName: string]: MaskingRule;
}
