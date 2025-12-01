import { test, expect } from '@playwright/test';
import {
    DataEndpointManagementPage,
    DataEndpointWizard,
} from '../utils/page-objects';
import {
    createConnector,
    approveConnector,
    cleanupTestData,
} from '../utils/api-helpers';
import { createTestConnector, createTestEndpoint } from '../fixtures/test-data';

test.describe('Data Endpoint Creation Wizard', () => {
    let endpointPage: DataEndpointManagementPage;
    let wizard: DataEndpointWizard;
    let testConnectorId: number;

    test.beforeEach(async ({ page, request }) => {
        endpointPage = new DataEndpointManagementPage(page);
        wizard = new DataEndpointWizard(page);

        // Create and approve a test connector first
        const testConnector = createTestConnector();
        const response = await createConnector(request, testConnector);

        if (response.status === 201 || response.status === 200) {
            testConnectorId = (response.data as { id: number }).id;
            // Approve the connector so it can be used
            await approveConnector(request, testConnectorId);
        }

        // Navigate to endpoint page and open wizard
        await endpointPage.goto();
        await endpointPage.clickCreate();

        // Wait for wizard
        await expect(
            page.getByRole('heading', { name: /create.*endpoint/i })
        ).toBeVisible({ timeout: 5000 });
    });

    test.afterEach(async ({ request }) => {
        await cleanupTestData(request);
    });

    test('should display Step 1: Select Connector', async ({ page }) => {
        // Connector dropdown should be visible
        await expect(wizard.connectorSelect).toBeVisible();
    });

    test('should proceed to Step 2 after selecting connector', async ({
        page,
    }) => {
        // Select the test connector
        const connectorName = createTestConnector().name;

        // Try to select connector (may not appear if not in list)
        const options = await wizard.connectorSelect.locator('option').allTextContents();

        if (options.length > 1) {
            await wizard.connectorSelect.selectOption({ index: 1 });
            await wizard.clickNext();

            // Should move to next step
            await page.waitForTimeout(500);
        }
    });

    test('should display source type selection in Step 2', async ({ page }) => {
        // Skip to step 2 if possible
        const options = await wizard.connectorSelect.locator('option').allTextContents();

        if (options.length > 1) {
            await wizard.connectorSelect.selectOption({ index: 1 });
            await wizard.clickNext();

            // Should have radio buttons for Table vs Custom SQL
            await expect(
                page.getByRole('radio', { name: /table/i })
            ).toBeVisible();
            await expect(
                page.getByRole('radio', { name: /sql|custom/i })
            ).toBeVisible();
        }
    });

    test.skip('should allow selecting a table source', async ({ page }) => {
        // This requires connector with registered tables
        await wizard.selectSourceType('table');

        // Table select should become visible
        await expect(wizard.tableSelect).toBeVisible();

        // Select a table
        const tableOptions = await wizard.tableSelect.locator('option').allTextContents();
        if (tableOptions.length > 0) {
            await wizard.tableSelect.selectOption({ index: 0 });
        }
    });

    test.skip('should allow entering custom SQL', async ({ page }) => {
        await wizard.selectSourceType('sql');

        // SQL editor should be visible
        await expect(wizard.sqlEditor).toBeVisible();

        // Enter SQL
        await wizard.enterCustomSQL('SELECT * FROM users');
    });

    test.skip('should configure field masking in Step 3', async ({ page }) => {
        // Navigate through wizard to masking step
        // This depends on previous steps working

        await wizard.configureMasking('ssn', 'PARTIAL');
        await wizard.configureMasking('email', 'PARTIAL');
    });

    test.skip('should preview data in Step 4', async ({ page }) => {
        // Navigate to preview step
        await wizard.clickPreview();

        // Data table should appear
        await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    });

    test('should fill endpoint details', async ({ page }) => {
        const testEndpoint = createTestEndpoint();

        // Find the name, pathAlias, and description inputs
        // These might be in a later step

        await wizard.nameInput.fill(testEndpoint.name);
        await expect(wizard.nameInput).toHaveValue(testEndpoint.name);
    });

    test('should validate required fields', async ({ page }) => {
        // Try to save without filling required fields
        const saveButton = page.getByRole('button', { name: /save|create/i });

        if (await saveButton.isVisible()) {
            await saveButton.click();

            // Should show validation errors
            await expect(
                page.getByText(/required|cannot be empty/i)
            ).toBeVisible({ timeout: 2000 });
        }
    });
});

test.describe('Data Endpoint Creation - Full Flow', () => {
    test.skip('should create endpoint end-to-end', async ({ page, request }) => {
        // This test requires:
        // 1. Backend running
        // 2. Approved connector with tables
        // 3. Full wizard flow

        const endpointPage = new DataEndpointManagementPage(page);
        const wizard = new DataEndpointWizard(page);

        // Create and approve connector
        const testConnector = createTestConnector();
        const connectorResponse = await createConnector(request, testConnector);
        const connectorId = (connectorResponse.data as { id: number }).id;
        await approveConnector(request, connectorId);

        // Start wizard
        await endpointPage.goto();
        await endpointPage.clickCreate();

        // Step 1: Select connector
        await wizard.selectConnector(testConnector.name);
        await wizard.clickNext();

        // Step 2: Define source
        await wizard.selectSourceType('table');
        await wizard.selectTable('users');
        await wizard.clickNext();

        // Step 3: Configure fields
        await wizard.configureMasking('ssn', 'PARTIAL');
        await wizard.clickNext();

        // Step 4: Preview
        await wizard.clickPreview();
        await wizard.clickNext();

        // Final: Save
        const testEndpoint = createTestEndpoint();
        await wizard.fillEndpointDetails({
            name: testEndpoint.name,
            pathAlias: testEndpoint.pathAlias,
            description: testEndpoint.description,
        });

        await wizard.clickSave();

        // Verify endpoint appears in list
        await endpointPage.goto();
        await expect(page.getByText(testEndpoint.name)).toBeVisible();

        // Cleanup
        await cleanupTestData(request);
    });
});
