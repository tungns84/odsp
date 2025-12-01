import { Page, Locator, expect } from '@playwright/test';

export class TenantManagementPage {
    readonly page: Page;
    readonly createButton: Locator;
    readonly searchInput: Locator;
    readonly tenantTable: Locator;

    // Modal elements
    readonly modalTitle: Locator;
    readonly nameInput: Locator;
    readonly descriptionInput: Locator;
    readonly saveButton: Locator;
    readonly cancelButton: Locator;

    // Delete confirmation
    readonly confirmDeleteButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createButton = page.getByRole('button', { name: /create tenant/i });
        this.searchInput = page.getByPlaceholder(/search tenants/i);
        this.tenantTable = page.locator('table');

        // Modal
        this.modalTitle = page.getByRole('heading', { level: 2 });
        this.nameInput = page.getByLabel(/tenant name/i);
        this.descriptionInput = page.getByLabel(/description/i);
        this.saveButton = page.getByRole('button', { name: /create|save/i });
        this.cancelButton = page.getByRole('button', { name: /cancel/i });

        // Delete
        this.confirmDeleteButton = page.getByRole('button', { name: /delete/i, exact: true });
    }

    async goto() {
        await this.page.goto('/tenants');
        await expect(this.page.getByRole('heading', { name: /tenant management/i })).toBeVisible();
    }

    async createTenant(name: string, description: string = '') {
        await this.createButton.click();
        await expect(this.modalTitle).toContainText(/create tenant/i);

        await this.nameInput.fill(name);
        if (description) {
            await this.descriptionInput.fill(description);
        }

        await this.saveButton.click();
        await expect(this.modalTitle).not.toBeVisible();
    }

    async editTenant(oldName: string, newName: string) {
        const row = this.page.getByRole('row', { name: oldName });
        await row.getByRole('button', { name: /edit/i }).click();

        await expect(this.modalTitle).toContainText(/edit tenant/i);
        await this.nameInput.fill(newName);
        await this.saveButton.click();
        await expect(this.modalTitle).not.toBeVisible();
    }

    async deleteTenant(name: string) {
        const row = this.page.getByRole('row', { name: name });
        await row.getByRole('button', { name: /delete/i }).click();

        await expect(this.page.getByText(/are you sure/i)).toBeVisible();
        await this.confirmDeleteButton.click();
    }

    async toggleStatus(name: string) {
        const row = this.page.getByRole('row', { name: name });
        await row.getByRole('button', { name: /toggle status/i }).click();
    }

    async verifyTenantVisible(name: string) {
        await expect(this.page.getByRole('row', { name: name })).toBeVisible();
    }

    async verifyTenantNotVisible(name: string) {
        await expect(this.page.getByRole('row', { name: name })).not.toBeVisible();
    }

    async verifyStatus(name: string, status: 'ACTIVE' | 'INACTIVE') {
        const row = this.page.getByRole('row', { name: name });
        await expect(row).toContainText(status);
    }
}
