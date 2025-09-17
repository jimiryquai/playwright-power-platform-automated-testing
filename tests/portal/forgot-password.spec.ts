import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { testConfig, validateConfig } from '../config/TestConfig';

test.describe('Forgot Password Tests', () => {
  let loginPage: LoginPage;
  let portalLoginPage: PortalLoginPage;

  test.beforeEach(async ({ page }) => {
    // ARRANGE - Set up test prerequisites
    validateConfig();
    await page.setViewportSize({ width: 2560, height: 1440 });
    loginPage = new LoginPage(page);
    portalLoginPage = new PortalLoginPage(page);
    
    // Navigate to the portal and get through Microsoft auth
    await page.goto(testConfig.portalUrl);
    await loginPage.login(testConfig.username, testConfig.password);
    await page.waitForLoadState('networkidle');
    
    // Now we're at the portal login page, but we DON'T login to test forgot password
  });

  test('3205 - Forgot Password - Resend Verification Code Without Email', async ({ page }) => {
    // ARRANGE - Already handled in beforeEach

    // ACT - Navigate to forgot password and attempt verification without email
    await portalLoginPage.navigateToForgotPassword();
    await portalLoginPage.sendVerificationCode(); // No email provided

    // ASSERT - Should show email required error
    await expect(page.locator('text=Please enter your Email address')).toBeVisible();
  });

  test('3207 - Forgot Password - Incorrect email address in Forgotten Password page', async ({ page }) => {
    // ARRANGE - Already handled in beforeEach
    const invalidEmail = 'firstname.secondname@traderemedies.gov.uk';

    // ACT - Navigate to forgot password and provide invalid email
    await portalLoginPage.navigateToForgotPassword();
    await portalLoginPage.sendVerificationCode(invalidEmail);

    // ASSERT - Should show invalid email error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });
});