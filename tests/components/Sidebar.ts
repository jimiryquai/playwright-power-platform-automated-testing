// components/Sidebar.ts
import { Page, Locator } from '@playwright/test';

export class Sidebar {
  readonly page: Page;
  readonly interestedPartiesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.interestedPartiesLink = page.locator("li[id='sitemap-entity-subarea_2a27803a']");
    
    // Other sidebar links you might need
    // this.accountsLink = page.locator("li[id='sitemap-entity-subarea_accounts']");
    // this.contactsLink = page.locator("li[id='sitemap-entity-subarea_contacts']");
  }

  async navigateToInterestedParties(): Promise<void> {
    await this.interestedPartiesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToEntity(entityLinkId: string): Promise<void> {
    await this.page.locator(`li[id='${entityLinkId}']`).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Alternative method using aria-label
  async navigateByLabel(ariaLabel: string): Promise<void> {
    await this.page.locator(`li[aria-label='${ariaLabel}']`).click();
    await this.page.waitForLoadState('networkidle');
  }

  async isEntityVisible(entityLinkId: string): Promise<boolean> {
    return await this.page.locator(`li[id='${entityLinkId}']`).isVisible();
  }
}