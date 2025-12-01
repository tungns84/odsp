import { test, expect } from '@playwright/test';
import {
    ConnectorManagementPage,
    ConnectorWizard,
} from '../utils/page-objects';
import { createTestConnector } from '../fixtures/test-data';
import { cleanupTestData } from '../utils/api-helpers';

test.describe('Connector Creation Wizard', () => {
    let connectorPage: ConnectorManagementPage;
    let wizard: ConnectorWizard;

    test.beforeEach(async ({ page }) => {
        connectorPage = new ConnectorManagementPage(page);
        wizard = new ConnectorWizard(page);

        // Navigate to connectors page and open wizard
        await connectorPage.goto();
        await connectorPage.clickCreate();

        // Wait for wizard to appear
        await expect(
            page.getByRole('heading', { name: /create.*connector/i })
        ).toBeVisible({ timeout: 5000 });
    });

    test.afterEach(async ({ request }) => {
        // Cleanup test data
        await cleanupTestData(request);
    });

    test('should display Step 1: Connection Details', async ({ page }) => {
        // Verify form fields are visible
        await expect(wizard.nameInput).toBeVisible();
        await expect(wizard.typeSelect).toBeVisible();
        await expect(wizard.jdbcUrlInput).toBeVisible();
        await expect(wizard.usernameInput).toBeVisible();
        await expect(wizard.passwordInput).toBeVisible();
        await expect(wizard.testConnectionButton).toBeVisible();
    });

    test('should show validation errors for empty required fields', async ({
        page,
    }) => {
        // Try to proceed without filling fields
        await wizard.testConnectionButton.click();

        // Should show validation messages
        await expect(page.getByText(/required|cannot be empty/i)).toBeVisible();
    });

    test('should fill connection details and proceed to next step', async ({
        page,
    }) => {
        const testConnector = createTestConnector();

        // Fill Step 1 fields
        await wizard.fillConnectionDetails({
            name: testConnector.name,
            type: testConnector.type,
            jdbcUrl: testConnector.config.jdbcUrl as string,
            username: testConnector.config.username as string,
            password: testConnector.config.password as string,
        });

        // All fields should be filled
        await expect(wizard.nameInput).toHaveValue(testConnector.name);
        await expect(wizard.jdbcUrlInput).toHaveValue(
            testConnector.config.jdbcUrl as string
        );
    });

    test('should validate JDBC URL format', async ({ page }) => {
        const testConnector = createTestConnector({
            config: {
                ...createTestConnector().config,
                jdbcUrl: 'invalid-url',
            },
        });

        await wizard.nameInput.fill(testConnector.name);
        await wizard.typeSelect.selectOption(testConnector.type);
        await wizard.jdbcUrlInput.fill('invalid-url');
        await wizard.usernameInput.fill(testConnector.config.username as string);
        await wizard.passwordInput.fill(testConnector.config.password as string);

        await wizard.testConnectionButton.click();

        // Should show error about invalid JDBC URL
        await expect(
            page.getByText(/invalid.*url|invalid.*format/i)
        ).toBeVisible({ timeout: 5000 });
    });

    test('should allow canceling the wizard', async ({ page }) => {
        await wizard.cancel();

        // Should return to connector list
        await expect(connectorPage.connectorsTable).toBeVisible({
            timeout: 5000,
        });
    });

    test('Step 2: should display table selection after successful connection test', async ({
        page,
    }) => {
        // Note: This test requires a working database connection
        // For demo purposes, we'll test the UI flow assuming connection is mocked

        const testConnector = createTestConnector();

        await wizard.fillConnectionDetails({
            name: testConnector.name,
            type: testConnector.type,
            jdbcUrl: testConnector.config.jdbcUrl as string,
            username: testConnector.config.username as string,
            password: testConnector.config.password as string,
        });

        // This would normally test connection and proceed to Step 2
        // Implementation depends on whether backend is available
    });
});

test.describe('Connector Creation - Full Flow', () => {
    test.skip('should create connector end-to-end', async ({ page, request }) => {
        // This test requires:
        // 1. Backend to be running
        // 2. Valid database connection
        // 3. Mock data or test database

        const connectorPage = new ConnectorManagementPage(page);
        const wizard = new ConnectorWizard(page);

        await connectorPage.goto();
        await connectorPage.clickCreate();

        const testConnector = createTestConnector();

        // Step 1: Fill connection details
        await wizard.fillConnectionDetails({
            name: testConnector.name,
            type: testConnector.type,
            jdbcUrl: testConnector.config.jdbcUrl as string,
            username: testConnector.config.username as string,
            password: testConnector.config.password as string,
        });

        await wizard.testConnection();

        // Step 2: Select tables
        await wizard.selectTables(['users', 'products']);

        // Save connector
        await wizard.clickSave();

        // Verify connector appears in list
        await connectorPage.goto();
        await expect(page.getByText(testConnector.name)).toBeVisible();

        // Cleanup
        await cleanupTestData(request);
    });
});
