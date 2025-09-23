import { test, expect } from '@playwright/test';
import { testConfig } from './TestConfig';

test.use({
  storageState: 'auth/public-file.json'
});

test('4157', async ({ page }) => {
  // All your actions must be inside this block

  await page.goto(testConfig.azureAppUrl);
  await expect(page.getByText('Review the public file of our active investigations')).toBeVisible();
  await expect(page.getByText('Select a case to register interest')).toBeVisible();

  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('tab', { name: 'Active Investigations' }).click();

  const columns = ['No.', 'Case', 'Commodity', 'Country', 'Type', 'Initiated', 'Updated'];
  for (const columnName of columns) {
    await page.getByRole('button', { name: columnName }).click();
    await page.waitForTimeout(500);
    const sortedTableRows = page.locator('table tbody tr');
    expect(await sortedTableRows.count()).toBeGreaterThan(0);
  }

  await page.getByRole('tab', { name: 'Completed Investigations' }).click();

  await expect(page.getByRole('button', { name: 'Closed' })).toBeVisible();
  const completedTableRows = page.locator('table tbody tr');
  const rowCountCompleted = await completedTableRows.count();

  if (rowCountCompleted > 0) {
    expect(rowCountCompleted).toBeGreaterThan(0);
  } else {
    await expect(page.getByRole('button', { name: 'Initiated' })).toBeVisible();
  }

  const completedNavTableRows = page.locator('table tbody tr');
  const rowCount = await completedNavTableRows.count();

  if (rowCount > 0) {
    const columnsCompleted = ['No.', 'Case', 'Commodity', 'Country', 'Type', 'Initiated', 'Closed'];
    for (const columnName of columnsCompleted) {
      await page.getByRole('button', { name: columnName }).click();
      await page.waitForTimeout(500);
      expect(await completedNavTableRows.count()).toBeGreaterThan(0);
    }
  }

  // AC5 & AC6: Case links and Register interest functionality
  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('tab', { name: 'Active Investigations' }).click();

  const linkTestTableRows = page.locator('table tbody tr');
  expect(await linkTestTableRows.count()).toBeGreaterThan(0);

  const firstCaseNumberLink = page.locator('table tbody tr:first-child td:nth-child(1) a').first();
  if (await firstCaseNumberLink.count() > 0) {
    const caseNumberHref = await firstCaseNumberLink.getAttribute('href');
    expect(caseNumberHref).toContain('/case/');
  }

  const firstCaseNameLink = page.locator('table tbody tr:first-child td:nth-child(2) a').first();
  if (await firstCaseNameLink.count() > 0) {
    const caseNameHref = await firstCaseNameLink.getAttribute('href');
    expect(caseNameHref).toContain('/case/');
  }

  const registerInterestLinks = page.locator('table tbody tr td a', { hasText: 'Register interest' });
  const registerLinkCount = await registerInterestLinks.count();
  expect(registerLinkCount).toBeGreaterThan(0);

  const firstRegisterLink = registerInterestLinks.first();
  const registerHref = await firstRegisterLink.getAttribute('href');
  expect(registerHref).toContain('registration-of-interest');

  await page.goto(testConfig.azureAppUrl + 'case/12344#cases');
  await page.getByRole('heading', { name: '- My new case portal 10dec' }).click();
  await page.getByRole('heading', { name: 'BSG Investigation' }).click();
  await page.getByText('The goods that are the').click();
  await page.getByRole('heading', { name: 'Email Case team' }).click();
  await page.getByText('To take part in this').click();
  await page.getByLabel('Breadcrumb').getByRole('link', { name: 'Home' }).click();
  await page.goto(testConfig.azureAppUrl + 'case/12344#cases');
  await page.getByRole('link', { name: 'start a new registration of' }).click();
  await page.getByRole('heading', { name: 'Start a new registration of' }).click();
  await page.getByText('Case: 12344 - my new case').click();
});

test('4161', async ({ page }) => {
  // await page.goto(testConfig.azureAppUrl+'accessibility');
  await page.goto(testConfig.azureAppUrl);
  await page.getByRole('link', { name: 'Accessibility statement' }).click();
  await expect(page.locator('#main-content')).toMatchAriaSnapshot(`
    - paragraph:
      - text: This statement applies to content published on
      - link "www.trade-remedies.service.gov.uk":
        - /url: https://www.trade-remedies.service.gov.uk/
      - text: .
    - paragraph: This service is run by the Trade Remedies Authority.
    - paragraph: It is designed to be used by as many people as possible. The text should be clear and simple to understand.
    - paragraph: "You should be able to:"
    - list:
      - listitem: change colours, contrast levels and fonts
      - listitem: /zoom in up to \\d+% without the text spilling off the screen/
      - listitem: get from the start of the service to the end using just a keyboard
      - listitem: get from the start of the service to the end using speech recognition software
      - listitem: listen to the service using a screen reader (including the most recent versions of JAWS, NVDA and VoiceOver)
    - paragraph:
      - link "AbilityNet":
        - /url: https://mcmw.abilitynet.org.uk/
      - text: has advice on making your device easier to use if you have a disability.
    - heading "How accessible this service is" [level=2]
    - paragraph: "We know some parts of this website are not fully accessible. For example:"
    - list:
      - listitem: some pages and document attachments are not written in plain English
      - listitem: there is not enough contrast between text and its background
      - listitem: some documents have poor colour contrast
      - listitem: some images do not have image descriptions
      - listitem: some content cannot be operated with a keyboard without needing specific timings for individual keystrokes
      - listitem: users don’t always get information in an order that is understandable
      - listitem: labels or instructions are missing where content requires user input
      - listitem: the purpose of every link cannot be understood by link text alone
    - heading "Feedback and contact information" [level=2]
    - paragraph: "If you need information on this website in a different format like accessible PDF, easy read, audio recording or braille:"
    - list:
      - listitem:
        - text: email
        - link "contact@traderemedies.gov.uk":
          - /url: mailto:contact@traderemedies.gov.uk
      - listitem: /call \\+\\d+ \\(0\\) \\d+ \\d+ \\d+/
    - paragraph: We’ll consider your request and get back to you in 5 days.
    - paragraph: /A replacement service is currently being developed to meet the WCAG 2\\.2 standard and will be launched in \\d+\\. The non-compliance issues identified under WCAG 2\\.1 will be addressed with the new service\\. Conducting a WCAG 2\\.2 assessment on the current version of the Trade Remedies Service will not be undertaken as it would constitute a disproportionate burden\\./
    - heading "Reporting accessibility problems with this service" [level=2]
    - paragraph: "We’re always looking to improve the accessibility of this service. If you find any problems that are not listed on this page or think we’re not meeting accessibility requirements:"
    - list:
      - listitem:
        - text: email
        - link "contact@traderemedies.gov.uk":
          - /url: mailto:contact@traderemedies.gov.uk
      - listitem: /call \\+\\d+ \\(0\\) \\d+ \\d+ \\d+/
    - heading "Enforcement procedure" [level=2]
    - paragraph:
      - text: /In England and Wales, the Equality and Human Rights Commission \\(EHRC\\) is responsible for enforcing the Public Sector Bodies \\(Websites and Mobile Applications\\) \\(No\\. 2\\) Accessibility Regulations \\d+ \\(the ‘accessibility regulations’\\)\\. If you’re not happy with how we respond to your complaint, contact the/
      - link "Equality Advisory and Support Service (EASS)":
        - /url: https://www.gov.uk/equality-advisory-support-service
      - text: .
    - heading "Technical information about this service’s accessibility" [level=2]
    - paragraph: /The Trade Remedies Authority is committed to making this service accessible, in accordance with the Public Sector Bodies \\(Websites and Mobile Applications\\) \\(No\\. 2\\) Accessibility Regulations \\d+\\./
    - heading "Compliance status" [level=3]
    - paragraph:
      - text: The website is partially compliant with
      - link "Web Content Accessibility Guidelines version 2.1 AA standard":
        - /url: https://www.w3.org/TR/WCAG21/
      - text: .
    - heading "Non-accessible content" [level=2]
    - paragraph: The content listed below is non-accessible for the following reasons.
    - heading "Non compliance with the accessibility regulations" [level=3]
    - list:
      - listitem: Information and relationships that are implied by visual or auditory formatting are not preserved when the presentation format changes.This fails 1.3.1. success criterion.
      - listitem: There is not enough contrast between text and its background so that it can be read by people with moderately low vision (who do not use contrast-enhancing assistive technology). This fails WCAG 1.4.3 success criterion.
      - listitem: Images on some pages do not always have suitable image descriptions. Users of assistive technologies may not be given information conveyed in images. This fails WCAG 2.1 success criterion (Non-text Content).
      - listitem: /Not all text can be resized without assistive technology up to \\d+ percent without loss of content or functionality\\. This fails WCAG 1\\.4\\.4 success criterion\\./
      - listitem: Some content is not operable with a keyboard without needing specific timings for individual keystrokes. This fails WCAG 2.1.1 success criterion.
      - listitem: Where users are navigating sequentially through content they don’t always get information in an order that is understandable and can be operated from the keyboard. This can be confusing as users can’t form a consistent mental model of the content. This fails WCAG 2.4.3 success criterion.
      - listitem: The purpose of every link cannot be understood from the link text alone so users can decide whether to follow the link. This fails WCAG 2.4.4 success criterion.
      - listitem: The keyboard does not have a mode where the user can always see which part of the page the keyboard will interact with. People with attention limitations, short term memory limitations, or limitations in executive processes benefit by being able to discover where the focus is. This fails WCAG 2.4.7 success criterion.
      - listitem: The application does not automatically identify and describe an input error so that users are aware that an error has occurred and can determine what is wrong. This fails WCAG 3.1.1 success criterion.
      - listitem: Labels or instructions are missing where content requires user input so that users know exactly what is expected from them or in the case of radio buttons, checkboxes or similar, users know what they have selected. This fails WCAG 3.2.2. success criterion.
      - listitem: Start and end tags are missing meaning that screen readers won’t be able to accurately parse and interpret content. This fails WCAG 4.1.1 success criterion.
      - listitem: Where custom controls are created, measures have not been taken to ensure that the controls can be controlled by assistive technology. This fails WCAG 4.3.2 successes criterion.
      - listitem: Many documents are in less accessible formats, for example PDF.
    - heading "Disproportionate burden" [level=3]
    - paragraph: We believe that fixing the accessibility problems with some content would be disproportionate because the relevant platform will be replaced soon.
    - heading "Content that’s not within the scope of the accessibility regulations" [level=3]
    - paragraph: /Non-HTML documents published before September \\d+ do not need to be accessible - unless users need them to use a service\\./
    - heading "What we’re doing to improve accessibility" [level=2]
    - paragraph: We are fixing content which fails to meet the Web Content Accessibility Guidelines version 2.1. We will update this page when issues are fixed.
    - heading "How we tested this website" [level=2]
    - paragraph:
      - text: /This website was last tested on 8 Feb \\d+\\. The test was carried out by the/
      - link "Digital Accessibility Centre":
        - /url: https://digitalaccessibilitycentre.org/
      - text: .
    - heading "Preparation of this accessibility statement" [level=2]
    - paragraph: /This statement was prepared on 3 Jul \\d+ and updated on \\d+ Dec \\d+\\./
    - paragraph:
      - link "Accessibility community":
        - /url: https://www.gov.uk/service-manual/communities/accessibility-community
    `);
});