import { test, expect } from '@playwright/test';

import 'dotenv/config';

// Define the configuration interface and load values from environment variables
interface Config {
  appUrl: string; // URL of the application to test
  appName: string; // Name of the application to verify
  /*username: string; // 365 Username for login
  password: string; // 365 Password for login
  tenantId: string; // Tenant ID for the Office 365 account*/
  b2cUsername: string; // B2C Username for login
  b2cPassword: string; // B2C Password for login
  b2cTenantID: string; // Tenant ID for the B2C account
}

// Load configuration values, falling back to defaults if environment variables are not set
const config: Config = {
  appUrl: process.env.APP_URL || 'default_url',
  appName: process.env.APP_NAME || 'default_name',
  /*username: process.env.O365_USERNAME || 'default_username',
  password: process.env.O365_PASSWORD || 'default_password',
  tenantId: process.env.O365_TENANT_ID || 'default_tenant_id',*/
  b2cUsername: process.env.B2C_USERNAME || 'default_username',
  b2cPassword: process.env.B2C_PASSWORD || 'default_password',
  b2cTenantID: process.env.B2C_TENANT_ID || 'default_tenant_id'
};

test('test', async ({ page }) => {
await page.goto(config.appUrl);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
   await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: 'Sign in' }).click(),
  ]);
      await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home"`);
});