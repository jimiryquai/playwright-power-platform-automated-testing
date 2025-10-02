import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { testConfig, validateConfig } from './TestConfig';
import * as fs from 'fs';

const authFile = 'auth/auth.json';

setup('authenticate', async ({ page }) => {
  validateConfig();

  // Destructure config values upfront
  const { portalUrl, username, password } = testConfig;

  if (!fs.existsSync('auth')) {
    fs.mkdirSync('auth');
  }

  const loginPage = new LoginPage(page);
  const portalLoginPage = new PortalLoginPage(page);

  // Navigate to portal (uses navigationTimeout from config: 60s)
  await page.goto(portalUrl, { waitUntil: 'domcontentloaded' });

  // Azure B2C login
  await loginPage.login(username, password);
  
  // Wait for portal sign-in button to appear (uses expect.timeout from config: 30s)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

  // Portal login
  await portalLoginPage.login(username, password);
  
  // Wait for authenticated home page (uses expect.timeout from config: 30s)
  await expect(page.getByRole('heading', { name: 'Account Home' })).toBeVisible();

  // Verify we're NOT in an auth loop
  await expect(page.locator('button:has-text("Sign in")')).not.toBeVisible();

  // Save authentication state for reuse
  await page.context().storageState({ path: authFile });
  console.log('Power Pages auth saved successfully');

  // Optional: Take screenshot for debugging
  await page.screenshot({ path: 'portal-login.png' });
});
