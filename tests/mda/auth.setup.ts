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

  // Set user agent to appear like a regular desktop browser
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });


  // Enable browser console logging
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  page.on('pageerror', err => console.log(`Page error: ${err.message}`));

  const loginPage = new LoginPage(page);
  let authSuccess = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!authSuccess && attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`Authentication attempt ${attempts}/${maxAttempts}`);

      // Screenshot before starting
      await page.screenshot({ path: `debug-auth-start-${attempts}.png`, fullPage: true });

      await page.goto(testConfig.mdaUrl, { waitUntil: 'load', timeout: 60000 });
      console.log(`After goto: ${page.url()}`);
      console.log(`Page title after goto: ${await page.title()}`);

      await loginPage.login(testConfig.username, testConfig.password);
      console.log(`After login: ${page.url()}`);

      await page.waitForLoadState('load');

         // Add longer wait for session to stabilize
      await page.waitForTimeout(5000);
      
      console.log(`After waitForLoadState: ${page.url()}`);

      // Check current state
      const currentUrl = page.url();
      const pageTitle = await page.title();
      console.log(`Final URL: ${currentUrl}`);
      console.log(`Final title: ${pageTitle}`);

      // Check if we landed on an error page
      //const currentUrl = page.url();
      if (currentUrl.includes('error/errorhandler.aspx')) {
        throw new Error(`Authentication failed - landed on error page: ${currentUrl}`);
      }

      await expect(page).toHaveURL(/dynamics\.com/, { timeout: 10000 });

      // Wait for Power Platform to be ready
      try {
        await page.waitForFunction(
          () => document.querySelectorAll('[data-id*="sitemap"], [role="tree"], .pa-').length > 0,
          { timeout: 30000 }
        );
        console.log('Power Platform elements detected');
      } catch (e) {
        console.log('No Power Platform elements detected, but continuing...');
      }

      authSuccess = true;
      console.log('Authentication successful');

    } catch (error) {
      await page.screenshot({ path: `debug-auth-failed-${attempts}.png`, fullPage: true });

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`Authentication attempt ${attempts} failed: ${errorMessage}`);
      console.log(`URL on failure: ${page.url()}`);
      console.log(`Title on failure: ${await page.title()}`);

      if (attempts === maxAttempts) {
        throw error;
      }
      console.log('Reloading page for retry...');
      await page.reload({ waitUntil: 'load' });
    }
  }

  await page.context().storageState({ path: authFile });
});