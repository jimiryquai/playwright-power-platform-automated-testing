// components/Sidebar.ts
import { Page } from '@playwright/test';

export class Sidebar {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToInterestedParties(): Promise<void> {
    const locator = this.page.locator('[aria-label="Interested Parties"]');
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async navigateToCases(): Promise<void> {
    const locator = this.page.locator('[aria-label="Cases"]');
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  // Generic method using aria-label - most reliable approach
  async navigateByAriaLabel(ariaLabel: string): Promise<void> {
    const locator = this.page.locator(`[aria-label="${ariaLabel}"]`);
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  // Check if entity is visible using aria-label
  async isEntityVisible(ariaLabel: string): Promise<boolean> {
    return await this.page.locator(`[aria-label="${ariaLabel}"]`).isVisible();
  }
}