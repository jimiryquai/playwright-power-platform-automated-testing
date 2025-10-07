import { test, expect } from '@playwright/test';
import { testConfig } from './TestConfig';

test.use({
  storageState: 'auth/public-file.json'
});

test('4157', {
        tag: [
      '@public-file',
      '@core',
      '@regression',
      '@[4157]'
    ]
  }, async ({ page }) => {
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

test('4161', {
        tag: [
      '@public-file',
      '@core',
      '@regression',
      '@[4161]'
    ]
  }, async ({ page }) => {
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
test('4160', {
        tag: [
      '@public-file',
      '@core',
      '@regression',
      '@[4160]'
    ]
  }, async ({ page }) => {
    await page.goto(testConfig.azureAppUrl);
    await page.getByRole('link', { name: 'Terms and privacy' }).click();
    await page.getByRole('heading', { name: 'Trade Remedies Service Terms' }).click();
    await page.getByRole('heading', { name: 'Trade Remedies Service Terms' }).click();
    await page.locator('#main-content').getByText('Trade Remedies Service', { exact: true }).click();
    await page.getByText('The terms of use and privacy').click();
    await expect(page.locator('#main-content')).toMatchAriaSnapshot(`
      - text: Trade Remedies Service
      - heading "Trade Remedies Service Terms of Use and Privacy Notice" [level=2]
      - heading "Introduction" [level=3]
      - paragraph: The terms of use and privacy notice (“Notice”) describes the handling of data, including personal data, collected and used by the TRA. This includes communications to the TRA whether in electronic format, paper format or by telephone. By personal data, we mean any information relating to an identified or identifiable natural person.
      - paragraph: The purpose of this Notice is to inform people what information is collected about them, by whichever means; how this information is used; if it is disclosed and ways in which we protect their privacy.
      - paragraph: This Notice only relates to data that the TRA collects and processes. We are not responsible for external organisations that may link to the TRA’s web pages. For more information concerning external agencies and stakeholders please visit the relevant privacy statement on their own web pages.
      - heading "Why the Trade Remedies Authority needs to collect and process information" [level=3]
      - paragraph: "We only collect, use and share personal data where the law says we can. This is:"
      - list:
        - listitem: where we have your express consent
        - listitem: where the law allows us to collect, use and share the personal data, because it is in the public interest and because we need to do this so that we can carry out our official work
        - listitem: where we need your personal data because we have a contract with you, for example a contract of employment
        - listitem: where the law says that we can compel someone to provide us with your personal data, so that we can carry out our work
        - listitem: when the law compels us to collect, use or share personal data
      - paragraph: If you have given us your consent to collect, use or share your personal data, you may withdraw your consent at any time by contacting us. Withdrawing your consent will not affect the validity of how we have collected, used or shared your personal data up to that point
      - heading "Legal basis for processing information" [level=3]
      - paragraph: "The TRA may need to collect, process and/ or share information in order to:"
      - list:
        - listitem:
          - paragraph: /Carry out its functions relating to import duty conferred by, Schedule 4 of the Taxation \\(Cross-border Trade\\) Act \\d+ \\(“Customs Act”\\) relating to dumping and foreign subsidies causing injury to UK industry, and functions relating to increased imports causing serious injury to UK producers conferred by Schedule 5 of the Customs Act\\./
        - listitem:
          - paragraph: /Provide the Secretary of State with such, advice, support and assistance as the Secretary of State requests under the Trade Act \\d+ in connection with:/
          - list:
            - listitem: The conduct of an international trade dispute
            - listitem: Functions of the Secretary of State relating to trade, and
            - listitem: Functions of the TRA
        - listitem:
          - paragraph: /Provision of such advice, support and assistance under the Trade Act \\d+ as it considers appropriate in relation to international trade, and trade remedies\\./
        - listitem:
          - paragraph: "Perform functions, comply with obligations or exercise powers under the:"
          - list:
            - listitem: /Public Records Acts \\d+ and \\d+/
            - listitem: /Freedom of Information Act \\d+/
            - listitem: /Environmental Information Regulations \\d+/
            - listitem: /European General Data Protection Regulation \\d+/
            - listitem: /Data Protection Act \\d+/
        - listitem:
          - paragraph: "Carry out any action necessary or expedient for:"
          - list:
            - listitem: corporate administration
            - listitem: governance and communications
            - listitem: accounting purposes
            - listitem: work with the devolved administrations
            - listitem: work with MPs
            - listitem: work with stakeholders
            - listitem: work with other public bodies
            - listitem: work with other government departments
            - listitem: work with partner organisations
            - listitem: our work with journalists, lobbyists, charities, survey responders and survey companies, research agencies, academics and external speakers
            - listitem: our work with consumers and consumer organisations and trade associations, traders, suppliers, contractors; consultants, advisers, HMRC, Government Departments, the courts and legal Counsel
            - listitem: our work in our capacity as an employer
            - listitem: our intelligence gathering, including profiling, and case development work
            - listitem: conducting research to improve our services
      - heading "When do we collect information about people?" [level=3]
      - paragraph: "We collect information about people falling into the following categories:"
      - list:
        - listitem: visitors to our websites.
        - listitem: people who use our general information services, e.g. who subscribe to our RSS feeds, e-newsletters, social media sites, email alerts or request a publication from us.
        - listitem: people who engage with the TRA, or whose data we are provided with, as part of our carrying out of our functions and related organisational activities.
        - listitem: people who contact us in relation to information requests, complaints and general queries.
        - listitem: job applicants and our current and former employees.
      - paragraph: Sometimes we collect your personal data directly from you, but sometimes we collect it from third parties. Where we collect personal data from third parties, it may be from organisations like survey companies, or those traders operating in sectors of the market that we are investigating.
      - heading "Third parties the TRA obtains personal data from include but are not limited to:" [level=3]
      - list:
        - listitem: other government departments, public bodies or executive agencies
        - listitem: foreign governments or authorities
        - listitem: stakeholders
        - listitem: HMRC
        - listitem: overseas exporters or importers
        - listitem: trade or business associations
        - listitem: producers and traders
        - listitem: consumer organisations
        - listitem: research agencies
        - listitem: data that has been supplied as part of a submission of evidence by other parties that have registered interest in a case
      - heading "How long we keep your personal data" [level=3]
      - paragraph: The law says that we may only keep your personal data for as long as we need it to do our work. For example, where we collect and use personal data to carry out a trade remedies investigation, it is likely that we will need to hold your data while any relevant trade remedies are in force, due to the potential for appeals and review of the measures. However, it is likely we will no longer need your personal data once the measures (and any appeals and/ or reviews in relation to the goods or the measures concerned) are revoked. When we no longer need your personal data, we securely delete it. In deciding how long we need to keep your personal data for, we also have regard to the time periods recommended to government departments for keeping certain categories of information by The National Archive and our own retention schedule.
      - paragraph: For more information see our Data Retention Policy.
      - heading "Our digital platform" [level=3]
      - heading "Information you provide" [level=4]
      - paragraph: "To take part in an investigation or to start an application you are required to create an account with the Trade Remedies Service. To create an account you will be required to provide your:"
      - list:
        - listitem: Full name
        - listitem: The organisation you work for
        - listitem: Email address
        - listitem: Organisation’s head office address including country
        - listitem: A password (so you can access your case in the future)
        - listitem: Mobile phone number (for signing into the service – on sign in to the service a code will be sent to the registered mobile to verify the user’s identity)
      - paragraph: When completing an application you need to provide the information the Trade Remedies Authority needs to assess you have a trade remedies case. The information you need to provide will depend in which capacity you are involved in the case.
      - heading "Data we capture" [level=4]
      - paragraph: The information you provide through our Trade Remedies Service is securely stored by the Trade Remedies Authority via the Trade Remedies Service.
      - paragraph: Once you submit confidential information in an investigation you will not be able to access it through the Trade Remedies Service. The information will be sent to the Trade Remedies Authority where it will be held securely.
      - paragraph:
        - text: You can access all non-confidential documents you provide through the Trade Remedies Service when signed in and at periods throughout an investigation when the non-confidential documents will also be issued to the public case file on the TRA’s online public file -
        - link "https://www.trade-remedies.service.gov.uk/public/cases/":
          - /url: https://www.trade-remedies.service.gov.uk/public/cases/
      - heading "Confidentiality of data received by us in trade investigations" [level=4]
      - paragraph: Unless required to do so by law, we will treat information as confidential, where you submit information to us in connection with the exercise of any of our functions [in accordance with regulations under the Customs Act], and you have requested that we treat that information as confidential on the grounds that that information is by its nature confidential; or where you have otherwise supplied that information to us on a confidential basis. Where you have requested confidentiality, you must demonstrate to us that there is good cause for us to treat such information as confidential; and you must submit a sufficiently detailed non-confidential summary of that information for the purposes of the public file; or in exceptional circumstances, a statement of reasons.
      - paragraph: "We may disclose information which we otherwise treat as confidential where such disclosure is:"
      - list:
        - listitem: made with your consent, or the consent of the person supplying information on your behalf.
        - listitem: made for the purpose of court or tribunal proceedings in the United Kingdom relating to the exercise by us or the Secretary of State of any functions under the Customs Act or Regulations
        - listitem: made for the purpose of an international dispute relating to the exercise of any functions under the Customs Act or secondary legislation by us or the Secretary of State; or required or permitted by any other enactment or rule of law.
      - paragraph: We may also disclose to the Secretary of State information that we are treating as confidential for the purpose of the Secretary of State exercising their functions under the Customs Act or regulations made thereunder.
      - paragraph: We may receive information about you from HMRC for the purpose of facilitating the exercise of our functions relating to trade. Where we receive such information, we will not use the information for purposes other than in relation with these functions, or further disclose such information without the consent of HMRC.
      - heading "Retaining your data" [level=4]
      - paragraph: The Trade Remedies Authority will retain the data you provide for the duration of the case and for the duration of any measures enforced.
      - paragraph: Trade Remedies Authority will retain the data you provide beyond the life span of a measure for audit purposes.
      - paragraph: During the period in which you compile the documents into a submission, the TRA will not have access to the documents in their system – but they will be held in the system’s database so you do not have to complete a submission in one session.
      - paragraph: Once you have submitted documents to the TRA for consideration, they will be kept as part of the auditable record of the case.
      - heading "Your legal rights in relation to personal data" [level=3]
      - heading "Right to be informed about how personal data is used" [level=4]
      - paragraph: You have the right to ask us whether we are collecting, using or sharing your personal data. You may ask us at any time whether we are collecting, using or sharing your personal data, what personal data of yours we have, why we have it and what we are going to do with it. Where we are collecting, using or sharing your personal data, you can ask us for a copy of it.
      - paragraph: You may also ask us at any time to delete your personal data (sometimes called the ‘right to be forgotten’), or to correct it where you believe it may be wrong or incomplete, or to stop collecting, using or sharing your personal data, or to collect, use or share it in a more restricted way.
      - heading "What we must tell you" [level=4]
      - paragraph: Where you have made a request and we are collecting, storing, using or disclosing your personal data, we must tell you what personal data of yours we have; why we have it; what we are doing with it; whether we are sharing it with anyone, and if so, who we are sharing it with; whether we may share it with anyone in the future (including with anyone outside the European economic area and in which case what steps we are taking to keep your personal data safe); and how long we will be keeping your personal data for.
      - paragraph: Where we are collecting, storing, using or disclosing your personal data, but have not collected it directly from you, but from a third party, we must tell you who that third party is, when we respond to your request.
      - heading "Time for response and cost" [level=4]
      - paragraph: We must answer your request and provide you with a copy of your personal data, free of charge, without undue delay and within a month of receiving your request.
      - paragraph: But if your request is complex, or if you have made several requests, we may extend this time period by a further two months. Where we extend the time period, we must tell you we are going to do this, and why, within one month of receiving your request.
      - paragraph: If you ask us for further copies of your personal data, or you make repeated requests, the law allows us to charge you a reasonable fee based on our administrative costs, or to refuse to deal with your requests.
      - heading "Your right to have personal data erased in certain circumstances" [level=4]
      - paragraph: "Where we are collecting, using, storing or disclosing (processing) your personal data, you may ask us to delete it without undue delay where:"
      - list:
        - listitem: we no longer need your personal data for the purposes for which we collected it or
        - listitem: where you consented to us having your personal data and have now withdrawn that consent, unless the law allows us to keep your personal data without your consent or
        - listitem: where you have objected to us collecting or handling your personal data or
        - listitem: where we have collected or handled your personal data unlawfully or
        - listitem: where the law says that we must delete your personal data
      - heading "What if we have already published your personal data?" [level=4]
      - heading [level=4]
      - paragraph: If we have agreed to your request to delete your personal data and we have already published it, we will take reasonable steps to notify others who are handling your personal data that you have requested deletion of it and of any copies of it, or links to it. Our ability to notify others may depend on the available technology and the cost to us.
      - paragraph: If we have agreed to your request to delete your personal data and we have already published it, we will take reasonable steps to notify others who are handling your personal data that you have requested deletion of it and of any copies of it, or links to it. Our ability to notify others may depend on the available technology and the cost to us.
      - heading "Do we have to agree to your request?" [level=4]
      - paragraph: "We may not be able to delete your personal data for legal reasons. For example, where:"
      - list:
        - listitem: the law requires or allows us to keep the personal data
        - listitem: we need the personal data so that we can carry out our official work and it is in the public interest for us to keep it
        - listitem: it is needed for archiving, historical research or statistical purposes
        - listitem: it is needed for the establishment, exercise or defence of legal claims
      - heading "Your right to rectification" [level=4]
      - paragraph: Where we are collecting, using, storing or disclosing (processing) your personal data and you believe that the personal data we have is inaccurate, you may ask us to correct it. This is called your right to rectification.
      - heading "Is your personal data incomplete?" [level=4]
      - paragraph: You may also ask us to complete any personal data of yours that you believe is incomplete.
      - heading "What we must do" [level=4]
      - paragraph: Where you have made a request, we must correct your personal data without undue delay.
      - heading "What if we have already shared your personal data?" [level=4]
      - paragraph: Where we have already shared your personal data with anyone, we will notify them that you have asked us to correct it, unless notification is impossible or would involve a disproportionate effort by us. We must also tell you, if you ask us to, that we have notified the people that we have shared your personal data with.
      - heading "Do we always have to agree to your request?" [level=4]
      - paragraph: "Sometimes the law allows us to restrict your right to rectification. For example, for reasons of:"
      - list:
        - listitem: national security
        - listitem: defence
        - listitem: public security
        - listitem: the prevention, investigation, detection or prosecution of criminal offences or the execution of criminal penalties
        - listitem: protecting economic or financial interests, monetary, budgetary and taxation matters, public health and social security
        - listitem: monitoring, inspection or regulatory functions
        - listitem: protecting you or the rights of others
        - listitem: the enforcement of civil claims
      - heading "Right to restrict or object to processing of personal data in certain circumstances" [level=4]
      - paragraph: You have a right to block the processing of your personal data in certain circumstances. This right arises if you are disputing the accuracy of personal data, if you have raised an objection to processing, if processing of personal data is unlawful and you oppose erasure and request restriction instead or if the personal data is no longer required by us but you require the personal data to be retained to establish, exercise or defend a legal claim.
      - paragraph: Additionally, where we are collecting, using, storing or disclosing (processing) your personal data because we need it to carry out our official work (including if we are profiling your behaviour online or handling your personal data for archiving, historical research or statistical purposes) you may object at any time.
      - heading "What we must do" [level=4]
      - paragraph: If you object, we must stop collecting, using, storing or disclosing your personal data unless the law says that we can carry on.
      - paragraph: "For example, where:"
      - list:
        - listitem: we can show that there are compelling and lawful reasons for us to carry on which we consider outweigh your right to object or
        - listitem: we need the personal data to establish, exercise or defend a legal claim
      - heading "Right to data portability" [level=4]
      - paragraph: In certain circumstances you can request to receive a copy of your personal data in a commonly used electronic format. This right only applies to personal data that you have provided to us (for example by completing a form or providing information through a website). The right to data portability only applies if the processing is based on your consent or if the personal data must be processed for the performance of a contract and the processing is carried out by automated means (i.e. electronically);
      - heading "Right not to be subject to automated decisions where the decision produces a legal effect or a similarly significant effect:" [level=4]
      - paragraph: You have a right not to be subject to a decision which is based on automated processing where the decision will produce a legal effect or a similarly significant effect on you.
      - heading "How to make a request under the DPA:" [level=4]
      - paragraph: "If you wish to ask us to restrict how we process your personal data or exercise any of your rights under data protection legislation, you should contact:"
      - paragraph:
        - link "data.protection@traderemedies.gov.uk":
          - /url: mailto:data.protection@traderemedies.gov.uk
      - paragraph: Or write to
      - paragraph: /Knowledge and Information Management Trade Remedies Authority Premier House \\d+ Caversham Road Reading RG1 7EB/
      - heading "Proof of identity" [level=4]
      - paragraph: Before we can deal with your request to exercise your individual rights, we may need to ask you for proof of identity. If so, we will ask you for a photocopy of the identity page of a current passport or current photo driving licence and an original, current utility bill (a gas, electricity, water, or telephone bill, or a credit card or bank statement) containing your name and address. We will return the utility bill to you if you ask us to.
      - heading "Time for response and cost" [level=4]
      - paragraph: We must answer your request free of charge, without undue delay and certainly within a month of receiving your request.
      - paragraph: But if your request is complex, or if you have made several requests, we may extend this time period by a further two months. Where we extend the time period, we must tell you we are going to do this, and why, within one month of receiving your request.
      - paragraph: If you make repeated requests, the law allows us to charge you a reasonable fee based on our administrative costs, or to refuse to deal with your requests.
      - heading "Electronic requests" [level=4]
      - paragraph: Where you make your request by email, unless you ask us not to, we will respond in an electronic form.
      - heading "How to complain about the way we handle your request in relation to personal data" [level=4]
      - paragraph: "If you are unhappy about how we are handling your request to restrict processing of your personal data, you may complain to:"
      - paragraph:
        - text: /Knowledge and Information Management Trade Remedies Authority Premier House \\d+ Caversham Road Reading RG1 7EB Email:/
        - link "data.protection@traderemedies.gov.uk":
          - /url: mailto:data.protection@traderemedies.gov.uk
      - paragraph: "If you are unhappy with the response, you can also contact:"
      - paragraph:
        - text: Information Commissioner’s Office Wycliffe House Water Lane Wilmslow SK9 5AF
        - link "casework@ico.org.uk":
          - /url: mailto:casework@ico.org.uk
        - text: /\\d+ \\d+ \\d+/
      - paragraph: You also have the right to ask a Court to consider whether we have dealt properly with your request.
      - heading "How to make a Freedom of Information request to the TRA" [level=4]
      - paragraph: /The Freedom of Information Act \\d+ provides a right of access to a wide range of information held by public authorities, including the TRA\\. The purpose is to promote greater openness and accountability\\./
      - heading "Our duty to you" [level=4]
      - paragraph: /The Freedom of Information \\(FOI\\) Act \\d+ requires us to:/
      - list:
        - listitem: Provide information to you about the TRA through a publication scheme
        - listitem: Provide a guide to this information
        - listitem: Respond appropriately to requests for information
      - heading "Before you request information from the TRA" [level=4]
      - paragraph: Check whether the information you seek is already available. We publish information on our website and you may well find the answer to your question is already on the website. We have a publication scheme setting out what information we currently release or expect to release.
      - heading "Who can request information?" [level=4]
      - paragraph: Anyone, anywhere in the world, can make a FOI request to the TRA.
      - heading "What can I request?" [level=4]
      - paragraph: /You can seek any recorded information that you think we may hold\\. If the information is environmental, we will respond according to the Environmental Information Regulations \\(EIR\\) \\d+\\./
      - paragraph: /You do not have to know whether the information you want is covered by the EIR or the FOI Act\\. When you make a request, we will decide which law applies\\. If the information is your own personal data, then you should make a subject access request under the Data Protection Act \\(DPA\\) \\d+, and not under the FOI Act\\. See above for how to make DPA requests\\./
      - heading "How do I request information?" [level=4]
      - paragraph: Your request must be in writing and can be either posted or emailed to us.
      - paragraph: "For postal requests, please send to the following address:"
      - paragraph: /Knowledge and Information Management Trade Remedies Authority Premier House \\d+ Caversham Road Reading RG1 7EB/
      - paragraph:
        - text: "Email requests should be sent to:"
        - link "InformationRights@traderemedies.gov.uk":
          - /url: mailto:InformationRights@traderemedies.gov.uk
      - paragraph: Please write “Freedom of Information” in the subject line.
      - heading "What information must I include in my request?" [level=4]
      - paragraph: "The FOI Act requires certain information to be supplied before we can respond to your request:"
      - list:
        - listitem: your real name – we do not have to respond to requests submitted under a pseudonym
        - listitem: your address (email addresses are acceptable)
        - listitem: a description of the information you wish to obtain
        - listitem: any preferences for the format in which you wish to receive the information e.g. electronic or hard copy. We will endeavour to meet your preferences but cannot guarantee that we will be able to
      - heading "What you do not need to do:" [level=4]
      - list:
        - listitem: explicitly mention the FOI Act, although it may help to do so
        - listitem: know whether the information is covered by the FOI Act or the EIR as we will decide this
        - listitem: say why you want the information
        - listitem: specify particular documents. You have a right to information, however it is recorded
      - heading "What happens when my request is received?" [level=4]
      - paragraph: /We have a legal obligation to reply to your FOI request and must do so within \\d+ working days of receipt\\. We will do one of the following:/
      - list:
        - listitem: supply you with the information you requested
        - listitem: inform you that we don’t hold the information and, if we are able, advise you who does
        - listitem: inform you that your request will exceed the cost limit specified in the Fees Regulations and invite you to submit a narrower request
        - listitem: inform you that we hold the information requested but refuse to provide all or part of it and explain why, citing one or more of the exemptions from the FOI Act
        - listitem: inform you that we are refusing your request on the basis it is repeated or vexatious
        - listitem: /inform you that we need more time to consider the public interest test in relation to your request and let you know when to expect a further response\\. This should not be later than \\d+ working days after receipt of your request/
      - heading "What can I do if I am unhappy with the reply I receive or the way my request was handled?" [level=4]
      - paragraph: /You can ask us for an internal review of your FOI request\\. When you write to us requesting an internal review, we will acknowledge your letter and tell you how long we think the review will take\\. We aim to complete internal reviews within \\d+ working days, although more cases that are complex may take longer\\. Where internal reviews go over \\d+ working days, we will keep you informed of progress\\./
      - paragraph: If, after an internal review, you are still not satisfied you can then complain to the Information Commissioner (ICO). Details of how to do this are available at the ICO website.
      - paragraph: Full details of how to ask us for an internal review will be included in our initial reply to your FOI request. Details of how to complain further to the Information Commissioner will be included in our response to your internal review request.
      `);
});