import { Page, Locator, expect } from '@playwright/test';

export class ApplicationStartPage {
  readonly page: Page;
  
  // Locators
  readonly heading: Locator;
  readonly subHeading: Locator;
  readonly youWillBeAbleSection: Locator;
  readonly youWillNeedSection: Locator;
  readonly downloadingTemplatesSection: Locator;
  readonly startButton: Locator;
  readonly guidanceLink: Locator;
  readonly contactEmail: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main content locators
    this.heading = page.getByRole('heading', { name: /Create an application with the Trade Remedies Authority/i });
    this.subHeading = page.getByText(/Apply for an investigation into unfair import practices/i);
    this.youWillBeAbleSection = page.getByText('You will be able to:');
    this.youWillNeedSection = page.getByText('You will need:');
    this.downloadingTemplatesSection = page.getByText('Downloading templates');
    this.startButton = page.getByRole('button', { name: /Start application/i });
    
    // Sidebar locators (not testing links per AC, just presence)
    this.guidanceLink = page.getByRole('link', { name: /Read the guidance documents/i });
    this.contactEmail = page.getByRole('link', { name: /contact@traderemedies.gov.uk/i });
  }

  /**
   * Verify that the page has loaded correctly with all key elements visible
   */
  async verifyPageStructure(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.subHeading).toBeVisible();
    await expect(this.youWillBeAbleSection).toBeVisible();
    await expect(this.youWillNeedSection).toBeVisible();
    await expect(this.downloadingTemplatesSection).toBeVisible();
    await expect(this.startButton).toBeVisible();
    await expect(this.guidanceLink).toBeVisible();
    await expect(this.contactEmail).toBeVisible();
  }

  /**
   * Verify key content items are present (bullet points)
   */
  async verifyKeyContent(): Promise<void> {
    // "You will be able to" section content
    await expect(this.page.getByText(/Create an application for a new investigation/i)).toBeVisible();
    await expect(this.page.getByText(/Create an application to review an existing measure/i)).toBeVisible();
    
    // "You will need" section content
    await expect(this.page.getByText(/organisation's name/i)).toBeVisible();
    await expect(this.page.getByText(/organisation's address/i)).toBeVisible();
    await expect(this.page.getByText(/Information about the goods in question/i)).toBeVisible();
    await expect(this.page.getByText(/country.*of origin/i)).toBeVisible();
    await expect(this.page.getByText(/type of case/i)).toBeVisible();
  }

  /**
   * Click the Start application button
   */
  async clickStartApplication(): Promise<void> {
    await this.startButton.click();
  }
}