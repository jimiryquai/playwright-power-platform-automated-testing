// tests/auth-test-only.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { testConfig, validateConfig } from './TestConfig';

test('AUTH TEST ONLY - verify login works', async ({ page }) => {
  console.log('=== STARTING AUTH TEST ===');
  
  validateConfig();
  
  console.log('URL:', testConfig.mdaUrl);
  console.log('Username:', testConfig.username);
  console.log('Password set:', testConfig.password ? 'YES' : 'NO');

  await page.setViewportSize({ width: 2560, height: 1440 });
  
  const loginPage = new LoginPage(page);

  console.log('Step 1: Going to URL...');
  await page.goto(testConfig.mdaUrl);
  await page.screenshot({ path: 'step1-initial-page.png' });

  console.log('Step 2: Starting login...');
  await loginPage.login(testConfig.username, testConfig.password);
  await page.screenshot({ path: 'step2-after-login.png' });

  console.log('Step 3: Waiting for page to settle...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'step3-settled.png' });

  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());

  // Just check we're on dynamics.com somewhere
  console.log('Step 4: Verifying URL contains dynamics...');
  await expect(page).toHaveURL(/dynamics\.com/);
  
  console.log('✅ AUTH TEST PASSED - We are logged in!');
});