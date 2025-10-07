import { test, expect } from '@playwright/test';
import { testConfig } from './TestConfig';
test.use({
  storageState: 'auth/public-file.json'
});

test('4163', {
  tag: [
    '@application',
    '@core',
    '@regression',
    '@[4163]'
  ]
},  async ({ page }) => {
  await page.goto(testConfig.azureAppUrl);
 await expect(page.getByRole('banner')).toMatchAriaSnapshot(`
    - banner:
      - link "GOV.UK":
        - /url: https://www.gov.uk/
        - img "GOV.UK"
      - link "Trade Remedies Service":
        - /url: https://publicfile-test.tangoromeoalpha.co.uk/
      - navigation "Menu":
        - list:
          - listitem:
            - link "Home":
              - /url: https://publicfile-test.tangoromeoalpha.co.uk/
          - listitem:
            - link "TRA Investigations":
              - /url: https://publicfile-test.tangoromeoalpha.co.uk/
          - listitem:
            - link "Sign in":
              - /url: https://ftrs-test.powerappsportals.com/
    `);
  await page.getByRole('link', { name: 'Trade Remedies Service' }).click();
  await page.getByRole('link', { name: 'TRA Investigations' }).click();
  await page.getByRole('tab', { name: 'Active Investigations' }).click();
  await page.getByRole('contentinfo').click();
  await page.getByText('Skip to main content GOV.UK').press('ControlOrMeta+-');
  await page.getByText('Skip to main content GOV.UK').press('ControlOrMeta+-');
  await page.getByText('Skip to main content GOV.UK').press('ControlOrMeta+-');

  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - paragraph:
      - strong: beta
      - text: This is a new service – your
      - link "feedback":
        - /url: ""
      - text: will help us to improve it.
    `);
  await expect(page.getByRole('contentinfo')).toMatchAriaSnapshot(`
    - contentinfo:
      - heading "Support links" [level=2]
      - list:
        - listitem:
          - link "Cookies":
            - /url: ${testConfig.azureAppUrl}cookies/
        - listitem:
          - link "Terms and privacy":
            - /url: ${testConfig.azureAppUrl}terms-and-privacy/
        - listitem:
          - link "Accessibility statement":
            - /url: ${testConfig.azureAppUrl}accessibility/
      - text: All content is available under the
      - link "Open Government Licence v3.0":
        - /url: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
      - text: ", except where otherwise stated"
      - link "© Crown copyright":
        - /url: https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/
    `);
  await expect(page.getByText('This is a new service – your')).toBeVisible()

const urlWithSlash = testConfig.portalUrl.endsWith('/') ? testConfig.portalUrl : `${testConfig.portalUrl}/`;


  await expect(page.getByRole('link', { name: 'Sign in', exact: true }))
    .toHaveAttribute('href',  urlWithSlash);
  await expect(page.getByRole('link', { name: 'TRA Investigations' }))
    .toHaveAttribute('href', testConfig.azureAppUrl);

  await expect(page.getByLabel('Menu').getByRole('link', { name: 'Home' }))
    .toHaveAttribute('href', testConfig.azureAppUrl);
});
test('4162', {
  tag: [
    '@application',
    '@core',
    '@regression',
    '@[4162]'
  ]
}, async ({ page }) => {
  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('link', { name: 'Cookies' }).click();
  await expect(page.locator('#main-content')).toMatchAriaSnapshot(`
    - heading "Cookies on the Trade Remedies Digital service" [level=1]
    - paragraph: Cookies are files saved on your phone, tablet or computer when you visit a website.
    - paragraph: We use cookies to store information about how you use the Trade Remedies website, such as the pages you visit.
    - heading "Cookie settings" [level=3]
    - paragraph: We use two types of cookie. You can choose which cookies you’re happy for us to use.
    - heading "Cookies that measure website use" [level=4]
    - paragraph: "We use Google Analytics to measure how you use the website so we can improve it based on user needs. Google Analytics sets cookies that store anonymised information about:"
    - list:
      - listitem: how you got to the site
      - listitem: the pages you visit on GOV.UK and government digital services, and how long you spend on each page
      - listitem: what you click on while you’re visiting the site
    - paragraph: We do not allow Google to use or share the data about how you use this site.
    - group:
      - radio "On"
      - text: "On"
      - radio "Off"
      - text: "Off"
    - heading "Strictly necessary cookies" [level=4]
    - paragraph: These essential cookies do things like remember your progress through a form (for example a licence application)
    - paragraph: They always need to be on.
    - paragraph:
      - link "Find out more about cookies on the TRA Digital Service":
        - /url: https://www.trade-remedies.service.gov.uk/cookiepolicy/
    - button "Save changes"
    `);
  await page.getByRole('group').locator('div').nth(1).click();
  await page.getByRole('group').locator('div').nth(2).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Find out more about cookies' }).click();
  const page1 = await page1Promise;
});