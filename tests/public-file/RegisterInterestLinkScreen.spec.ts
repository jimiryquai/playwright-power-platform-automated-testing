import { test, expect } from '@playwright/test';
import { testConfig } from './TestConfig';

test.use({
  storageState: 'auth/public-file.json'
});

test('4166', async ({ page }) => {
  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('row', { name: 'No. 1147/Draft Case New Draft' }).getByRole('link').nth(2).click();
  await page.getByLabel('Breadcrumb').getByText('Start a new registration of').click();
  await page.getByText('The name of the organisation').click();
  await page.locator('#main-content').click();
  await expect(page.getByRole('button', { name: 'Start registration of interest' })).toBeVisible();
});