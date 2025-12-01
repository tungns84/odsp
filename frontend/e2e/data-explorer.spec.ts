import { test, expect } from '@playwright/test';

test.describe('Data Explorer', () => {
    test.beforeEach(async ({ page }) => {
        // Listen to console logs
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // Mock the API response
        // We use a broad pattern to catch requests to both localhost:8080 and proxied requests
        await page.route('**/*data-endpoints', async route => {
            console.log('Route matched: data-endpoints');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify([
                    { id: '1', name: 'Test Endpoint 1' },
                    { id: '2', name: 'Test Endpoint 2' }
                ])
            });
        });

        await page.goto('/explorer');
    });

    test('should load data explorer page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Data Explorer' })).toBeVisible();
        await expect(page.getByText('Query and analyze data from your registered endpoints')).toBeVisible();
    });

    test('should show empty state initially', async ({ page }) => {
        // Wait for endpoints to load (selector becomes enabled)
        await expect(page.getByRole('combobox')).toBeEnabled();

        await expect(page.getByText('Select an Endpoint')).toBeVisible();
        await expect(page.getByText('Choose a data endpoint from the list above to start exploring data.')).toBeVisible();
    });

    test('should have endpoint selector with options', async ({ page }) => {
        const selector = page.getByRole('combobox');
        await expect(selector).toBeVisible();
        await expect(selector).toBeEnabled();

        // Verify options exist
        const options = await selector.locator('option').allTextContents();
        expect(options.length).toBeGreaterThanOrEqual(2); // Default + 2 mocked
        expect(options).toContain('Test Endpoint 1');
    });
});
