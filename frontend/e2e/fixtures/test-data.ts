/**
 * Test data fixtures for E2E tests
 */

export const TEST_TENANT_ID = 'test-tenant';

export const testConnectors = {
    postgres: {
        name: 'E2E Test PostgreSQL',
        type: 'DATABASE',
        config: {
            jdbcUrl: 'jdbc:postgresql://localhost:5432/testdb',
            username: 'testuser',
            password: 'testpass',
            driverClassName: 'org.postgresql.Driver',
        },
    },
    mysql: {
        name: 'E2E Test MySQL',
        type: 'DATABASE',
        config: {
            jdbcUrl: 'jdbc:mysql://localhost:3306/testdb',
            username: 'testuser',
            password: 'testpass',
            driverClassName: 'com.mysql.cj.jdbc.Driver',
        },
    },
};

export const testTables = [
    { name: 'users', schema: 'public' },
    { name: 'products', schema: 'public' },
    { name: 'orders', schema: 'public' },
];

export const testColumns = {
    users: [
        { name: 'id', dataType: 'INTEGER', nullable: false },
        { name: 'email', dataType: 'VARCHAR', nullable: false },
        { name: 'name', dataType: 'VARCHAR', nullable: true },
        { name: 'ssn', dataType: 'VARCHAR', nullable: true },
        { name: 'created_at', dataType: 'TIMESTAMP', nullable: false },
    ],
    products: [
        { name: 'id', dataType: 'INTEGER', nullable: false },
        { name: 'name', dataType: 'VARCHAR', nullable: false },
        { name: 'price', dataType: 'DECIMAL', nullable: false },
        { name: 'description', dataType: 'TEXT', nullable: true },
    ],
    orders: [
        { name: 'id', dataType: 'INTEGER', nullable: false },
        { name: 'user_id', dataType: 'INTEGER', nullable: false },
        { name: 'product_id', dataType: 'INTEGER', nullable: false },
        { name: 'quantity', dataType: 'INTEGER', nullable: false },
        { name: 'total', dataType: 'DECIMAL', nullable: false },
        { name: 'order_date', dataType: 'TIMESTAMP', nullable: false },
    ],
};

export const testDataEndpoint = {
    name: 'E2E Test Users Endpoint',
    pathAlias: 'test-users',
    description: 'Test endpoint for users data',
    sourceType: 'TABLE',
    sourceValue: 'users',
};

export const testMaskingRules = [
    {
        fieldName: 'ssn',
        maskType: 'PARTIAL',
        pattern: 'XXX-XX-####',
    },
    {
        fieldName: 'email',
        maskType: 'PARTIAL',
        pattern: '###@***',
    },
];

export function generateRandomName(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
}

export function createTestConnector(overrides?: Partial<typeof testConnectors.postgres>) {
    return {
        ...testConnectors.postgres,
        name: generateRandomName('connector'),
        ...overrides,
    };
}

export function createTestEndpoint(overrides?: Partial<typeof testDataEndpoint>) {
    return {
        ...testDataEndpoint,
        name: generateRandomName('endpoint'),
        pathAlias: generateRandomName('path').toLowerCase(),
        ...overrides,
    };
}
