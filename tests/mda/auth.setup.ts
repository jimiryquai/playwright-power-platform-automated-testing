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

  await page.goto(testConfig.mdaUrl);
  await loginPage.login(testConfig.username, testConfig.password);

  // Wait for page to be fully loaded after login redirect
  await page.waitForLoadState('load');

  await expect(page).toHaveURL(/dynamics\.com/, { timeout: 10000 });

  // Save auth state
  await page.context().storageState({ path: authFile });
});
