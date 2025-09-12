import { Page } from '@playwright/test';

// TypeScript interface for Xrm
declare global {
  interface Window {
    Xrm: Xrm.XrmStatic;
  }
}

/**
 * XrmHelper - Utility class providing core D365/Xrm waiting functionality
 */
export class XrmHelper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for Xrm to be available (simple UCI assumption)
   */
  async waitForXrmReady(): Promise<void> {
    await this.page.waitForFunction(
      () => typeof window.Xrm !== 'undefined' && window.Xrm.Page,
      { timeout: 60000 }
    );
  }
}
