import { test, expect } from '@playwright/test';
import { testConfig, validateConfig } from '../config/TestConfig';
import { OrganizationPage } from '../pages/OrganizationPage';

test.describe('About Goods Page Test Cases', () => {

  let organizationPage: OrganizationPage;

  test.beforeEach(async ({ page }) => {
    // ARRANGE
    validateConfig();
    organizationPage = new OrganizationPage(page);

    await page.goto(testConfig.portalUrl);

    // Navigate to Create Application
    await page.getByRole('link', { name: 'Create an application' }).click();

    // Complete organization setup using POM
    await organizationPage.completeOrganizationSetup();

    // Navigate to About Goods page
    await page.goto(`${testConfig.portalUrl}/New-Application-About-the-goods/?AppID=41b463cd-1971-f011-95f2-6045bdd0ec76`);
  });
  //Clean data after each test run
  test.afterEach('Delete field inputs', async ({ page }) => {

  });

  test('3323 - Validate About Goods page requires selection', async ({ page }) => {
    // ACT - Try to save without making a selection
    await page.getByRole('link', { name: 'Save and return to tasks' }).click();

    // ASSERT - Check for validation error
    await expect(page.locator('#error-summary')).toBeVisible();
    await expect(page.locator('#error-summary')).toContainText('There is a problem');
    await expect(page.locator('#error-summary')).toContainText('Select yes or no');
  });

  test('3324 - About Goods No journey flow with Yes global goods option', async ({ page }) => {
    // ARRANGE & ACT - Navigate through the No journey
    await page.getByRole('radio', { name: 'No' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Check we're on goods description page
    await expect(page.locator('main')).toContainText('What are the goods that you want investigated?');

    // Fill goods description
    await page.getByRole('textbox', { name: 'Description of goods' }).fill('Testing test case 3324');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Check we're on countries page
    await expect(page.locator('main')).toContainText('Are these goods from all countries?');

    // Select global goods option
    await page.getByRole('radio', { name: 'Yes, the goods are global' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // ASSERT - Should return to main application page
    await expect(page.locator('#mainTitle')).toContainText('Create an application');
  });

  test('3325 - About Goods No journey flow with specific countries option', async ({ page }) => {
    // ARRANGE & ACT - Navigate through No journey
    await page.getByRole('radio', { name: 'No' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Fill goods description
    await page.getByRole('textbox', { name: 'Description of goods' }).fill('Testing test case 3325');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Select specific countries option
    await page.getByRole('radio', { name: 'No, they come from a specific' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Check we're on country selection page
    await expect(page.locator('main')).toContainText('Which countries are the goods from?');

    // Test country selection functionality
    await page.getByRole('combobox', { name: 'Country' }).fill('United');
    await page.getByRole('option', { name: 'United Kingdom of Great' }).click();

    // Verify country was added
    await expect(page.locator('#country-body')).toContainText('Remove');

    // Test duplicate country validation
    await page.getByRole('combobox', { name: 'Country' }).fill('United');
    await page.getByRole('option', { name: 'United Kingdom of Great' }).click();
    await expect(page.locator('#country-error')).toContainText('You have already added this country');

    // Test remove country functionality
    await page.getByRole('link', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#country-error')).toContainText('Add at least one country');

    // Add country back and continue
    await page.getByRole('combobox', { name: 'Country' }).fill('United');
    await page.getByRole('option', { name: 'United Kingdom of Great' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Check we're on investigation type page
    await expect(page.locator('main')).toContainText('What type of trade remedy investigation');

    // Select "I'm not sure" option
    await page.getByRole('radio', { name: 'I\'m not sure' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Check we're on the unsure page
    await expect(page.locator('main')).toContainText('Unsure what type of investigation');
    await expect(page.locator('main')).toContainText('contact@traderemedies.gov.uk');

    // Return to tasks
    await page.getByRole('link', { name: 'Save and return to tasks' }).click();

    // ASSERT - Should return to main application page
    await expect(page.locator('#mainTitle')).toContainText('Create an application');
  });

  // TODO: Implement when unblocked
  test.skip('3326 - About Goods Yes journey validation', async ({ page }) => {
    // BLOCKED - implement when requirements available
  });

  test.skip('3327 - Validate saving applications in draft status', async ({ page }) => {
    // BLOCKED - implement when requirements available  
  });

  test.skip('3330 - Validate upload for invalid files', async ({ page }) => {
    // BLOCKED - implement when requirements available
  });

  test.skip('3331 - Validate metadata tagging for documents', async ({ page }) => {
    // BLOCKED - implement when requirements available
  });

  test.skip('3334 - Validate resubmit application', async ({ page }) => {
    // BLOCKED - implement when requirements available
  });

  // Note: Test 3364 belongs in MDA app tests, not portal tests
});