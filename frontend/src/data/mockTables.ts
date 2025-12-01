// Mock database tables
export const mockTables = [
    'users',
    'orders',
    'products',
    'customers',
    'transactions',
    'categories',
    'inventory',
    'payments'
];

// Mock columns for each table
export const mockTableColumns: Record<string, string[]> = {
    users: ['id', 'name', 'email', 'status', 'created_at', 'updated_at'],
    orders: ['id', 'user_id', 'total', 'status', 'created_at', 'updated_at'],
    products: ['id', 'name', 'price', 'category_id', 'stock', 'created_at'],
    customers: ['id', 'name', 'email', 'phone', 'address', 'created_at'],
    transactions: ['id', 'order_id', 'amount', 'payment_method', 'status', 'created_at'],
    categories: ['id', 'name', 'description', 'parent_id'],
    inventory: ['id', 'product_id', 'quantity', 'warehouse', 'updated_at'],
    payments: ['id', 'transaction_id', 'amount', 'status', 'created_at']
};
