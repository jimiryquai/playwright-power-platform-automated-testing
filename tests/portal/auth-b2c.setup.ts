import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { testConfig, validateConfig } from './TestConfig';
import * as fs from 'fs';

const authFile = 'auth/auth.json';

setup('authenticate', async ({ page }) => {
  console.log('🔐 Starting authentication...');
  validateConfig();

  const { portalUrl, username, password } = testConfig;

  if (!fs.existsSync('auth')) {
    fs.mkdirSync('auth');
  }

  const loginPage = new LoginPage(page);
  const portalLoginPage = new PortalLoginPage(page);

  console.log('📍 Navigating to:', portalUrl);
  await page.goto(portalUrl, { waitUntil: 'domcontentloaded' });
  console.log('✅ Page loaded');

  console.log('🔑 B2C login...');
  await loginPage.login(username, password);
  console.log('✅ B2C complete');
  
  console.log('⏳ Waiting for portal sign-in button...');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  console.log('✅ Portal form ready');

  console.log('🔑 Portal login...');
  await portalLoginPage.login(username, password);
  console.log('✅ Portal login complete');
  
  console.log('⏳ Waiting for Account Home...');
  await expect(page.getByRole('heading', { name: 'Account Home' })).toBeVisible();
  console.log('✅ Account Home visible');
  
  await expect(page.locator('button:has-text("Sign in")')).not.toBeVisible();
  console.log('✅ Auth verified');

  await page.context().storageState({ path: authFile });
  console.log('💾 Auth state saved');

  await page.screenshot({ path: 'portal-login.png' });
});