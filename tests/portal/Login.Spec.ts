import { test, expect } from '@playwright/test';

import 'dotenv/config';

// Define the configuration interface and load values from environment variables
interface Config {
  appUrl: string; // URL of the application to test
  appName: string; // Name of the application to verify
  /*username: string; // 365 Username for login
  password: string; // 365 Password for login
  tenantId: string; // Tenant ID for the Office 365 account*/
  b2cUsername: string; // B2C Username for login
  b2cPassword: string; // B2C Password for login
  b2cTenantID: string; // Tenant ID for the B2C account
}

// Load configuration values, falling back to defaults if environment variables are not set
const config: Config = {
  appUrl: process.env.APP_URL || 'default_url',
  appName: process.env.APP_NAME || 'default_name',
  /*username: process.env.O365_USERNAME || 'default_username',
  password: process.env.O365_PASSWORD || 'default_password',
  tenantId: process.env.O365_TENANT_ID || 'default_tenant_id',*/
  b2cUsername: process.env.B2C_USERNAME || 'default_username',
  b2cPassword: process.env.B2C_PASSWORD || 'default_password',
  b2cTenantID: process.env.B2C_TENANT_ID || 'default_tenant_id'
};



// 3199- To validate User Login: Email and Password entry via login screen
test('3199', async ({ page }) => {
await page.goto(config.appUrl);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.waitForTimeout(1000);
   await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: 'Sign in' }).click(),
  ]);
  await page.waitForTimeout(1000);
      await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home"`);
});


//3206-Invalid verification code
test('3206', async ({ page }) => {
await page.goto(config.appUrl);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#pageHeading')).toMatchAriaSnapshot(`- heading "Sign in to your Trade Remedies Service account"`);
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Send verification code' }).click();
  await page.getByRole('alert', { name: 'Verification code has been' }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByLabel('Verification code has been')).toMatchAriaSnapshot(`- alert "Verification code has been sent to your inbox. Please copy it to the input box below."`);
  await page.getByRole('textbox', { name: 'Verification Code' }).click();
  await page.getByRole('textbox', { name: 'Verification Code' }).fill('qasdsgfdfgdhfj');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Verify code' }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByLabel('The verification code you')).toMatchAriaSnapshot(`- alert "The verification code you have entered does not match our records. Please try again, or request a new code."`);
});

//3202 - Login - Blank Email and Submission
test('3202', async ({ page }) => {
  
  await page.goto(config.appUrl); //navigate to Tracs app
 await page.getByRole('button', { name: 'Sign in' }).click(); // click on sign in on home page
 await page.getByRole('button', { name: 'Sign in' }).click(); //click on sign in while leaving the email and password cell blank

  await for error messages to pop up
  await expect(page.getByLabel('Sign in with your email')).toMatchAriaSnapshot(`
//     - text: Email
//     - alert:
//       - paragraph: Please enter your Email address
//     - textbox "Email address"
//     `);
  await expect(page.getByLabel('Sign in with your email')).toMatchAriaSnapshot(`
    - text: Password
    - alet: Please enter your password
    - textbox "Password"
    `);


//3203 - Login - Incorrect login attempt
test('3203', async ({ page }) => {

await page.goto(config.appUrl); //navigate to Tracs app

  //Log in with incorrect pasword
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#error-summary')).toMatchAriaSnapshot(`
    - alert:
      - heading "There is a problem"
      - list:
        - listitem:
          - paragraph: Your password is incorrect
    `);

  //Log in with incorrect email
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Email address' }).fill('firstname.secondname@traderemedies.gov.uk');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#error-summary')).toMatchAriaSnapshot(`
    - alert:
      - heading "There is a problem"
      - list:
        - listitem:
          - paragraph: We can't seem to find your account
    `);
});

//3204 - Login - Invalid login details
test('3204', async ({ page }) => {
    
  await page.goto(config.appUrl); //navigate to Tracs app
  
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('UserName');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Password123$');
 
  //await for error messages to pop up
  await expect(page.getByLabel('Sign in with your email')).toMatchAriaSnapshot(`
    - text: Email
    - alert:
      - paragraph: Please enter a valid email address.
    - textbox "Email address"
    `);
});


//3242-Forgotten password Verification Screen: Not populating mandatory fields and testing for error messages-INCOMP
test('3242', async ({ page }) => {
 
  await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation"`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#pageHeading')).toMatchAriaSnapshot(`- heading "Sign in to your Trade Remedies Service account"`);
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('button', { name: 'Send verification code' }).click();
  await page.getByRole('button', { name: 'Verify code' }).click();
  //await expect(page.getByLabel('Verification code has been')).toMatchAriaSnapshot(`- alert "Verification code has been sent to your inbox. Please copy it to the input box below."`);// replace by error message here
});


//3244-Create your account Screen: Not populating mandatory fields and testing for error messages-GDS

test('3244', async ({ page }) => {
  await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation" [level=1]`);
  await page.getByRole('link', { name: 'Create an account' }).click();
  await expect(page.locator('#pageHeading')).toMatchAriaSnapshot(`- heading "Create your account" [level=1]`);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('h2')).toMatchAriaSnapshot(`- heading "There is a problem" [level=2]`);
  await expect(page.locator('#error-summary')).toMatchAriaSnapshot(`
    - alert:
      - heading "There is a problem" [level=2]
      - list:
        - listitem:
          - 'link "Missing email: Enter an email address"':
            - /url: "#email"
        - listitem:
          - 'link "Missing password: Enter a password"':
            - /url: "#newPassword"
        - listitem:
          - 'link "Missing password confirmation: Enter a password"':
            - /url: "#reenterPassword"
    `);
});

//3254-Cross-Browser Compatibility - Login Screen
test('3254', async ({ page }) => {

  await expect(page.getByRole('heading')).toMatchAriaSnapshot(`- heading "Participate in a trade remedies investigation" [level=1]`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
   await page.getByRole('textbox', { name: 'Email address' }).fill(config.b2cUsername);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.b2cPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "Account Home" [level=1]`);
// to add multiple tab in browser in same login session
});


