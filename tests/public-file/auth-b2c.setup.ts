import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PortalLoginPage } from '../pages/PortalLoginPage';
import { testConfig } from '../config/TestConfig';

const authFile = 'auth/auth.json';

// Perform login once before all tests
setup('authenticate', async ({ page }) => {
  // ARRANGE - Set up test prerequisites
  await page.setViewportSize({ width: 2560, height: 1440 });
  const loginPage = new LoginPage(page);
  const portalLoginPage = new PortalLoginPage(page);

  // ACT - Perform the authentication flow
  await page.goto(testConfig.portalUrl);
  await loginPage.login(testConfig.username, testConfig.password);
  await page.waitForLoadState('networkidle');
  await portalLoginPage.login(testConfig.username, testConfig.password);
  await page.waitForLoadState('networkidle');

  // ASSERT - Verify successful authentication
  await expect(page).toHaveURL(/powerappsportals|trade.*remedies/i);

  // Save authentication state for reuse
  await page.context().storageState({ path: authFile });
  console.log('Power Pages auth saved successfully');

  // Optional: Take screenshot for debugging
  await page.screenshot({ path: 'portal-login.png' });
});

