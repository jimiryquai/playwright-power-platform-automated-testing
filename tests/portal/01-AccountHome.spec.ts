import { test, expect } from '@playwright/test';
import { testConfig, validateConfig } from '../config/TestConfig';

test('Account Home', async ({ page }) => {
  validateConfig();
  await page.goto(testConfig.portalUrl);
  await page.waitForLoadState('networkidle');

  await expect(page.locator('text=Account Home')).toBeVisible();
  await expect(page.locator('text=Edit profile')).toBeVisible();
  await expect(page.locator('text=Create an application')).toBeVisible();
  await expect(page.locator('text=Cases you are involved in')).toBeVisible();
  await expect(page.locator('text=Your applications')).toBeVisible();
});
