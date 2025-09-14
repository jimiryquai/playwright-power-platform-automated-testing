import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import 'dotenv/config';
import * as fs from 'fs';

const authFile = 'auth/user.json';

const config = {
  appUrl: process.env.APP_URL || '',
  username: process.env.O365_USERNAME || '',
  password: process.env.O365_PASSWORD || '',
};

setup('authenticate', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });

  // Create auth directory if it doesn't exist
  if (!fs.existsSync('auth')) {
    fs.mkdirSync('auth');
  }

  const loginPage = new LoginPage(page);

  await page.goto(config.appUrl);
  await loginPage.login(config.username, config.password);
  await page.waitForLoadState('networkidle');

  // Minimal verification - just check auth worked
  await expect(page).toHaveURL(/dynamics\.com/);

  // Save auth state
  await page.context().storageState({ path: authFile });
});