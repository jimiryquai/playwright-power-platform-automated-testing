// components/Sidebar.ts
import { Page, Locator } from '@playwright/test';

export class Sidebar {
  readonly page: Page;
  readonly interestedPartiesLink: Locator;
  readonly casesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.interestedPartiesLink = page.locator("li[id='sitemap-entity-subarea_2a27803a']");
    
    // Other sidebar links you might need
    this.casesLink = page.locator("li[id='sitemap-entity-subarea_1c9aa4d7']");
    // this.contactsLink = page.locator("li[id='sitemap-entity-subarea_contacts']");
  }

  async navigateToInterestedParties(): Promise<void> {
    await this.interestedPartiesLink.click();
  }

  async navigateToCases(): Promise<void> {
    await this.casesLink.click();
  }

  async navigateToEntity(entityLinkId: string): Promise<void> {
    await this.page.locator(`li[id='${entityLinkId}']`).click();
  }

  // Alternative method using aria-label
  async navigateByLabel(ariaLabel: string): Promise<void> {
    await this.page.locator(`li[aria-label='${ariaLabel}']`).click();
  }

  async isEntityVisible(entityLinkId: string): Promise<boolean> {
    return await this.page.locator(`li[id='${entityLinkId}']`).isVisible();
  }
}