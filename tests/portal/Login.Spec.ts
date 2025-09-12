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



// 3199- To validate User Login: Email and Password entry via login screen
test('3199', async ({ page }) => {
await page.goto(config.appUrl);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.waitForTimeout(1000);
   await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: 'Sign in' }).click(),
  ]);
  await page.waitForTimeout(1000);
      await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home"`);
});


//3206-Invalid verification code
test('3206', async ({ page }) => {
await page.goto(config.appUrl);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#pageHeading')).toMatchAriaSnapshot(`- heading "Sign in to your Trade Remedies Service account"`);
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Send verification code' }).click();
  await page.getByRole('alert', { name: 'Verification code has been' }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByLabel('Verification code has been')).toMatchAriaSnapshot(`- alert "Verification code has been sent to your inbox. Please copy it to the input box below."`);
  await page.getByRole('textbox', { name: 'Verification Code' }).click();
  await page.getByRole('textbox', { name: 'Verification Code' }).fill('qasdsgfdfgdhfj');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Verify code' }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByLabel('The verification code you')).toMatchAriaSnapshot(`- alert "The verification code you have entered does not match our records. Please try again, or request a new code."`);
});

