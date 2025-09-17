import { Page } from '@playwright/test';
import{ XrmHelper } from '../utils/XrmHelper';

export class Grid {
  readonly gridContext: string;
  readonly page: Page;
  private xrmHelper: XrmHelper;

  constructor(page: Page, gridContext: string = 'grid') {
    this.gridContext = gridContext;
    this.page = page;
    this.xrmHelper = new XrmHelper(page);
  }

  /**
   * Opens the record in the grid at the n-th index by double-clicking
   * @param recordNumber Zero-based index of the record to open
   * @param columnIndex Column to click (defaults to 2 - the main record field)
   */
  async openNthRecord(recordNumber: number, columnIndex: number = 2): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();
    
    // Find specific row and column
    const selector = `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="${columnIndex}"]`;
    
    const targetElement = await this.page.$(selector);

    if (!targetElement) {
      throw new Error(`Failed to find column ${columnIndex} in row ${recordNumber} for ${this.gridContext}. Available rows: ${await this.getGridRowCount()}`);
    }

    await targetElement.dblclick();
    await this.xrmHelper.waitForXrmReady();
  }

  /**
   * Opens the main record (always uses column 2 - the primary field)
   */
  async openRecordMainField(recordNumber: number): Promise<void> {
    await this.openNthRecord(recordNumber, 2);
  }

  /**
   * Clicks a specific column in a record (useful for lookup fields)
   */
  async clickRecordColumn(recordNumber: number, columnIndex: number): Promise<void> {
    await this.openNthRecord(recordNumber, columnIndex);
  }

  /**
   * Selects the record in the grid at the n-th index by clicking the checkbox
   */
  async selectNthRecord(recordNumber: number): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();
    
    // Try to click the checkbox first (more reliable for selection)
    const checkboxSelectors = [
      `div[role="row"][row-index="${recordNumber}"] input[type="checkbox"]`,
      `div[role="row"][row-index="${recordNumber}"] .ms-Checkbox-checkbox`,
      `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="1"]`, // First column (status/checkbox)
    ];

    let element = null;
    for (const selector of checkboxSelectors) {
      element = await this.page.$(selector);
      if (element) break;
    }

    if (!element) {
      throw new Error(`Failed to find checkbox for row ${recordNumber} in ${this.gridContext}`);
    }

    await element.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Gets the total number of data rows in the grid (excluding header)
   */
  async getGridRowCount(): Promise<number> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();
    
    // Use the selectors proven to work from debug
    const selectors = [
      'div.ag-row', // Primary: data rows only
      'div[row-index]', // Backup: includes data rows with index
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
   * Waits for grid to be fully ready with data
   */
  async waitForGridReady(): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    
    // Wait for AG-Grid root to be present
    await this.page.waitForSelector('div.ag-root', { state: 'visible', timeout: 15000 });
    
    // Wait for at least one data row to appear (not just header)
    await this.page.waitForSelector('div[role="row"][row-index="0"]', { state: 'visible', timeout: 15000 });
    
    // Small buffer to ensure grid is stable
    await this.page.waitForTimeout(1000);
  }

  /**
   * Gets the text content of a specific cell using column ID
   */
  async getCellText(recordNumber: number, columnId: string): Promise<string> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();
    
    const cellSelector = `div[role="row"][row-index="${recordNumber}"] div[col-id="${columnId}"]`;
    const cellElement = await this.page.$(cellSelector);

    if (!cellElement) {
      throw new Error(`Failed to find cell at row ${recordNumber}, column ${columnId} in ${this.gridContext}`);
    }

    return await cellElement.textContent() || '';
  }

  /**
   * Gets the text content of a cell by column index
   */
  async getCellTextByIndex(recordNumber: number, columnIndex: number): Promise<string> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();
    
    const cellSelector = `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="${columnIndex}"]`;
    const cellElement = await this.page.$(cellSelector);

    if (!cellElement) {
      throw new Error(`Failed to find cell at row ${recordNumber}, column index ${columnIndex} in ${this.gridContext}`);
    }

    return await cellElement.textContent() || '';
  }

  /**
   * Clicks a specific cell in the grid using column ID
   */
  async clickCell(recordNumber: number, columnId: string): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();
    
    const cellSelector = `div[role="row"][row-index="${recordNumber}"] div[col-id="${columnId}"]`;
    const cellElement = await this.page.$(cellSelector);

    if (!cellElement) {
      throw new Error(`Failed to find cell at row ${recordNumber}, column ${columnId} in ${this.gridContext}`);
    }

    await cellElement.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Clicks a specific cell by column index
   */
  async clickCellByIndex(recordNumber: number, columnIndex: number): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();
    
    const cellSelector = `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="${columnIndex}"]`;
    const cellElement = await this.page.$(cellSelector);

    if (!cellElement) {
      throw new Error(`Failed to find cell at row ${recordNumber}, column index ${columnIndex} in ${this.gridContext}`);
    }

    await cellElement.click();
    await this.page.waitForTimeout(500);
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
    
    // Wait for search results to load
    await this.waitForGridReady();
  }

  /**
   * Combined workflow: search for a record and open it
   */
  async searchAndOpenRecord(searchText: string, recordIndex: number = 0, columnIndex: number = 2): Promise<void> {
    await this.searchForRecord(searchText);
    await this.openNthRecord(recordIndex, columnIndex);
  }

  /**
   * Gets the main field text for a specific row (column 2)
   */
  async getRecordName(recordNumber: number): Promise<string> {
    return await this.getCellTextByIndex(recordNumber, 2);
  }

  /**
   * Checks if a specific row exists
   */
  async hasRecord(recordNumber: number): Promise<boolean> {
    await this.waitForGridReady();
    
    const element = await this.page.$(`div[role="row"][row-index="${recordNumber}"]`);
    return element !== null;
  }

  /**
   * Gets all visible column headers and their indices
   */
  async getColumnInfo(): Promise<Array<{index: number, text: string}>> {
    await this.waitForGridReady();
    
    const headerCells = await this.page.$$('div.ag-header-row div[role="columnheader"]');
    const columns = [];
    
    for (let i = 0; i < headerCells.length; i++) {
      const cell = headerCells[i];
      const text = await cell.textContent() || '';
      const ariaColIndex = await cell.getAttribute('aria-colindex');
      
      if (ariaColIndex) {
        columns.push({
          index: parseInt(ariaColIndex),
          text: text.trim()
        });
      }
    }
    
    return columns;
  }

  /**
   * Double-clicks on any element within a specific row and column
   */
  async doubleClickCell(recordNumber: number, columnIndex: number): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();
    
    const cellSelector = `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="${columnIndex}"]`;
    const cellElement = await this.page.$(cellSelector);

    if (!cellElement) {
      throw new Error(`Failed to find cell at row ${recordNumber}, column index ${columnIndex} in ${this.gridContext}`);
    }

    await cellElement.dblclick();
    await this.page.waitForTimeout(500);
  }
}