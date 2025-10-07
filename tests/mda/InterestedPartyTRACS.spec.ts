import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { Grid } from './components/Grid';
import { XrmHelper } from './utils/XrmHelper';
import { WebApi } from './utils/WebApi';
import { Sidebar } from './components/Sidebar';
import { testConfig, validateConfig } from './TestConfig';
test.use({
  storageState: 'auth/user.json'
});

test.beforeEach(async ({ page }) => {
  validateConfig();
  // await page.setViewportSize({ width: 2560, height: 1440 });
  let xrmHelper = new XrmHelper(page);

  await page.goto(testConfig.mdaUrl);

  // Wait for Xrm to be ready
  await xrmHelper.waitForXrmReady();
});

test('4196',  {
    tag: [
      '@portal',
      '@core',
      '@regression',
      '@[4196]'
    ]
  }, async ({ page }) => {
  await page.goto(testConfig.mdaUrl)
  await page.getByRole('treeitem', { name: 'Cases' }).locator('div').nth(3).click();
  // await page.locator('.ag-row-odd > div:nth-child(3) > .ms-Shimmer-container > .ms-Shimmer-dataWrapper > .containerStyles-216 > .ms-Stack').first().click();
  
  await page.getByText('Interested Parties').click();
  await page.getByRole('link', { name: 'Capgemini' }).click();
  await expect(page.getByLabel('Related Records')).toMatchAriaSnapshot(`
    - region "Related Records":
      - heading "Related Records" [level=2]
      - list "Case":
        - listitem:
          - link /DA-\\d+-Miniatures from China/
          - button /Delete DA-\\d+-Miniatures from China/
      - button "Search records for Case, Lookup field"
      - status
      - text: Lead Representative
      - list "Lead Representative":
        - listitem:
          - link "gayatri"
          - button "Delete gayatri"
      - button "Search records for Lead Representative, Lookup field"
      - status
      - text: First Representative Contact
      - list "First Representative Contact":
        - listitem:
          - link "Steve Middleton"
          - button "Delete Steve Middleton"
      - button "Search records for First Representative Contact, Lookup field"
      - status
      - text: First Representative Organisation Relationship
      - combobox "First Representative Organisation Relationship"
    `);
  await expect(page.getByLabel('Capgemini- Saved').getByLabel('Representatives')).toMatchAriaSnapshot(`
    - region "Representatives":
      - heading "Representatives" [level=2]
      - status
      - menubar "Representative Commands":
        - menuitem "More commands for Representative"
      - treegrid "Representative subgrid on Interested Party record":
        - rowgroup:
          - row "Status column No rows to select Representative Name Role Role Text Representative Contact":
            - columnheader "Status column No rows to select"
            - columnheader "Representative Name":
              - button "Representative Name"
            - columnheader "Role":
              - button "Role"
            - columnheader "Role Text":
              - button "Role Text"
            - columnheader "Representative Contact":
              - button "Representative Contact"
      - status
    `);
await expect(page.locator('#formHeaderTitle_3')).toContainText('Capgemini- Saved');
// await expect(page.locator('#id-232')).toContainText('Interested Party');
await expect(page.getByLabel('Interested Party entity,')).toContainText('Information');
await expect(page.locator('#headerControlsList_3')).toContainText('Active');
await expect(page.locator('#headerControlsList_3')).toContainText('Record Status');
await expect(page.locator('#headerControlsList_3')).toContainText('Validated');
await expect(page.locator('#headerControlsList_3')).toContainText('Party Status');
await expect(page.locator('[id="MscrmControls.Containers.ProcessBreadCrumb-processHeaderStageName_7b7897bb-3217-41d0-9694-6c627a36a805"]')).toContainText('Draft');
await expect(page.locator('[id="MscrmControls.Containers.ProcessBreadCrumb-processHeaderStageName_9fc00534-4f76-4866-90bc-474b6ded84d8"]')).toContainText('Validated');
await expect(page.getByLabel('Collaboration').getByRole('heading')).toContainText('Collaboration');


const element = page.getByText('Co-Operative');
await element.scrollIntoViewIfNeeded();
await expect(element).toBeVisible();
;

await expect(page.getByRole('switch', { name: 'Co-Operative: Yes' })).toBeChecked();
await expect(page.getByRole('switch', { name: 'Part of Sample: Yes' })).toBeChecked();
  
});
