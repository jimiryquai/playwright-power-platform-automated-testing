import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './portal/pages/LoginPage';
import { testConfig, validateConfig } from './config/TestConfig';
import * as fs from 'fs';

const authFile = 'auth/user.json';

setup('authenticate', async ({ page }) => {

  validateConfig();
  await page.setViewportSize({ width: 2560, height: 1440 });

  // Create auth directory if it doesn't exist
  if (!fs.existsSync('auth')) {
    fs.mkdirSync('auth');
  }

  const loginPage = new LoginPage(page);

  await page.goto(testConfig.appUrl);
  await loginPage.login(testConfig.username, testConfig.password);

  // Minimal verification - just check auth worked
  await expect(page).toHaveURL(/dynamics\.com/);

  // Save auth state
  await page.context().storageState({ path: authFile });
  
});