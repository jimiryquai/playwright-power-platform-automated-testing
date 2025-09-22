import { test, expect } from '@playwright/test';
import { testConfig } from './TestConfig';
test.use({
  storageState: 'auth/public-file.json'
});

test('4163', async ({ page }) => {
  await page.goto(testConfig.azureAppUrl);
  await expect(page.getByRole('banner')).toMatchAriaSnapshot(`
    - banner:
      - link "GOV.UK":
        - /url: https://www.gov.uk/
        - img "GOV.UK"
      - link "Trade Remedies Service":
        - /url: ${testConfig.azureAppUrl}
      - navigation "Menu":
        - list:
          - listitem:
            - link "Home":
              - /url: ${testConfig.azureAppUrl}
          - listitem:
            - link "TRA Investigations":
              - /url: ${testConfig.azureAppUrl}
          - listitem:
            - link "Sign in":
              - /url: ${testConfig.portalUrl}
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
  await page.getByText('This is a new service – your').click();
  await page.getByRole('link', { name: 'TRA Investigations' }).click();
  await page.getByLabel('Menu').getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'TRA Investigations' }).click();
  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await page.getByRole('heading', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'TRA Investigations' }).click();
  await page.getByLabel('Menu').getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('contentinfo')).toMatchAriaSnapshot(`
    - contentinfo:
      - heading "Support links" [level=2]
      - list:
        - listitem:
          - link "Cookies":
            - /url: https://publicfile-test.tangoromeoalpha.co.uk/cookies/
        - listitem:
          - link "Terms and privacy":
            - /url: https://publicfile-test.tangoromeoalpha.co.uk/terms-and-privacy/
        - listitem:
          - link "Accessibility statement":
            - /url: https://publicfile-test.tangoromeoalpha.co.uk/accessibility/
      - text: All content is available under the
      - link "Open Government Licence v3.0":
        - /url: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
      - text: ", except where otherwise stated"
      - link "© Crown copyright":
        - /url: https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/
    `);
});