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

test('4141', async ({ page }) => {
  await page.goto(testConfig.mdaUrl);
  await page.getByRole('treeitem', { name: 'Home' }).locator('div').nth(3).click();
  await page.getByText('Representatives').click();
  await page.getByRole('link', { name: 'Shripriya Poomandalam' }).first().click();
  await page.getByRole('textbox', { name: 'Representative Name' }).click();
  await page.getByText('Representative Name').click();
  await page.getByText('Role').click();
  await page.locator('.fui-Dropdown').click();
  // await page.getByText('Interested Party', { exact: true }).click();
  // await page.getByRole('list', { name: 'Interested Party' }).click();
  await page.getByText('Representative Contact', { exact: true }).click();
  await page.getByRole('combobox', { name: 'Role' }).click();
  await page.getByRole('option', { name: 'External Party' }).click();
  await expect(page.getByRole('textbox', { name: 'Role Text' })).toBeEmpty();
  await page.getByText('Interested Party', { exact: true }).click();
  await page.getByText('Interested Party', { exact: true }).click();
  await page.getByText('Representative Contact*').click();
  await page.getByText('Authorised').click();
  await page.getByRole('combobox', { name: 'Role' }).click();
  await page.getByRole('option', { name: 'Employee' }).click();
  await page.locator('div').filter({ hasText: /^Active$/ }).first().click();
  await page.getByText('Status Reason').click();
  await page.getByText('ActiveStatus ReasonDP#').click();
  await expect(page.getByText('Role')).toBeVisible;
});

test('4143', async ({ page }) => {
await page.goto(testConfig.mdaUrl);
  await page.getByText('Representatives').click();
  await expect(page.getByTestId('cg_name')).toMatchAriaSnapshot(`- text: Representative Name`);
  await expect(page.getByTestId('cg_role_')).toMatchAriaSnapshot(`- text: Role`);
  await expect(page.getByTestId('cg_interested_parties_id')).toMatchAriaSnapshot(`- text: Interested Party`);
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- button "Active Representatives": Active Representatives Open popup to change view.`);
  await page.getByRole('button', { name: 'Active Representatives' }).click();
  await page.getByRole('menuitemradio', { name: 'Inactive Representatives' }).click();
  await page.getByRole('button', { name: 'Role' }).click();
  await page.getByRole('button', { name: 'Role' }).click();
  await expect(page.getByTestId('cg_interested_parties_id')).toMatchAriaSnapshot(`- text: Interested Party`);
  await expect(page.getByTestId('cg_role_')).toMatchAriaSnapshot(`- text: Role`);
  await expect(page.getByTestId('cg_name')).toMatchAriaSnapshot(`- text: Representative Name`);
});