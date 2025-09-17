import { test, expect } from '@playwright/test';
import { XrmHelper } from './utils/XrmHelper';
import { testConfig, validateConfig } from '../config/TestConfig';
import path from 'path';

test.describe('MDA Tests', () => {
  let xrmHelper: XrmHelper;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    xrmHelper = new XrmHelper(page);
    
    await page.goto(testConfig.appUrl);

    // Wait for Xrm to be ready
    await xrmHelper.waitForXrmReady();
  });

  test('basic mda test', async ({ page }) => {

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

    // Your original assertions
    expect(userInfo.userName).toBeTruthy();
    expect(userInfo.orgName).toBeTruthy();
  });
});