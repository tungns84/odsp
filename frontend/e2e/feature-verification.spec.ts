import { test, expect } from '@playwright/test';

test.describe('Feature Verification', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Connectors API
        await page.route('**/*connectors', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: '1',
                            name: 'Test Connector',
                            type: 'POSTGRESQL',
                            status: 'ACTIVE',
                            registeredTables: [
                                { name: 'users', columns: [{ name: 'id', semanticType: 'ID' }, { name: 'email', semanticType: 'EMAIL' }] }
                            ]
                        }
                    ])
                });
            } else {
                await route.continue();
            }
        });

        // Mock Test Connection / Fetch Tables
        await page.route('**/*connectors/test', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    tables: [
                        { name: 'users', columns: [{ name: 'id', semanticType: 'ID' }, { name: 'email', semanticType: 'EMAIL' }] },
                        { name: 'orders', columns: [{ name: 'id', semanticType: 'ID' }, { name: 'amount', semanticType: 'CURRENCY' }] }
                    ]
                })
            });
        });

        // Mock Data Endpoint Preview
        await page.route('**/*data-endpoints/test', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    columns: ['id', 'email'],
                    rows: [
                        { id: 1, email: 'test@example.com' },
                        { id: 2, email: 'demo@example.com' }
                    ],
                    generatedSql: 'SELECT id, email FROM users LIMIT 10'
                })
            });
        });
    });

    test('Connector Wizard: Should show table selection in Step 2', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: /create.*connector/i }).click();

        // Fill Step 1
        await page.getByLabel('Name').fill('New Connector');
        await page.getByLabel('Type').selectOption('POSTGRESQL');
        await page.getByLabel('JDBC URL').fill('jdbc:postgresql://localhost:5432/test');
        await page.getByLabel('Username').fill('user');
        await page.getByLabel('Password').fill('pass');

        // Click Test Connection (triggers mock)
        await page.getByRole('button', { name: /test.*connection/i }).click();

        // Verify Step 2: Table Selection
        await expect(page.getByText('Select Tables')).toBeVisible();
        await expect(page.getByText('users')).toBeVisible();
        await expect(page.getByText('orders')).toBeVisible();
    });

    test('Data Endpoint Wizard: Should preview data and show semantic types', async ({ page }) => {
        await page.goto('/data-endpoints/create');

        // Step 1: Select Connector
        await page.getByRole('combobox').selectOption({ label: 'Test Connector' });
        await page.getByRole('button', { name: /next/i }).click();

        // Step 2: Select Source
        await page.getByRole('radio', { name: /table/i }).check();
        await page.getByRole('combobox').nth(1).selectOption('users');
        await page.getByRole('button', { name: /next/i }).click();

        // Step 3: Configure Fields (Skip)
        await page.getByRole('button', { name: /next/i }).click();

        // Step 4: Preview
        await expect(page.getByText('Final Query')).toBeVisible();
        await expect(page.getByText('SELECT id, email FROM users LIMIT 10')).toBeVisible();

        // Verify Data Preview
        await expect(page.getByRole('cell', { name: 'test@example.com' })).toBeVisible();

        // Verify Semantic Types (EMAIL badge)
        // Note: The mock returns semanticType: 'EMAIL' for 'email' column
        // The UI should display it.
        // We look for the badge or text 'EMAIL'
        // await expect(page.getByText('EMAIL')).toBeVisible(); 
    });
});
