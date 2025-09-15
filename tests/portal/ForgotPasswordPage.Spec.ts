import { test, expect } from '@playwright/test';

import 'dotenv/config';
 
// Define the configuration interface and load values from environment variables
interface Config {
  appUrl: string; // URL of the application to test
}
 
// Load configuration values, falling back to defaults if environment variables are not set
const config: Config = {
  appUrl: process.env.APP_URL || 'default_url',
};

//3205 - Forgot Password - Resend Verification Code Without Email
test('3205', async ({ page }) => {

 await page.goto(config.appUrl); //navigate to Tracs app

  //Click into the forgotten password page
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await page.getByRole('button', { name: 'Send verification code' }).click();

  //await for error messages to pop up
  await expect(page.locator('#emailVerificationControl')).toMatchAriaSnapshot(`
    - text: Email address
    - alert:
      - paragraph: Please enter your Email address
    - textbox "Email address"
    - link "Send a new verification code":
      - /url: undefined
    `);

  //The automation script is incomplete as the error message as per step-2 is not visible yet
});

//3207 - Forgot Password - Incorrect email address in Forgotten Password page
test('3207', async ({ page }) => {

 await page.goto(config.appUrl); //navigate to Tracs app

  //Click into the forgotten password page
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('firstname.secondname@traderemedies.gov.uk');
  await page.getByRole('button', { name: 'Send verification code' }).click();

  //await for error messages to pop up
  await expect(page.locator('#emailVerificationControl')).toMatchAriaSnapshot(`
    - text: Email address
    - alert:
      - paragraph: Please enter a valid email address.
    - textbox "Email address"
    - link "Send a new verification code":
      - /url: undefined
    `);
  //The automation script is incomplete as the error message as per step-2 is not visible yet
});