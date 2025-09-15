import { test, expect } from '@playwright/test';

import 'dotenv/config';

// Define the configuration interface and load values from environment variables
interface Config {
    appUrl: string; // URL of the application to test
    b2cUsername: string; // B2C Username for login
    b2cPassword: string; // B2C Password for login
}

// Load configuration values, falling back to defaults if environment variables are not set
const config: Config = {
    appUrl: process.env.APP_URL || 'default_url',
    b2cUsername: process.env.B2C_USERNAME || 'default_username',
    b2cPassword: process.env.B2C_PASSWORD || 'default_password',
};

test.describe('About Goods Page Test Cases', () => {

    test.beforeEach('Organisation Page', async ({ page }) => {

        // Navigate to Tracs app
        await page.goto(config.appUrl);

        // Click on sign in on home page
        await page.getByRole('button', { name: 'Sign in' }).click();

        // Sign in using config credentials
        await page.getByRole('textbox', { name: 'Email address' }).click();
        await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
        await page.getByRole('textbox', { name: 'Password' }).click();
        await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
        await page.getByRole('button', { name: 'Sign in' }).click();

        // Navigate to Organisation page and fill in the required fields
        await page.getByRole('link', { name: 'Create an application' }).click();

        await page.getByRole('link', { name: 'Organisation information' }).click();

        await page.getByRole('textbox', { name: 'Organisation Name' }).click();
        await page.getByRole('textbox', { name: 'Organisation Name' }).fill('Playwright');
        await page.getByRole('textbox', { name: 'Address Line 1' }).click();
        await page.getByRole('textbox', { name: 'Address Line 1' }).fill('1 Playwright Lane');
        await page.getByRole('textbox', { name: 'City / Town' }).click();
        await page.getByRole('textbox', { name: 'City / Town' }).fill('Playwright Town');
        await page.getByRole('textbox', { name: 'Postal Code' }).click();
        await page.getByRole('textbox', { name: 'Postal Code' }).fill('PL1 2LP');
        await page.getByRole('textbox', { name: 'Country' }).click();
        await page.getByRole('textbox', { name: 'Country' }).fill('England');
        await page.getByRole('radio', { name: 'What is your relationship to the organisation that is registering? I\'m an employee', exact: true }).check();
        await page.getByRole('button', { name: 'Submit' }).click();

        // Navigate to the About Goods Page
        await page.goto('https://future-trs.powerappsportals.com/New-Application-About-the-goods/?AppID=41b463cd-1971-f011-95f2-6045bdd0ec76');
    });

    //Clean data after each test run
    test.afterEach('Delete field inputs', async ({ page }) => {
      
    });

    // 3323 - About Goods - To validate About Goods page
    test('3323', async ({ page }) => {

        await page.getByRole('link', { name: 'Save and return to tasks' }).click();
        await expect(page.locator('#error-summary')).toMatchAriaSnapshot(`
        - alert:    
            - heading "There is a problem"
            - list:
                - listitem:
                    - paragraph: Select yes or no
        `);
    });

    // 3324 - About Goods - To validate About Goods page for No journey Flow (Yes option within)
    test('3324', async ({ page }) => {

        await page.getByRole('radio', { name: 'No' }).check();
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.locator('#mainContent')).toMatchAriaSnapshot(`
    - link "Back":
      - /url: javascript:history.back();
    - main:
      - heading "About the goods" 
      - heading "What are the goods that you want investigated?" 
      - paragraph: Give a short description of the goods. You can provide a more detailed explanation later.
      - textbox "Description of goods (required)"
      - button "Continue"
      - link "Save and return to tasks":
        - /url: "#"
    `);
        await page.getByRole('textbox', { name: 'Description of goods (' }).click();
        await page.getByRole('textbox', { name: 'Description of goods (' }).fill('Testing test case 3324');
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.locator('#mainContent')).toMatchAriaSnapshot(`
    - link "Back":
      - /url: javascript:history.back();
    - main:
      - heading "About the goods" [level=3]
      - heading "Are these goods from all countries?" [level=1]
      - group "Are these goods from all countries?":
        - radio "Yes, the goods are global (applies to Safeguard applications only)"
        - text: Yes, the goods are global (applies to Safeguard applications only)
        - radio "No, they come from a specific country or countries"
        - text: No, they come from a specific country or countries
      - button "Continue"
      - link "Save and return to tasks":
        - /url: "#"
    `);
        await page.getByRole('radio', { name: 'Yes, the goods are global (' }).check();
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.locator('#mainTitle')).toMatchAriaSnapshot(`- heading "Create an application with the Trade Remedies Authority" [level=1]`);
    });

    // 3325 - About Goods - To validate About Goods page for No journey Flow (No option within)
    test('3325', async ({ page }) => {

        await page.getByRole('radio', { name: 'No' }).check();
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.locator('#mainContent')).toMatchAriaSnapshot(`
    - link "Back":
      - /url: javascript:history.back();
    - main:
      - heading "About the goods" 
      - heading "What are the goods that you want investigated?" 
      - paragraph: Give a short description of the goods. You can provide a more detailed explanation later.
      - textbox "Description of goods (required)"
      - button "Continue"
      - link "Save and return to tasks":
        - /url: "#"
    `);
        await page.getByRole('textbox', { name: 'Description of goods (' }).click();
        await page.getByRole('textbox', { name: 'Description of goods (' }).fill('Testing test case 3325');
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.locator('#mainContent')).toMatchAriaSnapshot(`
    - link "Back":
      - /url: javascript:history.back();
    - main:
      - heading "About the goods" [level=3]
      - heading "Are these goods from all countries?" [level=1]
      - group "Are these goods from all countries?":
        - radio "Yes, the goods are global (applies to Safeguard applications only)"
        - text: Yes, the goods are global (applies to Safeguard applications only)
        - radio "No, they come from a specific country or countries"
        - text: No, they come from a specific country or countries
      - button "Continue"
      - link "Save and return to tasks":
        - /url: "#"
    `);
        await page.getByRole('radio', { name: 'No, they come from a specific' }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('main')).toMatchAriaSnapshot(`
    - main:
      - heading "About the goods" [level=3]
      - heading "Which countries are the goods from?" [level=1]
      - paragraph: You can search and add as many countries as required.
      - paragraph
      - text: Country
      - status
      - status
      - combobox "Country"
      - button "Continue"
      - link "Save and return to tasks":
        - /url: "#"
    `);
  await page.getByRole('combobox', { name: 'Country' }).click();
  await page.getByRole('combobox', { name: 'Country' }).fill('United');
  await page.getByRole('option', { name: 'United Kingdom of Great' }).click();
  await expect(page.locator('#country-body')).toMatchAriaSnapshot(`
    - link "Remove":
      - /url: "#"
    `);
  await page.getByRole('combobox', { name: 'Country' }).click();
  await page.getByRole('combobox', { name: 'Country' }).fill('United');
  await page.getByRole('option', { name: 'United Kingdom of Great' }).click();
  await expect(page.locator('#country-error')).toMatchAriaSnapshot(`- paragraph: You have already added this country.`);
  await page.getByRole('link', { name: 'Remove' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#country-error')).toMatchAriaSnapshot(`- paragraph: Add at least one country`);
  await page.getByRole('combobox', { name: 'Country' }).fill('United');
  await page.getByRole('option', { name: 'United Kingdom of Great' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('main')).toMatchAriaSnapshot(`
    - main:
      - heading "About the goods" [level=3]
      - heading "What type of trade remedy investigation are you applying for?" [level=1]
      - group: What are these investigations?
      - group:
        - radio "Dumping"
        - text: Dumping
        - radio "Other"
        - text: Other
        - radio "Safeguarding"
        - text: Safeguarding
        - radio "Subsidy"
        - text: Subsidy
        - paragraph: or
        - radio "I'm not sure"
        - text: I'm not sure
      - button "Continue"
      - link "Save and return to tasks":
        - /url: "#"
    `);
  await page.getByRole('radio', { name: 'I\'m not sure' }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('main')).toMatchAriaSnapshot(`
    - heading "About the goods" [level=3]
    - heading "Unsure what type of investigation you are applying for?" [level=1]
    - paragraph: If you are not sure the type of trade remedy investigation that you are applying for, please contact the Trade Remedies Authority.
    - heading "Pre-Application Office support:" [level=3]
    - paragraph:
      - text: Request a review or make an enquiry at
      - link "contact@traderemedies.gov.uk":
        - /url: mailto:contact@traderemedies.gov.uk
    - link "Save and return to tasks":
      - /url: "#"
    `);
  await page.getByRole('link', { name: 'Save and return to tasks' }).click();
  await expect(page.locator('#mainTitle')).toMatchAriaSnapshot(`- heading "Create an application with the Trade Remedies Authority" [level=1]`);

    });

  // 3326 - About Goods - To validate About Goods page for Yes journey (BLOCKED)
  

  // 3327 - Abouts Goods - To validate ability of saving applications in draft status (BLOCKED)


  // 3330 - Abouts Godds - To Validate upload for invalid files (BLOCKED)
 
  
  // 3331 - Abouts Godds - To Validate metadata tagging for documents as confidential or non-confidential (BLOCKED)


  // 3334 - Abouts Godds - To resubmit application (BLOCKED)


  // NEED TO ASK WHERE TO SCRIPT 3364 SINCE IT COMES UNDER THE MDA APP (BLOCKED)
});