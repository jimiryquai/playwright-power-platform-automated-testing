import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { Grid } from './components/Grid';
import { XrmHelper } from './utils/XrmHelper';
import { Sidebar } from './components/Sidebar';
import { WebApi } from './utils/WebApi';
import { testConfig, validateConfig } from './TestConfig';

test.describe('Enhanced Grid Component - Comprehensive Tests', () => {
  let page: Page;
  let grid: Grid;
  let xrmHelper: XrmHelper;
  let sidebar: Sidebar;
  let webApi: WebApi;
  let testAccountIds: string[] = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    grid = new Grid(page);
    xrmHelper = new XrmHelper(page);
    sidebar = new Sidebar(page);
    webApi = new WebApi(xrmHelper);
    testAccountIds = [];

    validateConfig();
    await page.goto(testConfig.mdaUrl);
    await xrmHelper.waitForXrmReady();

    // Create test data - 5 accounts to work with
    console.log('Creating test accounts...');
    for (let i = 1; i <= 5; i++) {
      const account = await webApi.createRecord('account', {
        name: `Grid Test Account ${i} - ${Date.now()}`
      });
      
      if (account.id) {
        testAccountIds.push(account.id);
      }
    }
    console.log(`Created ${testAccountIds.length} test accounts`);

    // Navigate to Accounts using Sidebar
    await sidebar.navigateByAriaLabel('Accounts');
    await grid.waitForGridReady();
  });

  test.afterEach(async () => {
    // Clean up test data
    console.log(`Cleaning up ${testAccountIds.length} test accounts...`);
    for (const accountId of testAccountIds) {
      try {
        await webApi.deleteRecord('account', accountId);
      } catch (error) {
        console.error(`Failed to delete account ${accountId}:`, error);
      }
    }
    testAccountIds = [];
    console.log('Cleanup complete');
  });

  /* ============================================
   * CORE GRID OPERATIONS
   * ============================================ */

  // test('@grid @core Should wait for grid to be ready', async () => {
  //   await grid.waitForGridReady();
    
  //   // Verify grid is visible
  //   const gridRoot = await page.locator('div.ag-root').isVisible();
  //   expect(gridRoot).toBe(true);
    
  //   console.log('✓ Grid loaded successfully');
  // });

  // test('@grid @core Should open a record', async () => {
  //   const initialUrl = page.url();
    
  //   await grid.openNthRecord(0);
    
  //   // URL should change to record form
  //   const newUrl = page.url();
  //   expect(newUrl).not.toBe(initialUrl);
  //   expect(newUrl).toContain('main.aspx');
    
  //   console.log('✓ Record opened successfully');
  // });

  // test('@grid @core Should get column information', async () => {
  //   const columns = await grid.getColumnInfo();
    
  //   expect(columns).toBeDefined();
  //   expect(columns.length).toBeGreaterThan(0);
    
  //   // Should have typical account columns
  //   const columnNames = columns.map(c => c.text);
  //   console.log('✓ Available columns:', columnNames.join(', '));
    
  //   expect(columnNames.length).toBeGreaterThan(2);
  // });

  // test('@grid @core Should get column index by name', async () => {
  //   const columns = await grid.getColumnInfo();
  //   const firstColumnName = columns[1].text; // Skip checkbox column
    
  //   const columnIndex = await grid.getColumnIndexByName(firstColumnName);
    
  //   expect(columnIndex).toBe(columns[1].index);
  //   console.log(`✓ Found column "${firstColumnName}" at index ${columnIndex}`);
  // });

  // test('@grid @core Should throw error for non-existent column', async () => {
  //   try {
  //     await grid.getColumnIndexByName('NonExistentColumn123');
  //     throw new Error('Should have thrown an error');
  //   } catch (error: any) {
  //     expect(error.message).toContain('not found');
  //     expect(error.message).toContain('Available columns');
  //     console.log('✓ Error handling works correctly');
  //   }
  // });

  /* ============================================
   * SELECT ALL RECORDS
   * ============================================ */

  test('@grid @selection Should select all records', async () => {
    await grid.selectAllRecords();
    
    const allSelected = await grid.areAllRecordsSelected();
    expect(allSelected).toBe(true);
    
    console.log('✓ All records selected');
  });

  // test('@grid @selection Should deselect all records', async () => {
  //   // First select all
  //   await grid.selectAllRecords();
  //   let allSelected = await grid.areAllRecordsSelected();
  //   expect(allSelected).toBe(true);
    
  //   // Then deselect
  //   await grid.deselectAllRecords();
  //   allSelected = await grid.areAllRecordsSelected();
  //   expect(allSelected).toBe(false);
    
  //   console.log('✓ All records deselected');
  // });

  // test('@grid @selection Should toggle select all', async () => {
  //   // Initially not selected
  //   let allSelected = await grid.areAllRecordsSelected();
  //   const initialState = allSelected;
    
  //   // Select all
  //   await grid.selectAllRecords();
  //   allSelected = await grid.areAllRecordsSelected();
  //   expect(allSelected).toBe(true);
    
  //   // Toggle back
  //   await grid.selectAllRecords();
  //   allSelected = await grid.areAllRecordsSelected();
  //   expect(allSelected).toBe(false);
    
  //   console.log('✓ Toggle select all works');
  // });

  /* ============================================
   * INDIVIDUAL ROW SELECTION
   * ============================================ */

  // test('@grid @selection Should select individual record', async () => {
  //   await grid.selectNthRecord(0);
    
  //   const isSelected = await grid.isRecordSelected(0);
  //   expect(isSelected).toBe(true);
    
  //   console.log('✓ Individual record selected');
  // });

  // test('@grid @selection Should select multiple individual records', async () => {
  //   // Select first 3 records
  //   await grid.selectNthRecord(0);
  //   await grid.selectNthRecord(1);
  //   await grid.selectNthRecord(2);
    
  //   // Verify all are selected
  //   const record0Selected = await grid.isRecordSelected(0);
  //   const record1Selected = await grid.isRecordSelected(1);
  //   const record2Selected = await grid.isRecordSelected(2);
    
  //   expect(record0Selected).toBe(true);
  //   expect(record1Selected).toBe(true);
  //   expect(record2Selected).toBe(true);
    
  //   console.log('✓ Multiple records selected');
  // });

  // test('@grid @selection Should check unselected record returns false', async () => {
  //   const isSelected = await grid.isRecordSelected(0);
  //   expect(isSelected).toBe(false);
    
  //   console.log('✓ Unselected record check works');
  // });

  /* ============================================
   * COLUMN HEADER MENU
   * ============================================ */

  // test('@grid @columnmenu Should open column header menu', async () => {
  //   const columns = await grid.getColumnInfo();
  //   const testColumn = columns[2]; // Skip checkbox and first column
    
  //   await grid.openColumnHeaderMenu(testColumn.text);
    
  //   // Verify menu is visible
  //   const menu = await page.locator('div[data-testid="columnContextMenu"]').isVisible();
  //   expect(menu).toBe(true);
    
  //   await grid.closeColumnMenu();
  //   console.log(`✓ Opened menu for column: ${testColumn.text}`);
  // });

  // test('@grid @columnmenu Should close column menu', async () => {
  //   const columns = await grid.getColumnInfo();
  //   const testColumn = columns[2];
    
  //   await grid.openColumnHeaderMenu(testColumn.text);
    
  //   let menuVisible = await page.locator('div[data-testid="columnContextMenu"]').isVisible();
  //   expect(menuVisible).toBe(true);
    
  //   await grid.closeColumnMenu();
    
  //   menuVisible = await page.locator('div[data-testid="columnContextMenu"]').isVisible();
  //   expect(menuVisible).toBe(false);
    
  //   console.log('✓ Column menu closed');
  // });

  // test('@grid @columnmenu Should throw error for non-existent column header', async () => {
  //   try {
  //     await grid.openColumnHeaderMenu('NonExistentColumn123');
  //     throw new Error('Should have thrown an error');
  //   } catch (error: any) {
  //     expect(error.message).toContain('not found');
  //     console.log('✓ Error handling for invalid column works');
  //   }
  // });

  /* ============================================
   * COLUMN SORTING
   * ============================================ */

  // test('@grid @sort Should sort column A to Z', async () => {
  //   const columns = await grid.getColumnInfo();
  //   // Find a text column (usually Account Name or similar)
  //   const testColumn = columns.find(c => c.text.includes('Name')) || columns[2];
    
  //   await grid.sortColumnAtoZ(testColumn.text);
    
  //   const sortState = await grid.getColumnSortState(testColumn.text);
  //   expect(sortState).toBe('asc');
    
  //   console.log(`✓ Sorted "${testColumn.text}" A to Z`);
  // });

  // test('@grid @sort Should sort column Z to A', async () => {
  //   const columns = await grid.getColumnInfo();
  //   const testColumn = columns.find(c => c.text.includes('Name')) || columns[2];
    
  //   await grid.sortColumnZtoA(testColumn.text);
    
  //   const sortState = await grid.getColumnSortState(testColumn.text);
  //   expect(sortState).toBe('desc');
    
  //   console.log(`✓ Sorted "${testColumn.text}" Z to A`);
  // });

  // test('@grid @sort Should toggle sort direction', async () => {
  //   const columns = await grid.getColumnInfo();
  //   const testColumn = columns.find(c => c.text.includes('Name')) || columns[2];
    
  //   // Sort ascending
  //   await grid.sortColumnAtoZ(testColumn.text);
  //   let sortState = await grid.getColumnSortState(testColumn.text);
  //   expect(sortState).toBe('asc');
    
  //   // Sort descending
  //   await grid.sortColumnZtoA(testColumn.text);
  //   sortState = await grid.getColumnSortState(testColumn.text);
  //   expect(sortState).toBe('desc');
    
  //   console.log('✓ Sort direction toggle works');
  // });

  // test('@grid @sort Should return null for unsorted column', async () => {
  //   const columns = await grid.getColumnInfo();
  //   // Get a column that's likely not sorted
  //   const testColumn = columns[columns.length - 1];
    
  //   const sortState = await grid.getColumnSortState(testColumn.text);
    
  //   // Should be null or one of the sort states
  //   expect(['asc', 'desc', null]).toContain(sortState);
  //   console.log(`✓ Column "${testColumn.text}" sort state: ${sortState || 'none'}`);
  // });

  /* ============================================
   * COLUMN FILTER
   * ============================================ */

  // test('@grid @filter Should open filter menu', async () => {
  //   const columns = await grid.getColumnInfo();
  //   const testColumn = columns.find(c => c.text.includes('Name')) || columns[2];
    
  //   await grid.openFilterMenu(testColumn.text);
    
  //   // Wait for filter panel to appear
  //   const filterPanel = await page.locator('div[role="dialog"], div.ms-Panel').isVisible();
  //   expect(filterPanel).toBe(true);
    
  //   console.log(`✓ Opened filter menu for "${testColumn.text}"`);
  // });

  /* ============================================
   * GRID SEARCH
   * ============================================ */

  // test('@grid @search Should search grid', async () => {
  //   // Use a simple search term
  //   await grid.searchGrid('test');
    
  //   // Grid should still be ready after search
  //   await grid.waitForGridReady();
    
  //   console.log('✓ Grid search executed');
  // });

  // test('@grid @search Should clear grid search', async () => {
  //   // Search first
  //   await grid.searchGrid('test');
  //   await grid.waitForGridReady();
    
  //   // Clear search
  //   await grid.clearGridSearch();
  //   await grid.waitForGridReady();
    
  //   console.log('✓ Grid search cleared');
  // });

  /* ============================================
   * COMMAND BAR
   * ============================================ */

  // test('@grid @commandbar Should open edit columns', async () => {
  //   await grid.openEditColumns();
    
  //   // Panel should be visible
  //   const panel = await page.locator('div[role="dialog"], div.ms-Panel').isVisible();
  //   expect(panel).toBe(true);
    
  //   console.log('✓ Edit columns panel opened');
  // });

  // test('@grid @commandbar Should open edit filters', async () => {
  //   await grid.openEditFilters();
    
  //   // Panel should be visible
  //   const panel = await page.locator('div[role="dialog"], div.ms-Panel').isVisible();
  //   expect(panel).toBe(true);
    
  //   console.log('✓ Edit filters panel opened');
  // });

  /* ============================================
   * VIEW SELECTOR
   * ============================================ */

  // test('@grid @viewselector Should open view selector', async () => {
  //   await grid.openViewSelector();
    
  //   // View selector popup should be visible
  //   const viewSelector = await page.locator('div[data-id*="ViewSelector"]').isVisible();
  //   expect(viewSelector).toBe(true);
    
  //   // Close it
  //   await page.keyboard.press('Escape');
    
  //   console.log('✓ View selector opened');
  // });

  // test('@grid @viewselector Should get current view', async () => {
  //   const currentView = await grid.getCurrentView();
    
  //   expect(currentView).toBeTruthy();
  //   expect(currentView.length).toBeGreaterThan(0);
    
  //   console.log(`✓ Current view: "${currentView}"`);
  // });

  // test('@grid @viewselector Should get available views', async () => {
  //   const views = await grid.getAvailableViews();
    
  //   expect(views).toBeDefined();
  //   expect(views.length).toBeGreaterThan(0);
    
  //   console.log(`✓ Found ${views.length} views:`, views.join(', '));
  // });

  // test('@grid @viewselector Should select a different view', async () => {
  //   // Get available views
  //   const views = await grid.getAvailableViews();
  //   const currentView = await grid.getCurrentView();
    
  //   // Find a different view to switch to
  //   const differentView = views.find(v => v !== currentView);
    
  //   if (differentView) {
  //     await grid.selectView(differentView);
      
  //     // Verify view changed
  //     const newView = await grid.getCurrentView();
  //     expect(newView).toBe(differentView);
      
  //     console.log(`✓ Changed view from "${currentView}" to "${differentView}"`);
  //   } else {
  //     console.log('⚠ Only one view available, skipping view change test');
  //   }
  // });

  // test('@grid @viewselector Should search views', async () => {
  //   await grid.openViewSelector();
    
  //   // Search for "Active"
  //   await grid.searchViews('Active');
    
  //   // Should still have view buttons visible
  //   const viewButtons = await page.locator(
  //     'div[data-id*="ViewSelector"] button[role="menuitemradio"]'
  //   ).count();
    
  //   expect(viewButtons).toBeGreaterThan(0);
    
  //   await page.keyboard.press('Escape');
    
  //   console.log(`✓ View search returned ${viewButtons} results`);
  // });

  /* ============================================
   * LOOKUP LINK INTERACTIONS
   * ============================================ */

  // test('@grid @lookup Should click lookup link by column index', async () => {
  //   const columns = await grid.getColumnInfo();
    
  //   // Find a column that's likely to have lookup links (usually contains "Name")
  //   // This test might need adjustment based on actual grid structure
  //   const lookupColumn = columns.find(c => 
  //     c.text.includes('Primary Contact') || 
  //     c.text.includes('Parent Account') ||
  //     c.text.includes('Owner')
  //   );
    
  //   if (lookupColumn) {
  //     const initialUrl = page.url();
      
  //     await grid.clickLookupLink(0, lookupColumn.index);
      
  //     // URL should change
  //     const newUrl = page.url();
  //     expect(newUrl).not.toBe(initialUrl);
      
  //     console.log(`✓ Clicked lookup link in "${lookupColumn.text}"`);
  //   } else {
  //     console.log('⚠ No lookup columns found, skipping test');
  //   }
  // });

  // test('@grid @lookup Should click lookup link by column name', async () => {
  //   const columns = await grid.getColumnInfo();
    
  //   // Find a lookup column
  //   const lookupColumn = columns.find(c => 
  //     c.text.includes('Primary Contact') || 
  //     c.text.includes('Parent Account') ||
  //     c.text.includes('Owner')
  //   );
    
  //   if (lookupColumn) {
  //     const initialUrl = page.url();
      
  //     await grid.clickLookupLink(0, lookupColumn.text);
      
  //     // URL should change
  //     const newUrl = page.url();
  //     expect(newUrl).not.toBe(initialUrl);
      
  //     console.log(`✓ Clicked lookup link using column name "${lookupColumn.text}"`);
  //   } else {
  //     console.log('⚠ No lookup columns found, skipping test');
  //   }
  // });

  /* ============================================
   * COMPLEX SCENARIOS
   * ============================================ */

  // test('@grid @complex Should select records then sort', async () => {
  //   // Select first 2 records
  //   await grid.selectNthRecord(0);
  //   await grid.selectNthRecord(1);
    
  //   // Verify selected
  //   expect(await grid.isRecordSelected(0)).toBe(true);
  //   expect(await grid.isRecordSelected(1)).toBe(true);
    
  //   // Sort a column
  //   const columns = await grid.getColumnInfo();
  //   const nameColumn = columns.find(c => c.text.includes('Name')) || columns[2];
  //   await grid.sortColumnAtoZ(nameColumn.text);
    
  //   // Grid should still be ready
  //   await grid.waitForGridReady();
    
  //   console.log('✓ Complex scenario: select + sort completed');
  // });

  // test('@grid @complex Should search then select all results', async () => {
  //   // Search
  //   await grid.searchGrid('account');
    
  //   // Select all search results
  //   await grid.selectAllRecords();
    
  //   // Verify all selected
  //   const allSelected = await grid.areAllRecordsSelected();
  //   expect(allSelected).toBe(true);
    
  //   // Clean up
  //   await grid.clearGridSearch();
    
  //   console.log('✓ Complex scenario: search + select all completed');
  // });

  // test('@grid @complex Should change view then interact with new view', async () => {
  //   const views = await grid.getAvailableViews();
  //   const currentView = await grid.getCurrentView();
  //   const differentView = views.find(v => v !== currentView);
    
  //   if (differentView) {
  //     // Change view
  //     await grid.selectView(differentView);
      
  //     // Get new column info
  //     const columns = await grid.getColumnInfo();
  //     expect(columns.length).toBeGreaterThan(0);
      
  //     // Try to select a record in new view
  //     await grid.selectNthRecord(0);
  //     expect(await grid.isRecordSelected(0)).toBe(true);
      
  //     console.log(`✓ Complex scenario: view change + interaction completed`);
  //   } else {
  //     console.log('⚠ Only one view available, skipping test');
  //   }
  // });

  /* ============================================
   * ERROR HANDLING
   * ============================================ */

  // test('@grid @error Should handle invalid record index gracefully', async () => {
  //   try {
  //     await grid.openNthRecord(9999);
  //     throw new Error('Should have thrown an error');
  //   } catch (error: any) {
  //     expect(error.message).toContain('Failed to find row');
  //     console.log('✓ Invalid record index handled correctly');
  //   }
  // });

  // test('@grid @error Should handle invalid view name gracefully', async () => {
  //   try {
  //     await grid.selectView('NonExistentView123');
  //     throw new Error('Should have thrown an error');
  //   } catch (error: any) {
  //     expect(error.message).toContain('not found');
  //     console.log('✓ Invalid view name handled correctly');
  //   }
  // });
});
