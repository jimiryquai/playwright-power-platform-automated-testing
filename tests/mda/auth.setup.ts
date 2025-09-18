import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { testConfig, validateConfig } from './TestConfig';
import * as fs from 'fs';

const authFile = 'auth/user.json';

setup('authenticate', async ({ page }) => {
  validateConfig();

  if (!fs.existsSync('auth')) {
    fs.mkdirSync('auth', { recursive: true });
  }

  const loginPage = new LoginPage(page);
  let authSuccess = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!authSuccess && attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`Authentication attempt ${attempts}/${maxAttempts}`);

      await page.goto(testConfig.mdaUrl, { waitUntil: 'load', timeout: 60000 });
      await loginPage.login(testConfig.username, testConfig.password);
      await page.waitForLoadState('load');

      // Check if we landed on an error page
      const currentUrl = page.url();
      if (currentUrl.includes('error/errorhandler.aspx')) {
        throw new Error(`Authentication failed - landed on error page: ${currentUrl}`);
      }

      await expect(page).toHaveURL(/dynamics\.com/, { timeout: 10000 });
      authSuccess = true;
      console.log('Authentication successful');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`Authentication attempt ${attempts} failed:`, errorMessage);
      if (attempts === maxAttempts) {
        throw error;
      }
      await page.reload({ waitUntil: 'load' });
    }
  }

  await page.context().storageState({ path: authFile });
});