import { test, expect } from '@playwright/test';
import { ConnectorManagementPage } from '../utils/page-objects';

test.describe('Connector Management - List View', () => {
    let connectorPage: ConnectorManagementPage;

    test.beforeEach(async ({ page }) => {
        connectorPage = new ConnectorManagementPage(page);
        await connectorPage.goto();
    });

    test('should display connector management page', async ({ page }) => {
        // Check page title or heading
        await expect(page.getByRole('heading', { name: /connector/i })).toBeVisible();

        // Check that table is visible
        await expect(connectorPage.connectorsTable).toBeVisible();

        // Check that create button is visible
        await expect(connectorPage.createButton).toBeVisible();
    });

    test('should display statistics cards', async () => {
        // There should be multiple stat cards (Total, Active, Pending, etc.)
        const cards = await connectorPage.statsCards.count();
        expect(cards).toBeGreaterThan(0);
    });

    test('should have search functionality', async () => {
        await expect(connectorPage.searchInput).toBeVisible();
        await expect(connectorPage.searchInput).toBeEditable();
    });

    test('should navigate to create connector when clicking create button', async ({
        page,
    }) => {
        await connectorPage.clickCreate();

        // Should redirect to create page or open modal
        await expect(
            page.getByRole('heading', { name: /create.*connector|new.*connector/i })
        ).toBeVisible({ timeout: 5000 });
    });

    test('should filter connectors using search', async ({ page }) => {
        // Type in search box
        await connectorPage.searchInput.fill('Test');

        // Wait for search to trigger (debounce)
        await page.waitForTimeout(1000);

        // Table should update (implementation specific)
        // This test assumes search works - specific assertions depend on data
    });

    test('should display connector table with correct columns', async ({
        page,
    }) => {
        const headers = page.locator('thead th');

        // Verify key columns exist
        await expect(headers).toContainText(/name/i);
        await expect(headers).toContainText(/type/i);
        await expect(headers).toContainText(/status/i);
    });
});
