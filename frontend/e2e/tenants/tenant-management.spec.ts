import { test, expect } from '@playwright/test';
import { TenantManagementPage } from '../utils/tenant-page-objects';

test.describe('Tenant Management', () => {
    let tenantPage: TenantManagementPage;

    test.beforeEach(async ({ page }) => {
        tenantPage = new TenantManagementPage(page);
        await tenantPage.goto();
    });

    test('should display tenant list', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /tenant management/i })).toBeVisible();
        await expect(tenantPage.createButton).toBeVisible();
        await expect(tenantPage.searchInput).toBeVisible();
    });

    test('should create a new tenant', async ({ page }) => {
        const tenantName = `Test Tenant ${Date.now()}`;
        const description = 'Created by E2E test';

        await tenantPage.createTenant(tenantName, description);
        await tenantPage.verifyTenantVisible(tenantName);
        await tenantPage.verifyStatus(tenantName, 'ACTIVE');
    });

    test('should edit an existing tenant', async ({ page }) => {
        const tenantName = `Edit Tenant ${Date.now()}`;
        await tenantPage.createTenant(tenantName);

        const newName = `${tenantName} Updated`;
        await tenantPage.editTenant(tenantName, newName);

        await tenantPage.verifyTenantVisible(newName);
        await tenantPage.verifyTenantNotVisible(tenantName);
    });

    test('should toggle tenant status', async ({ page }) => {
        const tenantName = `Status Tenant ${Date.now()}`;
        await tenantPage.createTenant(tenantName);

        await tenantPage.verifyStatus(tenantName, 'ACTIVE');
        await tenantPage.toggleStatus(tenantName);
        await tenantPage.verifyStatus(tenantName, 'INACTIVE');

        await tenantPage.toggleStatus(tenantName);
        await tenantPage.verifyStatus(tenantName, 'ACTIVE');
    });

    test('should search for tenants', async ({ page }) => {
        const uniqueId = Date.now();
        const tenant1 = `Search Tenant A ${uniqueId}`;
        const tenant2 = `Search Tenant B ${uniqueId}`;

        await tenantPage.createTenant(tenant1);
        await tenantPage.createTenant(tenant2);

        await tenantPage.searchInput.fill('Tenant A');
        await tenantPage.verifyTenantVisible(tenant1);
        await tenantPage.verifyTenantNotVisible(tenant2);

        await tenantPage.searchInput.fill('');
        await tenantPage.verifyTenantVisible(tenant1);
        await tenantPage.verifyTenantVisible(tenant2);
    });

    test('should delete a tenant', async ({ page }) => {
        const tenantName = `Delete Tenant ${Date.now()}`;
        await tenantPage.createTenant(tenantName);

        await tenantPage.deleteTenant(tenantName);
        await tenantPage.verifyTenantNotVisible(tenantName);
    });
});
