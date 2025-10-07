import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { Grid } from './components/Grid';
import { XrmHelper } from './utils/XrmHelper';
import { WebApi } from './utils/WebApi';
import { Sidebar } from './components/Sidebar';
import { testConfig, validateConfig } from './TestConfig';
test.use({
  storageState: 'auth/user.json'
});

test.beforeEach(async ({ page }) => {
  validateConfig();
  // await page.setViewportSize({ width: 2560, height: 1440 });
  let xrmHelper = new XrmHelper(page);

  await page.goto(testConfig.mdaUrl);

  // Wait for Xrm to be ready
  await xrmHelper.waitForXrmReady();
});
test('4372', {
    tag: [
      '@mda',
      '@core',
      '@regression',
      '@[4372]'
    ]
  }, async ({ page }) => {

  await page.goto(testConfig.mdaUrl)
  await page.getByLabel('Case Management (change area)').click();
  await page.getByText('Reference Data').click();
  await page.getByText('Templates', { exact: true }).click();
  await page.getByText('Templates', { exact: true }).click();
  await page.getByText('Case Document Templates').click();
  await page.getByRole('link', { name: 'Dumping Early Review Doc' }).click();
  await expect(page.getByText('Name')).toBeVisible();
  await expect(page.getByText('Case Category', { exact: true })).toBeVisible();
  await page.getByText('Stage Tag', { exact: true }).click();
});
test.skip('4363', {
    tag: [
      '@mda',
      '@core',
      '@regression',
      '@[4363]'
    ]
  }, async ({ page }) => {

  await page.goto(testConfig.mdaUrl)
  await page.getByText('Case Management', { exact: true }).click();
  await page.getByRole('button', { name: 'Case Management (change area)' }).click();
  await page.getByText('Reference Data').click();
  await page.getByText('Email Templates').click();
  await page.getByRole('link', { name: 'Test' }).click();
  await expect(page.getByText('Name')).toBeVisible();
  await expect(page.getByText('Subject')).toBeVisible();
  await expect(page.getByText('Body', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Test');
  await expect(page.getByRole('textbox', { name: 'Subject' })).toHaveValue('Test');
  await expect(page.locator('#id-1543')).toMatchAriaSnapshot(`
    - heading "TestSave status - Saved" [level=1]:
      - status "Save status - Saved"
    - text: Email Template
    `);
  await page.getByRole('region', { name: 'General' }).click();
  });
  test('4371', {
    tag: [
      '@mda',
      '@core',
      '@regression',
      '@[4371]'
    ]
  }, async ({ page }) => {
 await page.goto(testConfig.mdaUrl)
  await page.getByText('Case Documents').click();
  await page.getByRole('button', { name: 'Edit columns' }).click();
  await page.getByRole('button', { name: 'Add columns' }).click();
  await page.getByText('Document Next Stage').click();
  await page.getByText('Case Lookup').click();
  await page.getByText('Document ID').click();
  await page.getByRole('dialog').getByTitle('Close').click();

  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByRole('button', { name: 'Document Name' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Status Reason' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'SharePoint Document Link' })).toBeVisible();
  await expect(page.getByLabel('Temp custom view for 7be33a3b')).toContainText('Document Next StageDocument Next Stage');
  await expect(page.getByRole('button', { name: 'Case Lookup' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Document ID' })).toBeVisible();

  });
  test('4374', {
    tag: [
      '@mda',
      '@core',
      '@regression',
      '@[4374]'
    ]
  }, async ({ page }) => {

 await page.goto(testConfig.mdaUrl)
 await page.getByText('Case Documents', { exact: true }).click();
 await page.getByRole('button', { name: 'Case Documents: Data Gathering' }).click();
 await page.getByRole('button', { name: 'Case Documents: Data Gathering' }).click();
 await page.getByText('PublishedPublished').click();
 await page.getByText('PublishedPublished').click();

await page.getByText('').nth(2).click();
await page.locator('.ag-cell.ag-cell-not-inline-editing.ag-cell-normal-height.ag-cell-value.ag-cell-focus > .ms-Stack > .ms-Checkbox').click();

await page.getByRole('menuitem', { name: 'Edit' }).click();
await page.getByRole('link', { name: 'TestBundle' }).click();
 await expect(page.locator('h2')).toContainText('Related Documents');
 await expect(page.getByRole('button', { name: 'Document Name' })).toBeVisible();
 await expect(page.getByRole('button', { name: 'Created On' })).toBeVisible();
 await page.getByRole('treegrid', { name: 'Bundle - Related documents' }).click();
 await expect(page.locator('#headerControlsList_3')).toContainText('Case Lookup');
await expect(page.getByText('Document Bundle', { exact: true })).toBeVisible();

  });
