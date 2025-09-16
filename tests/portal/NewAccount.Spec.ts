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
  appUrl: process.env.PORTAL_URL || 'default_url',
  appName: process.env.APP_NAME || 'default_name',
  /*username: process.env.O365_USERNAME || 'default_username',
  password: process.env.O365_PASSWORD || 'default_password',
  tenantId: process.env.O365_TENANT_ID || 'default_tenant_id',*/
  b2cUsername: process.env.B2C_USERNAME || 'default_username',
  b2cPassword: process.env.B2C_PASSWORD || 'default_password',
  b2cTenantID: process.env.B2C_TENANT_ID || 'default_tenant_id'
};



//3276-New Account Creation - Invalid Email Format
test('3276', async ({ page }) => {
await page.goto(config.appUrl);
//await page.getByRole('button', { name: 'Sign in' }).click();
await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation"`);
await page.waitForTimeout(1000);
await page.getByRole('link', { name: 'Create an account' }).click();
await expect(page.locator('#pageHeading')).toMatchAriaSnapshot(`- heading "Create your account"`);
await page.waitForTimeout(1000);
await page.getByRole('textbox', { name: 'Email address' }).click();
await page.waitForTimeout(1000);
await page.getByRole('textbox', { name: 'Email address' }).fill('asadsgrthd');
await page.getByRole('button', { name: 'Send verification code' }).click();
});

// 3279-New Account Creation - 2FA Verification with Invalid Code
test('3279', async ({ page }) => {
await page.goto(config.appUrl);
await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation"`);
await page.waitForTimeout(1000);
await page.getByRole('link', { name: 'Create an account' }).click();
await expect(page.locator('#pageHeading')).toMatchAriaSnapshot(`- heading "Create your account"`);
await page.waitForTimeout(1000);
await page.getByRole('textbox', { name: 'Email address' }).click();
await page.waitForTimeout(1000);
await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
await page.getByRole('button', { name: 'Send verification code' }).click();
await expect(page.locator('#emailVerificationCode_label')).toMatchAriaSnapshot(`- text: Verification Code`);
await page.getByRole('textbox', { name: 'Verification Code' }).click();
await page.getByRole('textbox', { name: 'Verification Code' }).fill('fafsfsf');
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Verify code' }).click();
await expect(page.getByLabel('The verification code you')).toMatchAriaSnapshot(`- alert "The verification code you have entered does not match our records. Please try again, or request a new code."`);
await page.waitForTimeout(3000);
});

