import { test, expect } from '@playwright/test';
import { XrmHelper } from '../../utils/XrmHelper';  // Comment out
import 'dotenv/config';

interface Config {
  appUrl: string;
  appName: string;
  username: string;
  password: string;
  tenantId: string;
}

const config: Config = {
  appUrl: process.env.APP_URL || 'https://jamesryan-dev.crm11.dynamics.com', // Change to your D365 URL
  appName: process.env.APP_NAME || 'Microsoft',
  username: process.env.O365_USERNAME || 'test_user',
  password: process.env.O365_PASSWORD || 'test_pass',
  tenantId: process.env.O365_TENANT_ID || 'test_tenant',
};

test.describe('MDA Tests', () => {
  let xrmHelper: XrmHelper;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    xrmHelper = new XrmHelper(page);
    
    // Go to your actual D365 URL, not microsoft.com
    await page.goto(config.appUrl); // Make sure this is your D365 URL
    
    // Wait for Xrm to be ready
    await xrmHelper.waitForXrmReady();
  });

  test('basic mda test', async ({ page }) => {
    // Now Xrm should be available
    const userInfo = await page.evaluate(() => {
      const context = window.Xrm.Utility.getGlobalContext();
      return {
        userName: context.userSettings.userName,
        orgName: context.organizationSettings.uniqueName,
      };
    });

    expect(userInfo.userName).toBeTruthy();
    expect(userInfo.orgName).toBeTruthy();
  });
});