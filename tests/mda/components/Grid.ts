import { Page } from '@playwright/test';
import { XrmHelper } from '../utils/XrmHelper';

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
   * TESTED ✅ - Opens the record in the grid at the n-th index by double-clicking
   * @param recordNumber Zero-based index of the record to open
   * @param columnIndex Column to click (defaults to 2 - the main record field)
   */
  async openNthRecord(recordNumber: number, columnIndex: number = 2): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();

    const selector = `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="${columnIndex}"]`;
    const targetElement = await this.page.$(selector);

    if (!targetElement) {
      throw new Error(`Failed to find column ${columnIndex} in row ${recordNumber} for ${this.gridContext}. Available rows: ${await this.getGridRowCount()}`);
    }

    await targetElement.dblclick();
    await this.xrmHelper.waitForXrmReady();
  }

  /**
   * TESTED ✅ - Gets the total number of data rows in the grid (excluding header)
   */
  async getGridRowCount(): Promise<number> {
    await this.xrmHelper.waitForXrmReady();
    await this.waitForGridReady();

    const selectors = [
      'div.ag-row',
      'div[row-index]',
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
   * TESTED ✅ - Waits for grid to be fully ready with data
   */
  async waitForGridReady(): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    await this.page.waitForSelector('div.ag-root', { state: 'visible', timeout: 15000 });
    await this.page.waitForSelector('div[role="row"][row-index="0"]', { state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * TESTED ✅ - Gets the text content of a cell by column index
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
   * TESTED ✅ - Gets the main field text for a specific row (column 2)
   */
  async getRecordName(recordNumber: number): Promise<string> {
    return await this.getCellTextByIndex(recordNumber, 2);
  }

  /**
   * TESTED ✅ - Gets all visible column headers and their indices
   */
  async getColumnInfo(): Promise<Array<{ index: number, text: string }>> {
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
   * TESTED ✅ - Clicks a lookup link in a specific cell to open the related record
   * @param recordNumber Zero-based row index
   * @param columnIndex Column containing the lookup field
   */
  async clickLookupLink(recordNumber: number, columnIndex: number): Promise<void> {
    const lookupSelector = `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="${columnIndex}"] a.ms-Link`;

    const lookupElement = await this.page.$(lookupSelector);

    if (!lookupElement) {
      throw new Error(`No lookup link found at row ${recordNumber}, column ${columnIndex} in ${this.gridContext}`);
    }

    await lookupElement.click();
  }
}