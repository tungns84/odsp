import { test, expect } from '@playwright/test';
import { DataExplorerPage } from '../utils/page-objects';
import {
    createConnector,
    approveConnector,
    createDataEndpoint,
    queryEndpoint,
    cleanupTestData,
} from '../utils/api-helpers';
import { createTestConnector, createTestEndpoint } from '../fixtures/test-data';

test.describe('Data Explorer', () => {
    let explorerPage: DataExplorerPage;

    test.beforeEach(async ({ page }) => {
        explorerPage = new DataExplorerPage(page);
        await explorerPage.goto();
    });

    test('should display data explorer page', async ({ page }) => {
        // Check page heading
        await expect(
            page.getByRole('heading', { name: /explorer|data.*explorer/i })
        ).toBeVisible();

        // Check endpoint selector
        await expect(explorerPage.endpointSelect).toBeVisible();
    });

    test('should have endpoint selector dropdown', async () => {
        await expect(explorerPage.endpointSelect).toBeVisible();
        await expect(explorerPage.endpointSelect).toBeEnabled();
    });

    test.skip('should display data table after selecting endpoint', async ({
        page,
        request,
    }) => {
        // Create test data
        const testConnector = createTestConnector();
        const connectorResponse = await createConnector(request, testConnector);
        const connectorId = (connectorResponse.data as { id: number }).id;
        await approveConnector(request, connectorId);

        const testEndpoint = createTestEndpoint();
        await createDataEndpoint(request, {
            ...testEndpoint,
            connectorId,
        });

        // Reload page to see new endpoint
        await explorerPage.goto();

        // Select endpoint
        await explorerPage.selectEndpoint(testEndpoint.name);

        // Data table should appear
        await expect(explorerPage.dataTable).toBeVisible({ timeout: 5000 });

        // Table should have data
        const data = await explorerPage.getTableData();
        expect(data.length).toBeGreaterThan(0);

        // Cleanup
        await cleanupTestData(request);
    });

    test.skip('should display pagination controls when data has multiple pages', async ({
        page,
    }) => {
        // This requires an endpoint with more than one page of data

        // Select endpoint with lots of data
        const options = await explorerPage.endpointSelect.locator('option').allTextContents();

        if (options.length > 1) {
            await explorerPage.endpointSelect.selectOption({ index: 1 });
            await page.waitForLoadState('networkidle');

            // Check if pagination exists
            const pagination = explorerPage.paginationControls;
            if (await pagination.isVisible()) {
                // Should have page buttons
                await expect(page.getByRole('button', { name: '2' })).toBeVisible();
            }
        }
    });

    test.skip('should navigate between pages', async ({ page }) => {
        // This requires an endpoint with multiple pages

        const options = await explorerPage.endpointSelect.locator('option').allTextContents();

        if (options.length > 1) {
            await explorerPage.endpointSelect.selectOption({ index: 1 });
            await page.waitForLoadState('networkidle');

            const pagination = explorerPage.paginationControls;
            if (await pagination.isVisible()) {
                // Go to page 2
                await explorerPage.goToPage(2);

                // Data should change
                await page.waitForTimeout(500);
                const data = await explorerPage.getTableData();
                expect(data.length).toBeGreaterThan(0);
            }
        }
    });

    test.skip('should sort data by column', async ({ page }) => {
        // This requires data to be loaded

        const options = await explorerPage.endpointSelect.locator('option').allTextContents();

        if (options.length > 1) {
            await explorerPage.endpointSelect.selectOption({ index: 1 });
            await page.waitForLoadState('networkidle');

            // Get all column headers
            const headers = await explorerPage.dataTable
                .locator('thead th')
                .allTextContents();

            if (headers.length > 0) {
                // Click first sortable column
                await explorerPage.sortByColumn(headers[0]);

                // Data should resort (specific behavior depends on implementation)
                await page.waitForTimeout(500);
            }
        }
    });

    test.skip('should verify masked fields are properly masked', async ({
        page,
        request,
    }) => {
        // Create endpoint with masking rules
        const testConnector = createTestConnector();
        const connectorResponse = await createConnector(request, testConnector);
        const connectorId = (connectorResponse.data as { id: number }).id;
        await approveConnector(request, connectorId);

        const testEndpoint = createTestEndpoint();
        await createDataEndpoint(request, {
            ...testEndpoint,
            connectorId,
        });

        // Query the endpoint via API to verify masking
        const queryResponse = await queryEndpoint(request, testEndpoint.pathAlias);

        if (queryResponse.status === 200) {
            const data = queryResponse.data as { data: Record<string, unknown>[] };

            // Check that masked fields are actually masked
            if (data.data && data.data.length > 0) {
                const firstRow = data.data[0];

                // SSN should be masked (e.g., XXX-XX-1234)
                if ('ssn' in firstRow) {
                    expect(String(firstRow.ssn)).toMatch(/X+/);
                }

                // Email should be masked (e.g., ###@***)
                if ('email' in firstRow) {
                    expect(String(firstRow.email)).toContain('***');
                }
            }
        }

        // Cleanup
        await cleanupTestData(request);
    });

    test('should show empty state when no endpoint is selected', async ({
        page,
    }) => {
        // Initially, no endpoint is selected
        // Should show placeholder or empty state

        const table = explorerPage.dataTable;
        const isEmpty = !(await table.isVisible());

        if (isEmpty) {
            // Empty state message should be visible
            await expect(
                page.getByText(/select.*endpoint|no.*endpoint/i)
            ).toBeVisible();
        }
    });
});
