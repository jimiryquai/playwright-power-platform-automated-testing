import { test, expect } from '@playwright/test';
 
import 'dotenv/config';
 
// Define the configuration interface and load values from environment variables
interface Config {
  appUrl: string; // URL of the application to test
  appName: string; // Name of the application to verify
  username: string; // Username for login
  password: string; // Password for login
  tenantId: string; // Tenant ID for the Office 365 account
}
 
// Load configuration values, falling back to defaults if environment variables are not set
const config: Config = {
  appUrl: process.env.APP_URL || 'default_url',
  appName: process.env.APP_NAME || 'default_name',
  username: process.env.O365_USERNAME || 'default_username',
  password: process.env.O365_PASSWORD || 'default_password',
  tenantId: process.env.O365_TENANT_ID || 'default_tenant_id',
};
 
//const pageTwo = await context.newPage();
 
test('mda', async ({ page }) => {
 

  await page.goto(config.appUrl); // Navigate to the Office 365 login page


    // Enter the username in the login textbox
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill(config.username);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(config.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'Sign in' }).click();
  

  //Snapshot of the Account home page strcture
  await expect(page.locator('main')).toMatchAriaSnapshot(`
    - paragraph:
      - link "Edit profile":
        - /url: /profile
    - heading "Account Home"
    - link "Create an application":
      - /url: /Create-Application-Start/
    - text: or
    - link "Go to the public file to register interest in a case":
      - /url: /public-file
    - heading "Cases you are involved in"
    - table:
      - rowgroup:
        - row "Case Number Case Name Organisation name Role Interested party status":
          - columnheader "Case Number"
          - columnheader "Case Name"
          - columnheader "Organisation name"
          - columnheader "Role"
          - columnheader "Interested party status"
      - rowgroup:
        - row "You are not yet involved in any cases":
          - cell "You are not yet involved in any cases"
    - heading "Your applications"
    - table:
      - rowgroup:
        - row "Reference number Type of case Organisation name Last updated Application status":
          - columnheader "Reference number"
          - columnheader "Type of case"
          - columnheader "Organisation name"
          - columnheader "Last updated"
          - columnheader "Application status"
      - rowgroup:
        - row "You do not have any ongoing applications":
          - cell "You do not have any ongoing applications"
    - separator
    - heading "Do you need help?"
    - paragraph:
      - link "Read the guidance documents":
        - /url: https://www.gov.uk/government/publications/the-uk-trade-remedies-investigations-process
    `);
});