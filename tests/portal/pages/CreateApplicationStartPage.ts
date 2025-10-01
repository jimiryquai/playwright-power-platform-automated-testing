import { Page, Locator, expect } from '@playwright/test';

export class CreateApplicationStartPage {
  readonly page: Page;
  
  // Locators
  readonly heading: Locator;
  readonly prepareInfoHeading: Locator;
  readonly prepareDocsHeading: Locator;
  readonly taskLists: Locator;
  
  // First task list - Application Information
  readonly organisationInfoLink: Locator;
  readonly organisationInfoStatus: Locator;
  readonly aboutGoodsItem: Locator;
  readonly aboutGoodsStatus: Locator;
  
  // Second task list - Documentation
  readonly downloadDocsItem: Locator;
  readonly downloadDocsStatus: Locator;
  readonly uploadDocsItem: Locator;
  readonly uploadDocsStatus: Locator;
  readonly checkSubmitItem: Locator;
  readonly checkSubmitStatus: Locator;
  
  // Action buttons
  readonly saveAndCloseButton: Locator;
  readonly guidanceLink: Locator;
  readonly contactEmail: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main content locators
    this.heading = page.getByRole('heading', { name: 'Create an application with the Trade Remedies Authority', level: 1 });
    this.prepareInfoHeading = page.getByRole('heading', { name: 'Prepare your application information', level: 2 });
    this.prepareDocsHeading = page.getByRole('heading', { name: 'Prepare and submit your documentation', level: 2 });
    
    // Task lists (there are two on the page)
    this.taskLists = page.locator('ul.govuk-task-list');
    
    // First task list items - Application Information
    this.organisationInfoLink = page.locator('a.govuk-task-list__link', { hasText: 'Organisation information' });
    this.organisationInfoStatus = page.locator('#prepare-application-1-status');
    this.aboutGoodsItem = page.locator('.govuk-task-list__item', { hasText: 'About the goods' });
    this.aboutGoodsStatus = page.locator('#prepare-application-2-status');
    
    // Second task list items - Documentation
    this.downloadDocsItem = page.locator('.govuk-task-list__item', { hasText: 'Download documents' });
    this.downloadDocsStatus = page.locator('#submit-documentation-1-status');
    this.uploadDocsItem = page.locator('.govuk-task-list__item', { hasText: 'Upload documents' });
    this.uploadDocsStatus = page.locator('#submit-documentation-2-status');
    this.checkSubmitItem = page.locator('.govuk-task-list__item', { hasText: 'Check and submit your application' });
    this.checkSubmitStatus = page.locator('#submit-documentation-3-status');
    
    // Action buttons and links
    this.saveAndCloseButton = page.getByRole('link', { name: 'Save and close' });
    this.guidanceLink = page.getByRole('link', { name: 'Read the guidance documents' });
    this.contactEmail = page.getByRole('link', { name: 'contact@traderemedies.gov.uk' });
  }

  /**
   * Verify that the page has loaded correctly with all key elements visible
   */
  async verifyPageStructure(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.prepareInfoHeading).toBeVisible();
    await expect(this.prepareDocsHeading).toBeVisible();
    
    // Verify both task lists are present
    await expect(this.taskLists).toHaveCount(2);
    
    await expect(this.saveAndCloseButton).toBeVisible();
    await expect(this.guidanceLink).toBeVisible();
    await expect(this.contactEmail).toBeVisible();
  }

  /**
   * Verify the Organisation Information task is available and in "Not started" state
   */
  async verifyOrganisationInfoTask(): Promise<void> {
    await expect(this.organisationInfoLink).toBeVisible();
    await expect(this.organisationInfoStatus).toContainText('Not started');
  }

  /**
   * Verify the About the goods task shows "Cannot start yet" and is not clickable
   */
  async verifyAboutGoodsTaskLocked(): Promise<void> {
    await expect(this.aboutGoodsItem).toBeVisible();
    await expect(this.aboutGoodsStatus).toContainText('Cannot start yet');
    
    // Verify there's no link (task is locked)
    const hasLink = await this.aboutGoodsItem.locator('a').count();
    expect(hasLink).toBe(0);
  }

  /**
   * Verify all documentation tasks show "Cannot start yet" and are not clickable
   */
  async verifyDocumentationTasksLocked(): Promise<void> {
    // Download documents
    await expect(this.downloadDocsItem).toBeVisible();
    await expect(this.downloadDocsStatus).toContainText('Cannot start yet');
    
    // Upload documents
    await expect(this.uploadDocsItem).toBeVisible();
    await expect(this.uploadDocsStatus).toContainText('Cannot start yet');
    
    // Check and submit
    await expect(this.checkSubmitItem).toBeVisible();
    await expect(this.checkSubmitStatus).toContainText('Cannot start yet');
    
    // Verify none of them have links (all locked)
    const downloadLinks = await this.downloadDocsItem.locator('a').count();
    const uploadLinks = await this.uploadDocsItem.locator('a').count();
    const submitLinks = await this.checkSubmitItem.locator('a').count();
    
    expect(downloadLinks).toBe(0);
    expect(uploadLinks).toBe(0);
    expect(submitLinks).toBe(0);
  }

  /**
   * Click the Organisation information link to start the application
   */
  async clickOrganisationInfo(): Promise<void> {
    await this.organisationInfoLink.click();
  }

  /**
   * Click Save and close button
   */
  async clickSaveAndClose(): Promise<void> {
    await this.saveAndCloseButton.click();
  }
}
