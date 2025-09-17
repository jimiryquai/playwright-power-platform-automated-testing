import { test, expect } from '@playwright/test';
import path from 'path';
import 'dotenv/config';

// Define the configuration interface
interface Config {
  appUrl: string;
  appName: string;
  username?: string;
  password?: string;
  tenantId?: string;
  b2cUsername?: string;
  b2cPassword?: string;
  b2cTenantID?: string;
}

// Load configuration values from environment variables
const config: Config = {
  appUrl: process.env.APP_URL || 'https://publicfile-test.tangoromeoalpha.co.uk',
  appName: process.env.APP_NAME || 'TRA Investigations',
  username: process.env.O365_USERNAME,
  password: process.env.O365_PASSWORD,
  tenantId: process.env.O365_TENANT_ID,
  b2cUsername: process.env.B2C_USERNAME,
  b2cPassword: process.env.B2C_PASSWORD,
  b2cTenantID: process.env.B2C_TENANT_ID,
};

// Helper function for login
async function login(page, password: string) {
  await page.goto(`${config.appUrl}/.auth/basicAuth/login`);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(password);
  await page.getByRole('button', { name: 'Submit' }).click();
}

// Test Case: 3609 - IP Registration and Visibility
test('3609', async ({ page }) => {
  await login(page, config.b2cPassword);
  await expect(page.locator('#main-content')).toHaveText(/TRA Investigations/);
  await expect(page.getByLabel('Active Investigations').getByRole('heading')).toHaveText(/Active Investigations/);
  await page.getByRole('row', { name: /No. 1147\/Draft Case New Draft/ }).getByRole('link').nth(2).click();
  await expect(page.locator('h1')).toHaveText(/Start a new registration of interest/);
  await page.getByRole('button', { name: 'Start registration of interest' }).click();
  await expect(page.locator('#mainTitle')).toHaveText(/Start a new registration of interest/);
});

// Test Case: 3635 - External User Representation and Management
test('3635', async ({ page }) => {
  await login(page, config.b2cPassword);
  await expect(page.locator('#main-content')).toHaveText(/TRA Investigations/);
  await expect(page.getByLabel('Active Investigations').getByRole('heading')).toHaveText(/Active Investigations/);
  await page.getByRole('row', { name: /No. 1147\/Draft Case New Draft/ }).getByRole('link').nth(2).click();
  await expect(page.locator('h1')).toHaveText(/Start a new registration of interest/);
  await page.getByRole('button', { name: 'Start registration of interest' }).click();
  await expect(page.locator('#mainTitle')).toHaveText(/Start a new registration of interest/);
});
