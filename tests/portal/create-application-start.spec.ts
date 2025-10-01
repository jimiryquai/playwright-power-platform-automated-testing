import { test, expect } from '@playwright/test';
import { CreateApplicationStartPage } from './pages/CreateApplicationStartPage';
import { testConfig } from './TestConfig';

// Use saved authentication state
test.use({ storageState: 'auth/auth.json' });

test.describe('Create Application Start Page', () => {
  let createAppStartPage: CreateApplicationStartPage;

  test.beforeEach(async ({ page }) => {
    createAppStartPage = new CreateApplicationStartPage(page);
    await page.goto(testConfig.portalUrl + '/Create-Application-Start');
  });

  test('3321', {
    tag: [
      '@portal',                    // Application tag
      '@core',                      // Feature tag  
      '@regression',               // Test type tag
      '@[3320]'                    // Azure Test Plans Test Case ID
    ]
  }, async ({ page }) => {
    // Step 1: Verify page loads successfully
    await expect(page).toHaveURL(/Create-Application-Start/);
    
    // Step 2: Validate page layout and content
    await createAppStartPage.verifyPageStructure();
    
    // Step 3: Validate Application task page link to Organisation Information
    // Organisation Information should be available (Not started)
    await createAppStartPage.verifyOrganisationInfoTask();
    
    // All other sections must be unavailable (Cannot start yet)
    await createAppStartPage.verifyAboutGoodsTaskLocked();
    await createAppStartPage.verifyDocumentationTasksLocked();
    
    // Click Organisation Information link to start the application
    await createAppStartPage.clickOrganisationInfo();
    
    // Verify navigation to Organisation Information page
    await expect(page).toHaveURL(/New-Application-Organisation-Information/);
  });
});;