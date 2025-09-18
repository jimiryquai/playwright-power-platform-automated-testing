import { test as setup, expect } from '@playwright/test';
import { PublicFileLoginPage } from './pages/PublicFileLoginPage';
import { testConfig, validateConfig } from '../config/TestConfig';
import * as fs from 'fs';

const authFile = 'auth/public-file.json';

setup('authenticate public-file', async ({ page }) => {
    validateConfig();
    // ARRANGE - Set up test prerequisites
    await page.setViewportSize({ width: 2560, height: 1440 });

    // Create auth directory if it doesn't exist
    if (!fs.existsSync('auth')) {
        fs.mkdirSync('auth');
    }

    const loginPage = new PublicFileLoginPage(page);

    // ACT - Perform the authentication flow
    await page.goto(testConfig.azureAppUrl);
    await loginPage.login(testConfig.azurePassword);

    // Give the application time to fully load and authenticate
    await page.waitForTimeout(3000);

    // ASSERT - Verify we reached the authenticated page
    await expect(page).toHaveURL(testConfig.azureAppUrl);

    // Save authentication state for reuse
    await page.context().storageState({ path: authFile });
    console.log('Public File auth saved successfully');
});
