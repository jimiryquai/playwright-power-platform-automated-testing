import { Page } from '@playwright/test';
import{ XrmHelper } from '../utils/XrmHelper';

export class Grid {
  readonly gridContext: string; // For better error messages
  readonly page: Page;
  private xrmHelper: XrmHelper;

  constructor(page: Page, gridContext: string = 'grid') {
    this.gridContext = gridContext;
    this.page = page;
    this.xrmHelper = new XrmHelper(page);
  }

  /**
   * Opens the record in the grid at the n-th index by double-clicking
   */
  async openNthRecord(recordNumber: number): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    
    const selectors = [
      // AG-Grid selectors (for D365)
      `div[role="row"][row-index="${recordNumber}"]`,
      `div.ag-row[row-index="${recordNumber}"]`,
      // Fallback selectors
      `div[role="row"]:nth-child(${recordNumber + 1})`,
      `[role="grid"] tr:nth-child(${recordNumber + 2})`, // Legacy table support
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
    
    // For AG-Grid, try to click the checkbox first
    const checkboxSelectors = [
      `div[role="row"][row-index="${recordNumber}"] input[type="checkbox"]`,
      `div.ag-row[row-index="${recordNumber}"] input[type="checkbox"]`,
      `div[role="row"][row-index="${recordNumber}"] .ms-Checkbox-checkbox`,
    ];

    let element = null;
    for (const selector of checkboxSelectors) {
      element = await this.page.$(selector);
      if (element) break;
    }

    // If no checkbox found, click the row itself
    if (!element) {
      const rowSelectors = [
        `div[role="row"][row-index="${recordNumber}"]`,
        `div.ag-row[row-index="${recordNumber}"]`,
        `div[role="row"]:nth-child(${recordNumber + 1})`,
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
   * Gets the total number of data rows in the grid
   */
  async getGridRowCount(): Promise<number> {
    await this.xrmHelper.waitForXrmReady();
    
    const selectors = [
      // AG-Grid selectors
      'div[role="row"].ag-row',
      'div[role="row"][row-index]',
      // Fallback selectors
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
    
    // Wait for AG-Grid to be present
    const gridSelectors = [
      'div[role="grid"].ag-root',
      'div.ag-root',
      '[role="grid"]'
    ];

    let gridFound = false;
    for (const selector of gridSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        gridFound = true;
        break;
      } catch {
        // Try next selector
      }
    }

    if (!gridFound) {
      throw new Error(`Grid not found in ${this.gridContext}`);
    }

    // Wait for any loading indicators to disappear
    const loadingSelectors = [
      '[data-id="loadingSpinner"]',
      '.ms-Spinner',
      '[aria-label*="Loading"]',
      '.ag-overlay-loading-wrapper'
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'detached', timeout: 5000 });
      } catch {
        // Loading indicator might not exist, continue
      }
    }

    await this.page.waitForTimeout(1000);
  }

  /**
   * Gets the text content of a specific cell
   */
  async getCellText(recordNumber: number, columnId: string): Promise<string> {
    await this.xrmHelper.waitForXrmReady();
    
    const selectors = [
      `div[role="row"][row-index="${recordNumber}"] div[col-id="${columnId}"]`,
      `div.ag-row[row-index="${recordNumber}"] div[col-id="${columnId}"]`,
    ];

    let cellElement = null;
    for (const selector of selectors) {
      cellElement = await this.page.$(selector);
      if (cellElement) break;
    }

    if (!cellElement) {
      throw new Error(`Failed to find cell at row ${recordNumber}, column ${columnId} in ${this.gridContext}`);
    }

    return await cellElement.textContent() || '';
  }

  /**
   * Clicks a specific cell in the grid
   */
  async clickCell(recordNumber: number, columnId: string): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    
    const selectors = [
      `div[role="row"][row-index="${recordNumber}"] div[col-id="${columnId}"]`,
      `div.ag-row[row-index="${recordNumber}"] div[col-id="${columnId}"]`,
    ];

    let cellElement = null;
    for (const selector of selectors) {
      cellElement = await this.page.$(selector);
      if (cellElement) break;
    }

    if (!cellElement) {
      throw new Error(`Failed to find cell at row ${recordNumber}, column ${columnId} in ${this.gridContext}`);
    }

    await cellElement.click();
    await this.page.waitForTimeout(500);
  }
}