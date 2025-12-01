import { Page, Locator, expect } from '@playwright/test';

export class ApiKeyManagementPage {
    readonly page: Page;
    readonly generateButton: Locator;
    readonly apiKeyTable: Locator;

    // Generate Modal
    readonly modalTitle: Locator;
    readonly nameInput: Locator;
    readonly expiresAtInput: Locator;
    readonly generateConfirmButton: Locator;
    readonly cancelButton: Locator;

    // Created Modal
    readonly copyButton: Locator;
    readonly closeCreatedButton: Locator;
    readonly rawKeyDisplay: Locator;

    // Delete/Revoke confirmation
    readonly confirmButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.generateButton = page.getByRole('button', { name: /generate api key/i });
        this.apiKeyTable = page.locator('table');

        // Generate Modal
        this.modalTitle = page.getByRole('heading', { level: 2 });
        this.nameInput = page.getByLabel(/key name/i);
        this.expiresAtInput = page.getByLabel(/expiration/i);
        this.generateConfirmButton = page.getByRole('button', { name: /generate/i, exact: true });
        this.cancelButton = page.getByRole('button', { name: /cancel/i });

        // Created Modal
        this.copyButton = page.getByRole('button', { name: /copy/i });
        this.closeCreatedButton = page.getByRole('button', { name: /close/i });
        this.rawKeyDisplay = page.locator('code, pre'); // Assuming key is shown in code block

        // Confirm
        this.confirmButton = page.getByRole('button', { name: /confirm|delete|revoke/i });
    }

    async goto(tenantId: string) {
        // Assuming we navigate via tenant details
        await this.page.goto(`/tenants/${tenantId}?tab=api-keys`);
    }

    async generateApiKey(name: string, expirationDate?: string) {
        await this.generateButton.click();
        await expect(this.modalTitle).toContainText(/generate api key/i);

        await this.nameInput.fill(name);
        if (expirationDate) {
            await this.expiresAtInput.fill(expirationDate);
        }

        await this.generateConfirmButton.click();

        // Wait for created modal
        await expect(this.page.getByText(/api key generated/i)).toBeVisible();
        await expect(this.rawKeyDisplay).toBeVisible();

        // Get the key
        const key = await this.rawKeyDisplay.textContent();

        await this.closeCreatedButton.click();
        return key;
    }

    async revokeApiKey(name: string) {
        const row = this.page.getByRole('row', { name: name });
        await row.getByRole('button', { name: /revoke/i }).click();

        await expect(this.page.getByText(/are you sure/i)).toBeVisible();
        await this.confirmButton.click();
    }

    async deleteApiKey(name: string) {
        const row = this.page.getByRole('row', { name: name });
        await row.getByRole('button', { name: /delete/i }).click();

        await expect(this.page.getByText(/are you sure/i)).toBeVisible();
        await this.confirmButton.click();
    }

    async verifyKeyVisible(name: string) {
        await expect(this.page.getByRole('row', { name: name })).toBeVisible();
    }

    async verifyKeyNotVisible(name: string) {
        await expect(this.page.getByRole('row', { name: name })).not.toBeVisible();
    }

    async verifyStatus(name: string, status: 'ACTIVE' | 'REVOKED' | 'EXPIRED') {
        const row = this.page.getByRole('row', { name: name });
        await expect(row).toContainText(status);
    }
}
