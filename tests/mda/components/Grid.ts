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
 * Waits for grid to be fully ready with data
 */
  async waitForGridReady(): Promise<void> {
    try {
      await this.page.waitForSelector('#progressIndicatorContainer', { state: 'hidden', timeout: 5000 });
    } catch (error) {
      // Spinner might not be present or already hidden, continue with grid checks
      console.log('Progress indicator not found or already hidden, proceeding...');
    }

    await this.page.waitForSelector('div.ag-root', { state: 'visible' });
    await this.page.waitForSelector('div[role="row"][row-index="0"]', { state: 'visible' });
  }

  /**
   * Opens the record in the grid at the n-th index by double-clicking the checkbox column
   * @param recordNumber Zero-based index of the record to open
   */
  async openNthRecord(recordNumber: number): Promise<void> {
    await this.waitForGridReady();

    // Always use column 1 (checkbox column) - most reliable for opening main record
    const selector = `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="1"]`;
    const targetElement = await this.page.$(selector);

    if (!targetElement) {
      throw new Error(`Failed to find row ${recordNumber} in ${this.gridContext}.`);
    }

    await targetElement.dblclick();
    await this.xrmHelper.waitForXrmReady();
  }

  /**
   * Gets all visible column headers and their indices
   */
  async getColumnInfo(): Promise<Array<{ index: number, text: string }>> {
    await this.waitForGridReady();

    const headerCells = await this.page.$$('div.ag-header-row div[role="columnheader"]');
    const columns = [];

    for (let i = 0; i < headerCells.length; i++) {
      const cell = headerCells[i];
      const text = await cell.textContent() || '';
      const ariaColIndex = await cell.getAttribute('aria-colindex');

      if (ariaColIndex && !isNaN(parseInt(ariaColIndex))) {
        columns.push({
          index: parseInt(ariaColIndex),
          text: text.trim()
        });
      }
    }

    return columns;
  }

  /**
   * Gets the column index by column header name
   * @param columnName The display name of the column header (e.g., "Account Name", "Status")
   * @returns The aria-colindex value for the column
   * @throws Error if column is not found in the current view
   */
  async getColumnIndexByName(columnName: string): Promise<number> {
    const columns = await this.getColumnInfo();
    const column = columns.find(c => c.text === columnName);

    if (!column) {
      throw new Error(`Column "${columnName}" not found in ${this.gridContext}. Available columns: ${columns.map(c => c.text).join(', ')}`);
    }

    return column.index;
  }

  /**
   * Clicks a lookup link in a specific cell to navigate to the related record
   * @param recordNumber Zero-based row index
   * @param columnNameOrIndex Column name (e.g., "Account Name") or aria-colindex number
   */
  async clickLookupLink(recordNumber: number, columnNameOrIndex: string | number): Promise<void> {
    await this.waitForGridReady();

    // Resolve column name to index if needed
    const columnIndex = typeof columnNameOrIndex === 'string'
      ? await this.getColumnIndexByName(columnNameOrIndex)
      : columnNameOrIndex;

    const lookupSelector = `div[role="row"][row-index="${recordNumber}"] div[aria-colindex="${columnIndex}"] a.ms-Link`;
    const lookupElement = await this.page.$(lookupSelector);

    if (!lookupElement) {
      throw new Error(`No lookup link found at row ${recordNumber}, column ${columnNameOrIndex} in ${this.gridContext}`);
    }

    await lookupElement.click();
  }

}
