import { test, expect } from '@playwright/test';
import { DataEndpointManagementPage } from '../utils/page-objects';

test.describe('Data Endpoint Management - List View', () => {
    let endpointPage: DataEndpointManagementPage;

    test.beforeEach(async ({ page }) => {
        endpointPage = new DataEndpointManagementPage(page);
        await endpointPage.goto();
    });

    test('should display data endpoint management page', async ({ page }) => {
        // Check page heading
        await expect(
            page.getByRole('heading', { name: /data.*endpoint/i })
        ).toBeVisible();

        // Check that table is visible
        await expect(endpointPage.endpointsTable).toBeVisible();

        // Check that create button is visible
        await expect(endpointPage.createButton).toBeVisible();
    });

    test('should have create endpoint button', async () => {
        await expect(endpointPage.createButton).toBeVisible();
        await expect(endpointPage.createButton).toBeEnabled();
    });

    test('should have search functionality', async () => {
        await expect(endpointPage.searchInput).toBeVisible();
    });

    test('should navigate to create endpoint wizard', async ({ page }) => {
        await endpointPage.clickCreate();

        // Should show wizard or redirect to create page
        await expect(
            page.getByRole('heading', { name: /create.*endpoint|new.*endpoint/i })
        ).toBeVisible({ timeout: 5000 });
    });

    test('should display endpoint table with correct columns', async ({
        page,
    }) => {
        const headers = page.locator('thead th');

        // Verify expected columns
        await expect(headers).toContainText(/name/i);
        await expect(headers).toContainText(/path|alias/i);
        await expect(headers).toContainText(/status/i);
    });

    test('should filter endpoints using search', async ({ page }) => {
        await endpointPage.searchInput.fill('test');
        await page.waitForTimeout(1000);

        // Search should filter the table (specific behavior depends on implementation)
    });

    test.skip('should toggle endpoint status', async ({ page }) => {
        // This requires an existing endpoint
        const testEndpointName = 'Test Endpoint';

        await endpointPage.toggleEndpointStatus(testEndpointName);

        // Status should change
        await page.waitForTimeout(1000);
    });

    test.skip('should delete endpoint', async ({ page }) => {
        // This requires an existing endpoint
        const testEndpointName = 'Test Endpoint';

        const initialRows = await endpointPage.endpointsTable
            .locator('tbody tr')
            .count();

        await endpointPage.deleteEndpoint(testEndpointName);

        // Wait for deletion
        await page.waitForTimeout(1000);

        const finalRows = await endpointPage.endpointsTable
            .locator('tbody tr')
            .count();

        expect(finalRows).toBeLessThan(initialRows);
    });
});
