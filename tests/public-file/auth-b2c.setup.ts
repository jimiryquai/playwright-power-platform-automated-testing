import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PortalLoginPage } from '../pages/PortalLoginPage';
import { testConfig, validateConfig } from '../config/TestConfig';

const authFile = 'auth/auth.json';

// Perform login once before all tests
setup('authenticate', async ({ page }) => {
  // ARRANGE - Set up test prerequisites
  validateConfig();
  await page.setViewportSize({ width: 2560, height: 1440 });
  const loginPage = new LoginPage(page);
  const portalLoginPage = new PortalLoginPage(page);

  // ACT - Perform the authentication flow
  await page.goto(testConfig.portalUrl);
  await loginPage.login(testConfig.username, testConfig.password);
  await page.waitForLoadState('networkidle');
  await portalLoginPage.login(testConfig.username, testConfig.password);
  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(3000); // Give B2C time to settle

  // ASSERT - Verify we reached the authenticated page (not stuck in auth loop)
  await expect(page.locator('button:has-text("Sign in")')).not.toBeVisible({ timeout: 10000 });

  // Navigate once more to ensure auth is stable
  await page.goto(testConfig.portalUrl);
  await page.waitForLoadState('networkidle');

  // Save authentication state for reuse
  await page.context().storageState({ path: authFile });
  console.log('Power Pages auth saved successfully');

  // Optional: Take screenshot for debugging
  await page.screenshot({ path: 'portal-login.png' });
});

