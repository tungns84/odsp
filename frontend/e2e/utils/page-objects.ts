import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Connector Management page
 */
export class ConnectorManagementPage {
    readonly page: Page;
    readonly createButton: Locator;
    readonly searchInput: Locator;
    readonly connectorsTable: Locator;
    readonly statsCards: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createButton = page.getByRole('button', { name: /create connector/i });
        this.searchInput = page.getByPlaceholder(/search/i);
        this.connectorsTable = page.locator('table').first();
        this.statsCards = page.locator('[data-testid="stats-card"]');
    }

    async goto() {
        await this.page.goto('/connectors');
        await this.page.waitForLoadState('networkidle');
    }

    async clickCreate() {
        await this.createButton.click();
    }

    async searchConnector(name: string) {
        await this.searchInput.fill(name);
        await this.page.waitForTimeout(500); // Debounce
    }

    async deleteConnector(connectorName: string) {
        const row = this.page.locator('tr', { hasText: connectorName });
        await row.getByRole('button', { name: /delete/i }).click();
        // Confirm deletion if modal appears
        await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click();
    }

    async approveConnector(connectorName: string) {
        const row = this.page.locator('tr', { hasText: connectorName });
        await row.getByRole('button', { name: /approve/i }).click();
    }

    async getConnectorStatus(connectorName: string): Promise<string> {
        const row = this.page.locator('tr', { hasText: connectorName });
        const statusCell = row.locator('td').nth(2); // Assuming status is 3rd column
        return await statusCell.textContent() || '';
    }
}

/**
 * Page Object Model for Connector Creation Wizard
 */
export class ConnectorWizard {
    readonly page: Page;
    readonly nameInput: Locator;
    readonly typeSelect: Locator;
    readonly jdbcUrlInput: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly testConnectionButton: Locator;
    readonly nextButton: Locator;
    readonly saveButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nameInput = page.getByLabel(/name/i);
        this.typeSelect = page.getByLabel(/type/i);
        this.jdbcUrlInput = page.getByLabel(/jdbc url|connection string/i);
        this.usernameInput = page.getByLabel(/username/i);
        this.passwordInput = page.getByLabel(/password/i);
        this.testConnectionButton = page.getByRole('button', {
            name: /test.*connection|test.*next/i,
        });
        this.nextButton = page.getByRole('button', { name: /next/i });
        this.saveButton = page.getByRole('button', { name: /save|create/i });
        this.cancelButton = page.getByRole('button', { name: /cancel/i });
    }

    async fillConnectionDetails(connector: {
        name: string;
        type: string;
        jdbcUrl: string;
        username: string;
        password: string;
    }) {
        await this.nameInput.fill(connector.name);
        await this.typeSelect.selectOption(connector.type);
        await this.jdbcUrlInput.fill(connector.jdbcUrl);
        await this.usernameInput.fill(connector.username);
        await this.passwordInput.fill(connector.password);
    }

    async testConnection() {
        await this.testConnectionButton.click();
        // Wait for success message or table list to appear
        await this.page.waitForTimeout(2000);
    }

    async selectTables(tableNames: string[]) {
        for (const tableName of tableNames) {
            const checkbox = this.page.getByRole('checkbox', {
                name: new RegExp(tableName, 'i'),
            });
            await checkbox.check();
        }
    }

    async clickNext() {
        await this.nextButton.click();
    }

    async clickSave() {
        await this.saveButton.click();
        // Wait for creation to complete
        await this.page.waitForTimeout(1000);
    }

    async cancel() {
        await this.cancelButton.click();
    }
}

/**
 * Page Object Model for Data Endpoint Management page
 */
export class DataEndpointManagementPage {
    readonly page: Page;
    readonly createButton: Locator;
    readonly searchInput: Locator;
    readonly endpointsTable: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createButton = page.getByRole('button', {
            name: /create.*endpoint/i,
        });
        this.searchInput = page.getByPlaceholder(/search/i);
        this.endpointsTable = page.locator('table').first();
    }

    async goto() {
        await this.page.goto('/data-endpoints');
        await this.page.waitForLoadState('networkidle');
    }

    async clickCreate() {
        await this.createButton.click();
    }

    async searchEndpoint(name: string) {
        await this.searchInput.fill(name);
        await this.page.waitForTimeout(500);
    }

    async toggleEndpointStatus(endpointName: string) {
        const row = this.page.locator('tr', { hasText: endpointName });
        await row.getByRole('switch').click();
    }

    async deleteEndpoint(endpointName: string) {
        const row = this.page.locator('tr', { hasText: endpointName });
        await row.getByRole('button', { name: /delete/i }).click();
        await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click();
    }

    async getEndpointStatus(endpointName: string): Promise<string> {
        const row = this.page.locator('tr', { hasText: endpointName });
        const statusCell = row.locator('td').nth(2);
        return await statusCell.textContent() || '';
    }
}

/**
 * Page Object Model for Data Endpoint Creation Wizard
 */
export class DataEndpointWizard {
    readonly page: Page;
    readonly connectorSelect: Locator;
    readonly sourceTypeRadio: Locator;
    readonly tableSelect: Locator;
    readonly sqlEditor: Locator;
    readonly nameInput: Locator;
    readonly pathAliasInput: Locator;
    readonly descriptionInput: Locator;
    readonly nextButton: Locator;
    readonly saveButton: Locator;
    readonly previewButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.connectorSelect = page.getByLabel(/connector/i);
        this.sourceTypeRadio = page.getByRole('radio');
        this.tableSelect = page.getByLabel(/table/i);
        this.sqlEditor = page.locator('.monaco-editor');
        this.nameInput = page.getByLabel(/^name/i);
        this.pathAliasInput = page.getByLabel(/path.*alias|alias/i);
        this.descriptionInput = page.getByLabel(/description/i);
        this.nextButton = page.getByRole('button', { name: /next/i });
        this.saveButton = page.getByRole('button', { name: /save|create/i });
        this.previewButton = page.getByRole('button', { name: /preview/i });
    }

    async selectConnector(connectorName: string) {
        await this.connectorSelect.selectOption({ label: connectorName });
        await this.page.waitForTimeout(500);
    }

    async selectSourceType(type: 'table' | 'sql') {
        const radio = this.page.getByRole('radio', {
            name: new RegExp(type, 'i'),
        });
        await radio.click();
    }

    async selectTable(tableName: string) {
        await this.tableSelect.selectOption({ label: tableName });
    }

    async enterCustomSQL(sql: string) {
        // Monaco editor requires special handling
        await this.sqlEditor.click();
        await this.page.keyboard.type(sql);
    }

    async fillEndpointDetails(details: {
        name: string;
        pathAlias: string;
        description?: string;
    }) {
        await this.nameInput.fill(details.name);
        await this.pathAliasInput.fill(details.pathAlias);
        if (details.description) {
            await this.descriptionInput.fill(details.description);
        }
    }

    async configureMasking(fieldName: string, maskType: string) {
        const fieldRow = this.page.locator('tr', { hasText: fieldName });
        await fieldRow.getByRole('checkbox').check();
        const maskSelect = fieldRow.getByRole('combobox');
        await maskSelect.selectOption(maskType);
    }

    async clickPreview() {
        await this.previewButton.click();
        await this.page.waitForTimeout(1000);
    }

    async clickNext() {
        await this.nextButton.click();
    }

    async clickSave() {
        await this.saveButton.click();
        await this.page.waitForTimeout(1000);
    }
}

/**
 * Page Object Model for Data Explorer page
 */
export class DataExplorerPage {
    readonly page: Page;
    readonly endpointSelect: Locator;
    readonly dataTable: Locator;
    readonly paginationControls: Locator;

    constructor(page: Page) {
        this.page = page;
        this.endpointSelect = page.getByLabel(/endpoint/i);
        this.dataTable = page.locator('table').first();
        this.paginationControls = page.locator('[data-testid="pagination"]');
    }

    async goto() {
        await this.page.goto('/explorer');
        await this.page.waitForLoadState('networkidle');
    }

    async selectEndpoint(endpointName: string) {
        await this.endpointSelect.selectOption({ label: endpointName });
        await this.page.waitForLoadState('networkidle');
    }

    async getTableData(): Promise<string[][]> {
        const rows = await this.dataTable.locator('tbody tr').all();
        const data: string[][] = [];

        for (const row of rows) {
            const cells = await row.locator('td').allTextContents();
            data.push(cells);
        }

        return data;
    }

    async goToPage(pageNumber: number) {
        const pageButton = this.page.getByRole('button', {
            name: pageNumber.toString(),
        });
        await pageButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async sortByColumn(columnName: string) {
        const headerCell = this.dataTable.locator('th', { hasText: columnName });
        await headerCell.click();
        await this.page.waitForTimeout(500);
    }
}
