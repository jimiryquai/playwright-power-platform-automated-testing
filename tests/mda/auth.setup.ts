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
      
      await page.goto(testConfig.mdaUrl, { waitUntil: 'load', timeout: 60000 });
      await loginPage.login(testConfig.username, testConfig.password);
      
      // Wait for session to stabilize
      await page.waitForTimeout(5000);
      
      // Check if we landed on an error page
      const currentUrl = page.url();
      if (currentUrl.includes('error/errorhandler.aspx')) {
        throw new Error(`Authentication failed - landed on error page`);
      }

      await expect(page).toHaveURL(/dynamics\.com/, { timeout: 10000 });

      // Wait for Power Platform to be ready
      try {
        await page.waitForFunction(
          () => document.querySelectorAll('[data-id*="sitemap"], [role="tree"], .pa-').length > 0,
          { timeout: 30000 }
        );
      } catch (e) {
        // Continue even if elements not found
      }

      authSuccess = true;

    } catch (error) {
      if (attempts === maxAttempts) {
        throw error;
      }
      await page.reload({ waitUntil: 'load' });
    }
  }

  await page.context().storageState({ path: authFile });
});
