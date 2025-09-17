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
   * DEBUG VERSION: Comprehensive DOM inspection
   */
  async openNthRecord(recordNumber: number): Promise<void> {
    await this.xrmHelper.waitForXrmReady();
    
    console.log(`\n=== DEBUG: Trying to open record ${recordNumber} in ${this.gridContext} ===`);
    
    // Wait a bit for grid to populate
    await this.page.waitForTimeout(3000);
    
    // STEP 1: Check all possible grid containers
    console.log('\n--- STEP 1: Grid Containers ---');
    const gridContainers = [
      '[role="grid"]',
      'div.ag-root',
      'div.ag-center-cols-container',
      'div[data-lp-id*="Grid"]',
      '.ms-DetailsList',
      '[class*="grid"]'
    ];
    
    for (const selector of gridContainers) {
      const elements = await this.page.$$(selector);
      console.log(`${selector}: ${elements.length} found`);
      
      if (elements.length > 0) {
        const firstEl = elements[0];
        const classes = await firstEl.getAttribute('class');
        const role = await firstEl.getAttribute('role');
        console.log(`  - First element class: "${classes}"`);
        console.log(`  - First element role: "${role}"`);
      }
    }
    
    // STEP 2: Check all possible row elements
    console.log('\n--- STEP 2: Row Elements ---');
    const rowSelectors = [
      'div[role="row"]',
      'div.ag-row',
      'div[row-index]',
      'tr[role="row"]',
      'div[data-selection-index]',
      '[aria-rowindex]'
    ];
    
    for (const selector of rowSelectors) {
      const elements = await this.page.$$(selector);
      console.log(`${selector}: ${elements.length} found`);
      
      // Show details of first few rows
      for (let i = 0; i < Math.min(3, elements.length); i++) {
        const el = elements[i];
        const rowIndex = await el.getAttribute('row-index');
        const ariaRowIndex = await el.getAttribute('aria-rowindex');
        const dataIndex = await el.getAttribute('data-selection-index');
        const classes = await el.getAttribute('class');
        
        console.log(`  Row ${i}:`);
        console.log(`    - row-index: "${rowIndex}"`);
        console.log(`    - aria-rowindex: "${ariaRowIndex}"`);
        console.log(`    - data-selection-index: "${dataIndex}"`);
        console.log(`    - classes: "${classes?.substring(0, 100)}..."`);
      }
    }
    
    // STEP 3: Try to find specific row
    console.log(`\n--- STEP 3: Looking for record ${recordNumber} ---`);
    const targetSelectors = [
      `div[role="row"][row-index="${recordNumber}"]`,
      `div[role="row"][aria-rowindex="${recordNumber + 1}"]`, // aria-rowindex might be 1-based
      `div[role="row"][aria-rowindex="${recordNumber + 2}"]`, // might skip header
      `div.ag-row[row-index="${recordNumber}"]`,
      `div[role="row"]:nth-child(${recordNumber + 1})`,
      `div[role="row"]:nth-child(${recordNumber + 2})`,
      `tr:nth-child(${recordNumber + 1})`,
      `tr:nth-child(${recordNumber + 2})`
    ];
    
    let foundElement = null;
    let workingSelector = '';
    
    for (const selector of targetSelectors) {
      const element = await this.page.$(selector);
      if (element) {
        foundElement = element;
        workingSelector = selector;
        console.log(`✅ FOUND with selector: "${selector}"`);
        
        // Get element details
        const text = await element.textContent();
        const classes = await element.getAttribute('class');
        console.log(`   - Text content: "${text?.substring(0, 100)}..."`);
        console.log(`   - Classes: "${classes}"`);
        break;
      } else {
        console.log(`❌ NOT FOUND: "${selector}"`);
      }
    }
    
    // STEP 4: Show page screenshot for visual debugging
    console.log('\n--- STEP 4: Taking screenshot ---');
    await this.page.screenshot({ path: `grid-debug-${Date.now()}.png` });
    console.log('Screenshot saved');
    
    // STEP 5: Show current URL and page title
    console.log('\n--- STEP 5: Page Info ---');
    console.log(`URL: ${this.page.url()}`);
    console.log(`Title: ${await this.page.title()}`);
    
    // STEP 6: Try to click if found
    if (foundElement) {
      console.log(`\n--- STEP 6: Attempting click with "${workingSelector}" ---`);
      try {
        await foundElement.dblclick();
        console.log('✅ Double-click successful');
        await this.xrmHelper.waitForXrmReady();
      } catch (error) {
        if (error instanceof Error) {
          console.log(`❌ Double-click failed: ${error.message}`);
        } else {
          console.log(`❌ Double-click failed: ${String(error)}`);
        }
      }
    } else {
      console.log('\n--- STEP 6: NO ELEMENT FOUND TO CLICK ---');
      throw new Error(`Failed to find grid row ${recordNumber} in ${this.gridContext} after comprehensive debug`);
    }
    
    console.log(`=== END DEBUG for record ${recordNumber} ===\n`);
  }

  /**
   * DEBUG VERSION: Show all available rows
   */
  async getGridRowCount(): Promise<number> {
    await this.xrmHelper.waitForXrmReady();
    await this.page.waitForTimeout(2000);
    
    console.log('\n=== DEBUG: getGridRowCount ===');
    
    const allSelectors = [
      'div[role="row"]',
      'div.ag-row',
      'div[row-index]',
      'tr[role="row"]',
      'tr',
      '[aria-rowindex]',
      'div[data-selection-index]'
    ];
    
    let maxCount = 0;
    let bestSelector = '';
    
    for (const selector of allSelectors) {
      const elements = await this.page.$$(selector);
      console.log(`${selector}: ${elements.length} elements`);
      
      if (elements.length > maxCount) {
        maxCount = elements.length;
        bestSelector = selector;
      }
    }
    
    console.log(`\nBest selector: "${bestSelector}" with ${maxCount} rows`);
    console.log('=== END getGridRowCount DEBUG ===\n');
    
    return maxCount;
  }

  /**
   * Simple select method for testing
   */
  async selectNthRecord(recordNumber: number): Promise<void> {
    console.log(`DEBUG: selectNthRecord(${recordNumber}) - not implemented yet`);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for any grid to be present
   */
  async waitForGridReady(): Promise<void> {
    console.log('DEBUG: waitForGridReady starting...');
    await this.xrmHelper.waitForXrmReady();
    
    const gridWaitSelectors = [
      '[role="grid"]',
      'div.ag-root',
      'div[data-lp-id*="Grid"]',
      '.ms-DetailsList'
    ];
    
    for (const selector of gridWaitSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
        console.log(`DEBUG: Found grid with selector: ${selector}`);
        break;
      } catch {
        console.log(`DEBUG: Grid not found with: ${selector}`);
      }
    }
    
    await this.page.waitForTimeout(2000);
    console.log('DEBUG: waitForGridReady completed');
  }

  // Minimal implementations for other methods
  async searchForRecord(searchText: string): Promise<void> {
    console.log(`DEBUG: searchForRecord("${searchText}") - not implemented`);
  }

  async searchAndOpenRecord(searchText: string, recordIndex: number = 0): Promise<void> {
    console.log(`DEBUG: searchAndOpenRecord("${searchText}", ${recordIndex}) - not implemented`);
  }

  async getCellText(recordNumber: number, columnId: string): Promise<string> {
    console.log(`DEBUG: getCellText(${recordNumber}, "${columnId}") - not implemented`);
    return 'DEBUG_TEXT';
  }

  async clickCell(recordNumber: number, columnId: string): Promise<void> {
    console.log(`DEBUG: clickCell(${recordNumber}, "${columnId}") - not implemented`);
  }
}