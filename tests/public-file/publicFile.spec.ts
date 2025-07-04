import { test, expect } from '@playwright/test';
import 'dotenv/config';

interface Config {
  appUrl: string;
  appName: string;
  username: string;
  password: string;
  tenantId: string;
}

const config: Config = {
  appUrl: process.env.APP_URL || 'default_url',
  appName: process.env.APP_NAME || 'default_name',
  username: process.env.O365_USERNAME || 'default_username',
  password: process.env.O365_PASSWORD || 'default_password',
  tenantId: process.env.O365_TENANT_ID || 'default_tenant_id',
};

test('Public File', async ({ page }) => {
  await page.goto(config.appUrl);


  // Optional: wait for a known element to confirm login success
  await expect(page.locator('main')).toBeVisible();

  // Snapshot of the Account home page structure
  await expect(page.locator('main')).toMatchAriaSnapshot(`
    - heading "Account Home"
    - link "Create an application":
      - /url: /Create-Application-Start/
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
    - heading "Do you need help?"
    - paragraph:
      - link "Read the guidance documents":
        - /url: https://www.gov.uk/government/publications/the-uk-trade-remedies-investigations-process
  `);
});
