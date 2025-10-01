import { test, expect } from '@playwright/test';
import { ApplicationStartPage } from './pages/ApplicationStartPage';
import { testConfig } from './TestConfig';

// Use saved authentication state
test.use({ storageState: 'auth/auth.json' });

test.describe('Create Application Start Page', () => {
  let createAppPage: ApplicationStartPage;

  test.beforeEach(async ({ page }) => {
    createAppPage = new ApplicationStartPage(page);
    await page.goto(testConfig.portalUrl + '/Create-Application-Start'); // Adjust URL path as needed
  });

  test('3320', {
    tag: [
      '@portal',                    // Application tag
      '@core',                      // Feature tag  
      '@regression',               // Test type tag
      '@[3320]'                    // Azure Test Plans Test Case ID
    ]
  }, async ({ page }) => {
    // Verify page loads with correct URL
    await expect(page).toHaveURL(/Create-Application-Start/);
    
    // Verify all key structural elements are visible
    await createAppPage.verifyPageStructure();
    
    // Verify key content items
    await createAppPage.verifyKeyContent();
    
    // Verify button is present and enabled
    await expect(createAppPage.startButton).toBeVisible();
    await expect(createAppPage.startButton).toBeEnabled();
    
    // Click the button
    await createAppPage.clickStartApplication();
    
    // Verify navigation to Organisation Information page
    await expect(page).toHaveURL(/New-Application-Organisation-Information/);
  });
});;