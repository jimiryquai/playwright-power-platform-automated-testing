import { test, expect } from '@playwright/test';
import { testConfig } from './TestConfig';

test.use({
    storageState: 'auth/public-file.json'
});

test('Create organization. YesJourney', async ({ page }) => {
tag: ['@[3327]', '@application', '@regression']
    await page.goto(testConfig.azureAppUrl);
    await page.getByRole('link', { name: 'sign in.' }).click();

    await page.getByRole('textbox', { name: 'someone@example.com' }).click();
    await page.getByRole('textbox', { name: 'someone@example.com' }).fill('testuser_playwright_19062025@traderemedies.gov.uk');
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByRole('textbox', { name: 'Enter the password for' }).click();
    await page.getByRole('textbox', { name: 'Enter the password for' }).fill('TwoaItXz2qSB9GbpHYpIaK1JQ39ySmwa');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('TwoaItXz2qSB9GbpHYpIaK1JQ39ySmwa');

    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('testuser_playwright_19062025@traderemedies.gov.uk');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.getByRole('columnheader', { name: 'Case Number' }).click();
    await page.getByRole('columnheader', { name: 'Organisation name' }).first().click();
    await page.getByRole('cell', { name: 'Playwright', exact: true }).first().click();
    await page.getByRole('cell', { name: 'Playwright', exact: true }).first().click();
    await page.getByRole('row', { name: 'APP-1014-C1R3 Playwright 16/09/' }).getByRole('cell').nth(4).click();
    await page.getByRole('columnheader', { name: 'Reference number' }).click();
    await page.getByRole('columnheader', { name: 'Type of case' }).click();
    await page.getByRole('columnheader', { name: 'Organisation name' }).nth(1).click();
    await page.getByRole('columnheader', { name: 'Last updated' }).click();
    await page.getByRole('columnheader', { name: 'Application status' }).click();
    await page.getByRole('heading', { name: 'Your applications' }).click();
    await page.getByRole('link', { name: 'Create an application' }).click();
    await page.getByText('Request a review or make an').click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Read the guidance documents' }).click();
    const page1 = await page1Promise;
    await page1.close(); // ✅ closes the new tab

    await page.getByRole('link', { name: 'Organisation information' }).click();
    await expect(page.getByRole('textbox', { name: 'Organisation Name' })).toBeEmpty();
    await page.getByRole('textbox', { name: 'Organisation Name' }).click();
    await page.getByRole('textbox', { name: 'Organisation Name' }).fill('TestTestTest');
    await page.getByRole('textbox', { name: 'Address Line 1' }).click();
    await page.getByRole('textbox', { name: 'Address Line 1' }).fill('teststreet');
    await page.getByRole('textbox', { name: 'Address Line 2 (optional)' }).click();
    await page.getByRole('textbox', { name: 'Address Line 2 (optional)' }).fill('testhouse, testnumber');
    await page.getByRole('textbox', { name: 'City / Town' }).click();
    await page.getByRole('textbox', { name: 'City / Town' }).fill('TestTown');
    await page.getByRole('textbox', { name: 'County / State (optional)' }).click();
    await page.getByRole('textbox', { name: 'County / State (optional)' }).fill('TestState');
    await page.getByRole('textbox', { name: 'Postal Code' }).click();
    await page.getByRole('textbox', { name: 'Postal Code' }).fill('N18SU');
    await page.getByRole('textbox', { name: 'Country' }).click();
    await page.getByRole('textbox', { name: 'Country' }).fill('IDK(Test)8(028374()*^T(&^RE^&$W&%$');
    await page.getByRole('textbox', { name: 'Organisation number (optional)' }).click();
    await page.getByRole('radio', { name: 'What is your relationship to the organisation that is registering? I\'m a director', exact: true }).check();
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('radio', { name: 'Yes' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('link', { name: 'public file of our' }).click();
});
test('NoJourney', async ({ page }) => {
        tag: [
        '@public-file',                    // Application tag
        '@application',        // Feature tag  
        '@regression',            // Test type tag
        '@[3327,3322, 3323]'                 // Azure Test Plans Test Case ID
    ]
    await page.goto(testConfig.azureAppUrl);
    await page.getByRole('link', { name: 'sign in.' }).click();

    await page.getByRole('textbox', { name: 'someone@example.com' }).click();
    await page.getByRole('textbox', { name: 'someone@example.com' }).fill('testuser_playwright_19062025@traderemedies.gov.uk');
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByRole('textbox', { name: 'Enter the password for' }).click();
    await page.getByRole('textbox', { name: 'Enter the password for' }).fill('TwoaItXz2qSB9GbpHYpIaK1JQ39ySmwa');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('TwoaItXz2qSB9GbpHYpIaK1JQ39ySmwa');

    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('testuser_playwright_19062025@traderemedies.gov.uk');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.getByRole('columnheader', { name: 'Case Number' }).click();
    await page.getByRole('columnheader', { name: 'Organisation name' }).first().click();
    await page.getByRole('cell', { name: 'Playwright', exact: true }).first().click();
    await page.getByRole('cell', { name: 'Playwright', exact: true }).first().click();
    await page.getByRole('row', { name: 'APP-1014-C1R3 Playwright 16/09/' }).getByRole('cell').nth(4).click();
    await page.getByRole('columnheader', { name: 'Reference number' }).click();
    await page.getByRole('columnheader', { name: 'Type of case' }).click();
    await page.getByRole('columnheader', { name: 'Organisation name' }).nth(1).click();
    await page.getByRole('columnheader', { name: 'Last updated' }).click();
    await page.getByRole('columnheader', { name: 'Application status' }).click();
    await page.getByRole('heading', { name: 'Your applications' }).click();
    await page.getByRole('link', { name: 'Create an application' }).click();
    await page.getByText('Request a review or make an').click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Read the guidance documents' }).click();
    const page1 = await page1Promise;
    await page1.close(); // ✅ closes the new tab

    await page.getByRole('link', { name: 'Organisation information' }).click();
    await expect(page.getByRole('textbox', { name: 'Organisation Name' })).toBeEmpty();
    await page.getByRole('textbox', { name: 'Organisation Name' }).click();
    await page.getByRole('textbox', { name: 'Organisation Name' }).fill('TestTestTest');
    await page.getByRole('textbox', { name: 'Address Line 1' }).click();
    await page.getByRole('textbox', { name: 'Address Line 1' }).fill('teststreet');
    await page.getByRole('textbox', { name: 'Address Line 2 (optional)' }).click();
    await page.getByRole('textbox', { name: 'Address Line 2 (optional)' }).fill('testhouse, testnumber');
    await page.getByRole('textbox', { name: 'City / Town' }).click();
    await page.getByRole('textbox', { name: 'City / Town' }).fill('TestTown');
    await page.getByRole('textbox', { name: 'County / State (optional)' }).fill('TestState');
    await page.getByRole('textbox', { name: 'Postal Code' }).click();
    await page.getByRole('textbox', { name: 'Postal Code' }).fill('N18SU');
    await page.getByRole('textbox', { name: 'Country' }).click();
    await page.getByRole('textbox', { name: 'Country' }).fill('IDK(Test)8(028374()*^T(&^RE^&$W&%$');
    await page.getByRole('textbox', { name: 'Organisation number (optional)' }).click();
    await page.getByRole('radio', { name: 'What is your relationship to the organisation that is registering? I\'m a director', exact: true }).check();
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('radio', { name: 'No' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('textbox', { name: 'Description of goods (' }).click();
    await page.getByRole('textbox', { name: 'Description of goods (' }).click();
    await page.getByRole('textbox', { name: 'Description of goods (' }).fill('test goods are designed for testing, they dont really exist');
    await page.getByRole('textbox', { name: 'Description of goods (' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('No, they come from a specific').click();
    await page.locator('legend').click();
    await page.getByRole('radio', { name: 'Yes, the goods are global (' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('link', { name: 'Organisation information' })).toBeVisible;
    await expect(page.getByRole('heading', { name: 'Prepare and submit your' })).toBeVisible;
    await expect(page.getByRole('link', { name: 'Upload documents' })).toBeVisible;
    await expect(page.getByRole('link', { name: 'Check and submit your' })).toBeVisible;
    await page.getByRole('link', { name: 'About the goods' }).click();
    await page.getByRole('radio', { name: 'No' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('radio', { name: 'No, they come from a specific' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('link', { name: 'Save and return to tasks' }).click();
    await expect(page.locator('#caseStatus')).toContainText('DRAFT');

});