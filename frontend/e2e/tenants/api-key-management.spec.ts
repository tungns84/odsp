import { test, expect } from '@playwright/test';
import { TenantManagementPage } from '../utils/tenant-page-objects';
import { ApiKeyManagementPage } from '../utils/api-key-page-objects';

test.describe('API Key Management', () => {
    let tenantPage: TenantManagementPage;
    let apiKeyPage: ApiKeyManagementPage;
    let tenantName: string;

    test.beforeEach(async ({ page }) => {
        tenantPage = new TenantManagementPage(page);
        apiKeyPage = new ApiKeyManagementPage(page);

        // Create a tenant for testing
        tenantName = `API Key Test Tenant ${Date.now()}`;
        await tenantPage.goto();
        await tenantPage.createTenant(tenantName, 'Tenant for API Key testing');

        // Navigate to API Keys via the Manage Keys button
        const row = page.getByRole('row', { name: tenantName });
        await row.getByRole('button', { name: /manage api keys/i }).click();

        // Verify we are on the correct page/tab
        await expect(page.getByRole('heading', { name: /api keys/i })).toBeVisible();
    });

    test('should generate a new API key', async ({ page }) => {
        const keyName = 'Test Key 1';
        const rawKey = await apiKeyPage.generateApiKey(keyName);

        expect(rawKey).toBeTruthy();
        expect(rawKey).toContain('ldop_sk_');

        await apiKeyPage.verifyKeyVisible(keyName);
        await apiKeyPage.verifyStatus(keyName, 'ACTIVE');
    });

    test('should revoke an API key', async ({ page }) => {
        const keyName = 'Revoke Test Key';
        await apiKeyPage.generateApiKey(keyName);

        await apiKeyPage.revokeApiKey(keyName);
        await apiKeyPage.verifyStatus(keyName, 'REVOKED');
    });

    test('should delete an API key', async ({ page }) => {
        const keyName = 'Delete Test Key';
        await apiKeyPage.generateApiKey(keyName);

        await apiKeyPage.deleteApiKey(keyName);
        await apiKeyPage.verifyKeyNotVisible(keyName);
    });

    test('should display security warning', async ({ page }) => {
        await apiKeyPage.generateButton.click();
        await expect(page.getByText(/save this key/i)).toBeVisible();
        await apiKeyPage.cancelButton.click();
    });
});
