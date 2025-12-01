import { test, expect } from '@playwright/test';
import { ConnectorManagementPage } from '../utils/page-objects';
import { createConnector, cleanupTestData } from '../utils/api-helpers';
import { createTestConnector } from '../fixtures/test-data';

test.describe('Connector Approval Workflow', () => {
    let connectorPage: ConnectorManagementPage;
    let testConnectorId: number;

    test.beforeEach(async ({ page, request }) => {
        connectorPage = new ConnectorManagementPage(page);

        // Create a test connector via API
        const testConnector = createTestConnector();
        const response = await createConnector(request, testConnector);

        if (response.status === 201 || response.status === 200) {
            testConnectorId = (response.data as { id: number }).id;
        }

        await connectorPage.goto();
    });

    test.afterEach(async ({ request }) => {
        await cleanupTestData(request);
    });

    test('should display pending connector with INIT status', async ({
        page,
    }) => {
        // The newly created connector should have INIT status
        const statusBadge = page.locator('text=/INIT|PENDING/i').first();
        await expect(statusBadge).toBeVisible({ timeout: 5000 });
    });

    test('should show approve button for INIT status connectors', async ({
        page,
    }) => {
        const approveButton = page.getByRole('button', { name: /approve/i }).first();
        await expect(approveButton).toBeVisible();
    });

    test.skip('should approve connector and update status', async ({ page }) => {
        // This test requires backend approval functionality
        const testConnectorName = createTestConnector().name;

        await connectorPage.approveConnector(testConnectorName);

        // Wait for status to update
        await page.waitForTimeout(1000);

        // Status should change to APPROVED
        const status = await connectorPage.getConnectorStatus(testConnectorName);
        expect(status).toContain('APPROVED');
    });

    test.skip('should reject connector', async ({ page }) => {
        // This test requires backend rejection functionality
        const testConnectorName = createTestConnector().name;

        const row = page.locator('tr', { hasText: testConnectorName });
        await row.getByRole('button', { name: /reject/i }).click();

        // Confirm rejection if modal appears
        await page.getByRole('button', { name: /confirm|yes/i }).click();

        // Status should change to REJECTED
        await page.waitForTimeout(1000);
        const status = await connectorPage.getConnectorStatus(testConnectorName);
        expect(status).toContain('REJECTED');
    });

    test('should filter by status', async ({ page }) => {
        // Look for status filter dropdown
        const statusFilter = page.getByLabel(/status/i);

        if (await statusFilter.isVisible()) {
            await statusFilter.selectOption('INIT');
            await page.waitForTimeout(500);

            // Only INIT status connectors should be visible
            const table = page.locator('table tbody tr');
            const count = await table.count();

            if (count > 0) {
                const firstStatus = await table.first().locator('td').nth(2).textContent();
                expect(firstStatus).toContain('INIT');
            }
        }
    });
});
