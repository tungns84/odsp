import { chromium, FullConfig } from '@playwright/test';
import { waitForBackend } from './utils/api-helpers';

/**
 * Global setup for E2E tests
 * Runs once before all test suites
 */
async function globalSetup(config: FullConfig) {
    console.log('Starting global setup...');

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Wait for backend to be ready
        console.log('Waiting for backend to be ready...');
        const backendReady = await waitForBackend(context.request);

        if (!backendReady) {
            console.error('Backend is not ready after waiting!');
            throw new Error('Backend is not available. Please start the backend server.');
        }

        console.log('Backend is ready!');

        // Optional: Check if frontend is accessible
        const baseURL = config.projects[0].use?.baseURL || 'http://localhost:5173';
        console.log(`Checking frontend at ${baseURL}...`);

        try {
            await page.goto(baseURL, { timeout: 10000 });
            console.log('Frontend is accessible!');
        } catch (error) {
            console.log('Frontend check skipped (will be started by webServer config)');
        }

        console.log('Global setup complete!');
    } catch (error) {
        console.error('Global setup failed:', error);
        throw error;
    } finally {
        await context.close();
        await browser.close();
    }
}

export default globalSetup;
