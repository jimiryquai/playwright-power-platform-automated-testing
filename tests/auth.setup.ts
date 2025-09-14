import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import 'dotenv/config';

const authFile = 'auth-state.json';

const config = {
  appUrl: process.env.APP_URL || '',
  username: process.env.O365_USERNAME || '',
  password: process.env.O365_PASSWORD || '',
};

setup('authenticate', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  
  const loginPage = new LoginPage(page);
  
  await page.goto(config.appUrl);
  await loginPage.login(config.username, config.password);
  
  // Minimal verification - just check auth worked
  await expect(page).toHaveURL(/dynamics\.com/);
  
  // Save auth state
  await page.context().storageState({ path: authFile });
});