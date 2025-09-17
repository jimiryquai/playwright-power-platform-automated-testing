import { test, expect } from '@playwright/test';
import { testConfig, validateConfig } from '../config/TestConfig';

test('Account Home', async ({ page }) => {
  validateConfig();
  await page.goto(testConfig.portalUrl);
  await page.waitForLoadState('networkidle');

  await expect(page.locator('text=Account Home')).toBeVisible();
  await expect(page.locator('text=Edit profile')).toBeVisible();
  await expect(page.locator('text=Create an application')).toBeVisible();
  await expect(page.locator('text=Cases you are involved in')).toBeVisible();
  await expect(page.locator('text=Your applications')).toBeVisible();
});
<<<<<<< HEAD
 
//3320-A1,A10,A12_To validate  Account Home Page  and ability to start a new application for an authenticated external user-GDS

test('3320', async ({ page }) => {
   await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation" [level=1]`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home" [level=1]`);
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Read the guidance documents' }).click();
  const page1 = await page1Promise;
  await expect(page1.locator('#content')).toMatchAriaSnapshot(`- text: Guidance`);
  await expect(page1.locator('h1')).toMatchAriaSnapshot(`- heading "The UK trade remedies investigations process"`);
});


//3321-A2,A11_To validate  'New application' page for creating an application

test('3321', async ({ page }) => {
   await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation"`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home"`);

   await page.getByRole('link', { name: 'Create an application' }).click();
  await expect(page.locator('#mainTitle')).toMatchAriaSnapshot(`- heading "Create an application with the Trade Remedies Authority"`);
  await page.getByRole('link', { name: 'Organisation information' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Details of the organisation that is applying for a new investigation"`);
  await page.getByRole('link', { name: 'Back', exact: true }).click();
  await page.getByText('About the goods').click();
  await expect(page.locator('#mainTitle')).toMatchAriaSnapshot(`- heading "Create an application with the Trade Remedies Authority"`);
  await expect(page.locator('main')).toMatchAriaSnapshot(`- text: Download documents`);
  await page.locator('#submit-documentation-1-status').click();
  await page.getByText('Upload documents').click();
  await page.locator('#submit-documentation-2-status').click();
  await page.getByRole('link', { name: 'Save and close' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home" [level=1]`);
});


//3322-A2,A3_To validate ability to provide Organisation information and to apply for an investigation-GDS
test('3322', async ({ page }) => {
   await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation"`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home"`);

  await page.getByRole('link', { name: 'Create an application' }).click();
  await expect(page.locator('#mainTitle')).toMatchAriaSnapshot(`- heading "Create an application with the Trade Remedies Authority" [level=1]`);
  await page.getByRole('link', { name: 'Organisation information' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Details of the organisation that is applying for a new investigation" [level=1]`);
  await page.getByRole('textbox', { name: 'Organisation Name' }).click();
  await page.getByRole('textbox', { name: 'Organisation Name' }).fill('test');
  await page.getByRole('textbox', { name: 'Postal Code' }).fill('l1 23ww');
  await page.getByRole('radio', { name: 'What is your relationship to the organisation that is registering? I\'m an external party', exact: true }).check();
  await page.getByRole('textbox', { name: 'What is your role?' }).click();
  await page.getByRole('textbox', { name: 'What is your role?' }).fill('test');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('link', { name: 'Return to tasks' }).click();
  await page.getByRole('textbox', { name: 'Postal Code' }).click();
  await page.getByRole('textbox', { name: 'Postal Code' }).fill('L1 22WW');
  await page.getByRole('button', { name: 'Submit' }).click();



//3328-A5_To validate ability to access guidance and templates for application documentation for external user,gds
test('3328', async ({ page }) => {
     await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation"`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home"`);

  await page.getByRole('link', { name: 'Create an application' }).click();
  await expect(page.locator('#mainTitle')).toMatchAriaSnapshot(`- heading "Create an application with the Trade Remedies Authority"`);
  await page.getByRole('link', { name: 'Organisation information' }).click();
  await page.getByRole('textbox', { name: 'Organisation Name' }).click();
  await page.getByRole('textbox', { name: 'Organisation Name' }).fill('test');
  await page.getByRole('textbox', { name: 'Address Line 1' }).fill('test lane');
  await page.getByRole('textbox', { name: 'City / Town' }).fill('LondonL');
  await page.getByRole('textbox', { name: 'Postal Code' }).click();
  await page.getByRole('textbox', { name: 'Postal Code' }).fill('L1 22WW');
  await page.getByRole('textbox', { name: 'Country' }).dblclick();
  await page.getByRole('textbox', { name: 'Country' }).fill('England');
  await page.getByText('What is your relationship to the organisation that is registering? I\'m an').first().click({
    button: 'right'
  });
  await page.getByRole('radio', { name: 'What is your relationship to the organisation that is registering? I\'m an employee', exact: true }).check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('radio', { name: 'Yes' }).check();
    await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "What is the case number of the measure you would like to review?" [level=1]`);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('combobox', { name: 'Case number' }).click();
  await page.getByRole('combobox', { name: 'Case number' }).fill('cas');
  await page.getByRole('option', { name: '12345-Steve Test Case 1 -' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('h3')).toMatchAriaSnapshot(`- heading "About the goods" [level=3]`);
  await page.getByRole('link', { name: 'Yes, this is the correct case' }).click();
  await page.getByRole('radio', { name: 'Dumping Circumvention Review' }).check();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "What type of review do you want?"`);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#mainTitle')).toMatchAriaSnapshot(`- heading "Create an application with the Trade Remedies Authority"`);
  await page.getByRole('link', { name: 'Download documents' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Download documents and guidance" [level=1]`);
  const page2Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Find out how to create a non-' }).click();
  const page2 = await page2Promise;
  await expect(page2.locator('#content')).toMatchAriaSnapshot(`- text: Guidance`);
  await page2.getByRole('heading', { name: 'The TRA’s investigation' }).click();
});


//3335-A1,A12_To Validate "Go to public file to register interest in a case" from Account Home- need last page to validate

test('3325', async ({ page }) => {
     await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation"`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home"`);
  await page.getByRole('link', { name: 'Go to the public file to' }).click();
  // add Go to the public file to- page validation- page not available now
  });
=======
>>>>>>> d6fdf85d92046e923a1761c2f57e81af8a3bd356
