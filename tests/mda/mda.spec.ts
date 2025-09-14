import { test, expect } from '@playwright/test';
import { XrmHelper } from '../utils/XrmHelper';  // Comment out
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
    // Debug: Log current state
    console.log('=== DEBUG INFO ===');
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());

    // Debug: Check Xrm status in detail
    const xrmStatus = await page.evaluate(() => {
      return {
        xrmExists: typeof window.Xrm !== 'undefined',
        xrmUtility: typeof window.Xrm?.Utility !== 'undefined',
        xrmPage: typeof window.Xrm?.Page !== 'undefined',
        globalContextExists: typeof window.Xrm?.Utility?.getGlobalContext !== 'undefined'
      };
    });
    console.log('Xrm status:', xrmStatus);

    // Debug: Try to get user info with error handling
    const userInfo = await page.evaluate(() => {
      try {
        if (typeof window.Xrm?.Utility?.getGlobalContext !== 'function') {
          return { error: 'getGlobalContext not available' };
        }

        const context = window.Xrm.Utility.getGlobalContext();
        console.log('Context object:', context);

        return {
          userName: context.userSettings?.userName,
          orgName: context.organizationSettings?.uniqueName,
          userSettingsExists: !!context.userSettings,
          orgSettingsExists: !!context.organizationSettings
        };
      } catch (error) {
        return { error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error) };
      }
    });

    console.log('User info result:', userInfo);
    console.log('=== END DEBUG ===');

    // Your original assertions
    expect(userInfo.userName).toBeTruthy();
    expect(userInfo.orgName).toBeTruthy();
  });
});