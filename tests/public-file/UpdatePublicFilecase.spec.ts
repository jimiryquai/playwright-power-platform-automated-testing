import { test, expect } from '@playwright/test';
import { testConfig } from './TestConfig';
test.use({
  storageState: 'auth/public-file.json'
});

test('4177', async ({ page }) => {
  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('row', { name: 'No. 1147/Draft Case New Draft' }).getByRole('link').nth(2).click();

  await expect(page.getByRole('link', { name: 'Read the guidance documents (' })).toHaveAttribute('href', 'https://www.gov.uk/trade-tariff');
  await page.getByRole('link', { name: '/Draft@traderemedies.gov.uk' }).click();

});

test('4178', async ({ page }) => {
  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('row', { name: 'No. 1147/Draft Case New Draft' }).getByRole('link').nth(2).click();

  await expect(page.getByRole('link', { name: '/Draft@traderemedies.gov.uk' })).toHaveAttribute('href', 'mailto:1147/Draft@traderemedies.gov.uk');

});