import { test, expect } from '@playwright/test';
import { testConfig } from './TestConfig';

test.use({
  storageState: 'auth/public-file.json'
});

test('4157', async ({ page }) => {
  // All your actions must be inside this block

  await page.goto(testConfig.azureAppUrl);
  await expect(page.getByText('Review the public file of our active investigations')).toBeVisible();
  await expect(page.getByText('Select a case to register interest')).toBeVisible();

  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('tab', { name: 'Active Investigations' }).click();

  const columns = ['No.', 'Case', 'Commodity', 'Country', 'Type', 'Initiated', 'Updated'];
  for (const columnName of columns) {
    await page.getByRole('button', { name: columnName }).click();
    await page.waitForTimeout(500);
    const sortedTableRows = page.locator('table tbody tr');
    expect(await sortedTableRows.count()).toBeGreaterThan(0);
  }

  await page.getByRole('tab', { name: 'Completed Investigations' }).click();

  await expect(page.getByRole('button', { name: 'Closed' })).toBeVisible();
  const completedTableRows = page.locator('table tbody tr');
  const rowCountCompleted = await completedTableRows.count();

  if (rowCountCompleted > 0) {
    expect(rowCountCompleted).toBeGreaterThan(0);
  } else {
    await expect(page.getByRole('button', { name: 'Initiated' })).toBeVisible();
  }

  const completedNavTableRows = page.locator('table tbody tr');
  const rowCount = await completedNavTableRows.count();

  if (rowCount > 0) {
    const columnsCompleted = ['No.', 'Case', 'Commodity', 'Country', 'Type', 'Initiated', 'Closed'];
    for (const columnName of columnsCompleted) {
      await page.getByRole('button', { name: columnName }).click();
      await page.waitForTimeout(500);
      expect(await completedNavTableRows.count()).toBeGreaterThan(0);
    }
  }

  // AC5 & AC6: Case links and Register interest functionality
  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('tab', { name: 'Active Investigations' }).click();

  const linkTestTableRows = page.locator('table tbody tr');
  expect(await linkTestTableRows.count()).toBeGreaterThan(0);

  const firstCaseNumberLink = page.locator('table tbody tr:first-child td:nth-child(1) a').first();
  if (await firstCaseNumberLink.count() > 0) {
    const caseNumberHref = await firstCaseNumberLink.getAttribute('href');
    expect(caseNumberHref).toContain('/case/');
  }

  const firstCaseNameLink = page.locator('table tbody tr:first-child td:nth-child(2) a').first();
  if (await firstCaseNameLink.count() > 0) {
    const caseNameHref = await firstCaseNameLink.getAttribute('href');
    expect(caseNameHref).toContain('/case/');
  }

  const registerInterestLinks = page.locator('table tbody tr td a', { hasText: 'Register interest' });
  const registerLinkCount = await registerInterestLinks.count();
  expect(registerLinkCount).toBeGreaterThan(0);

  const firstRegisterLink = registerInterestLinks.first();
  const registerHref = await firstRegisterLink.getAttribute('href');
  expect(registerHref).toContain('registration-of-interest');

  await page.goto(testConfig.azureAppUrl+'case/12344#cases');
  await page.getByRole('heading', { name: '- My new case portal 10dec' }).click();
  await page.getByRole('heading', { name: 'BSG Investigation' }).click();
  await page.getByText('The goods that are the').click();
  await page.getByRole('heading', { name: 'Email Case team' }).click();
  await page.getByText('To take part in this').click();
  await page.getByLabel('Breadcrumb').getByRole('link', { name: 'Home' }).click();
   await page.goto(testConfig.azureAppUrl+'case/12344#cases');
   await page.getByRole('link', { name: 'start a new registration of' }).click();
   await page.getByRole('heading', { name: 'Start a new registration of' }).click();
   await page.getByText('Case: 12344 - my new case').click();
});
