import { Page } from '@playwright/test';
import{ XrmHelper } from '../utils/XrmHelper';

export class Grid {
  // Constants for grid row calculations
  private static readonly GRID_HEADER_ROWS = 1;
  private static readonly CSS_SELECTOR_OFFSET = 1; // CSS nth-child is 1-based

  readonly gridContext: string; // For better error messages
  readonly page: Page;
  private xrmHelper: XrmHelper;

  constructor(page: Page, gridContext: string = 'grid') {
    this.gridContext = gridContext;
    this.page = page;
    this.xrmHelper = new XrmHelper(page);
  }

  /**
   * Converts zero-based record index to grid row index
   */
  private getGridRowIndex(recordNumber: number): number {
    return recordNumber + Grid.GRID_HEADER_ROWS + Grid.CSS_SELECTOR_OFFSET;
  }

  /**
   * Opens the record in the grid at the n-th index by double-clicking
   */
  async openNthRecord(recordNumber: number): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    
    const rowIndex = this.getGridRowIndex(recordNumber);
    
    const selectors = [
      `[data-lp-id="MscrmControls.Grid.GridControl"] tr:nth-child(${rowIndex})`,
      `[role="grid"] tr:nth-child(${rowIndex})`,
      `.grid-container tr:nth-child(${rowIndex})`,
      `table[role="grid"] tbody tr:nth-child(${recordNumber + Grid.CSS_SELECTOR_OFFSET})`
    ];

    let rowElement = null;
    for (const selector of selectors) {
      rowElement = await this.page.$(selector);
      if (rowElement) break;
    }

    if (!rowElement) {
      throw new Error(`Failed to find grid row ${recordNumber} in ${this.gridContext}. Available rows: ${await this.getGridRowCount()}`);
    }

    await rowElement.dblclick();
    await this.xrmHelper.waitForXrmReady();
  }

  /**
   * Selects the record in the grid at the n-th index by clicking
   */
  async selectNthRecord(recordNumber: number): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    
    const rowIndex = this.getGridRowIndex(recordNumber);
    
    const selectors = [
      `[data-lp-id="MscrmControls.Grid.GridControl"] tr:nth-child(${rowIndex}) td:first-child`,
      `[role="grid"] tr:nth-child(${rowIndex}) [type="checkbox"]`,
      `.grid-container tr:nth-child(${rowIndex}) input[type="checkbox"]`,
      `table[role="grid"] tbody tr:nth-child(${recordNumber + Grid.CSS_SELECTOR_OFFSET}) td:first-child`
    ];

    let element = null;
    for (const selector of selectors) {
      element = await this.page.$(selector);
      if (element) break;
    }

    if (!element) {
      const rowSelectors = [
        `[role="grid"] tr:nth-child(${rowIndex})`,
        `table[role="grid"] tbody tr:nth-child(${recordNumber + Grid.CSS_SELECTOR_OFFSET})`
      ];
      
      for (const selector of rowSelectors) {
        element = await this.page.$(selector);
        if (element) break;
      }
    }

    if (!element) {
      throw new Error(`Failed to find grid row ${recordNumber} to select in ${this.gridContext}`);
    }

    await element.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Gets the total number of data rows in the grid (excluding header)
   */
  async getGridRowCount(): Promise<number> {
    await this.xrmHelper.waitForXrmReady();
    
    const selectors = [
      '[data-lp-id="MscrmControls.Grid.GridControl"] tbody tr',
      '[role="grid"] tbody tr',
      '.grid-container tbody tr'
    ];

    for (const selector of selectors) {
      const rows = await this.page.$$(selector);
      if (rows.length > 0) {
        return rows.length;
      }
    }
    
    return 0;
  }

  /**
   * Searches for a record in the grid
   */
  async searchForRecord(searchText: string): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    
    const searchSelectors = [
      '[data-id="quickFind_text"]',
      '[aria-label*="Search"]',
      'input[placeholder*="Search"]',
      '.ms-SearchBox-field'
    ];

    let searchBox = null;
    for (const selector of searchSelectors) {
      searchBox = await this.page.$(selector);
      if (searchBox) break;
    }

    if (!searchBox) {
      throw new Error(`Could not find search box in ${this.gridContext}`);
    }

    await searchBox.fill('');
    await searchBox.fill(searchText);
    await searchBox.press('Enter');
    
    await this.page.waitForTimeout(2000);
    await this.xrmHelper.waitForXrmReady();
  }

  /**
   * Combined workflow: search for a record and open it
   */
  async searchAndOpenRecord(searchText: string, recordIndex: number = 0): Promise<void> {
    await this.searchForRecord(searchText);
    await this.openNthRecord(recordIndex);
  }

  /**
   * Waits for grid to finish loading/refreshing
   */
  async waitForGridReady(): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    
    const loadingSelectors = [
      '[data-id="loadingSpinner"]',
      '.ms-Spinner',
      '[aria-label*="Loading"]'
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'detached', timeout: 5000 });
      } catch (error) {
        console.warn(`Grid loading selector not found or timeout: ${selector}`, error);
      }
    }

    await this.page.waitForTimeout(1000);
  }
}