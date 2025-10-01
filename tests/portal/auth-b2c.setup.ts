import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { testConfig, validateConfig } from './TestConfig';
import * as fs from 'fs';

const authFile = 'auth/auth.json';

// Perform login once before all tests
setup('authenticate', async ({ page }) => {
  // ARRANGE - Set up test prerequisites
  validateConfig();

  // Create auth directory if it doesn't exist
  if (!fs.existsSync('auth')) {
    fs.mkdirSync('auth');
  }

  const loginPage = new LoginPage(page);
  const portalLoginPage = new PortalLoginPage(page);

  // ACT - Perform the authentication flow
  await page.goto(testConfig.portalUrl);

  // Azure B2C login
  await loginPage.login(testConfig.username, testConfig.password);
  // Wait for B2C to redirect back (wait for portal login form to appear)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 15000 });

  // Portal login
  await portalLoginPage.login(testConfig.username, testConfig.password);
  // Wait for authenticated home page
  await expect(page.getByRole('heading', { name: 'Account Home' })).toBeVisible({ timeout: 15000 });

  // Verify we're NOT in an auth loop (Sign in button should be gone)
  await expect(page.locator('button:has-text("Sign in")')).not.toBeVisible();

  // Save authentication state for reuse
  await page.context().storageState({ path: authFile });
  console.log('Power Pages auth saved successfully');

  // Optional: Take screenshot for debugging
  await page.screenshot({ path: 'portal-login.png' });
});

