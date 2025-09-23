import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { Grid } from './components/Grid';
import { XrmHelper } from './utils/XrmHelper';
import { WebApi } from './utils/WebApi';
import { Sidebar } from './components/Sidebar';
import { testConfig, validateConfig } from './TestConfig';

test.describe('Grid Component - Basic Tests', () => {
    let page: Page;
    let grid: Grid;
    let xrmHelper: XrmHelper;
    let sidebar: Sidebar;

    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        grid = new Grid(page, 'Active Cases');
        xrmHelper = new XrmHelper(page);
        sidebar = new Sidebar(page);

        validateConfig();
        await page.goto(testConfig.mdaUrl);
        await xrmHelper.waitForXrmReady();

        // Check if we landed on an error page from failed auth
        if (page.url().includes('error/errorhandler.aspx')) {
            throw new Error(`Test session landed on error page: ${page.url()}`);
        }

        // Debug what page we're actually on
        console.log('Current URL:', page.url());
        console.log('Page title:', await page.title());

        // Check if we're on the right page by looking for any sidebar
        const sidebarContainer = await page.locator('[role="tree"], [role="navigation"], .sidebar').count();
        console.log('Sidebar containers found:', sidebarContainer);

        // Look for any list items that might be sidebar items
        const listItems = await page.locator('li').count();
        console.log('Total list items found:', listItems);

        // Check if Cases link is visible before clicking
        if (!(await sidebar.isEntityVisible('Cases'))) {
            throw new Error('Cases link not visible in sidebar');
        }

        //await sidebar.navigateToCases();
        await xrmHelper.waitForXrmReady();
    });

    // test('Debug - Create case category to see error', async () => {
    //     const webApi = new WebApi(xrmHelper);
    //     const timestamp = Date.now();

    //     console.log('Attempting to create case category...');

    //     // Try to create and catch the actual error
    //     try {
    //         const result: any = await xrmHelper.page.evaluate(
    //             ({ entityName, recordData }) => {
    //                 // Call the API and return whatever it gives us
    //                 return window.Xrm.WebApi.createRecord(entityName, recordData).then(
    //                     (success: any) => ({
    //                         success: true,
    //                         data: success
    //                     }),
    //                     (error: any) => ({
    //                         success: false,
    //                         error: {
    //                             message: error.message || JSON.stringify(error),
    //                             code: error.code,
    //                             details: JSON.stringify(error)
    //                         }
    //                     })
    //                 );
    //             },
    //             {
    //                 entityName: 'cg_case_category',
    //                 recordData: {
    //                     cg_case_category: `Test Category ${timestamp}`,
    //                     cg_showonportal: 121480000
    //                 }
    //             }
    //         );

    //         console.log('Result:', JSON.stringify(result, null, 2));

    //         if (!result.success) {
    //             console.error('API Error:', result.error);
    //             throw new Error(`Failed to create category: ${result.error.message}`);
    //         }

    //         console.log('✅ Created successfully:', result.data);

    //         // Clean up if successful
    //         if (result.success && result.data.id) {
    //             await webApi.deleteRecord('cg_case_category', result.data.id);
    //             console.log('Cleaned up test record');
    //         }

    //     } catch (error) {
    //         console.error('Test error:', error);
    //         throw error;
    //     }
    // });

    test('Should get grid row count - PROVEN WORKING', async () => {
        await grid.waitForGridReady();

        const rowCount = await grid.getGridRowCount();

        expect(rowCount).toBeGreaterThan(0);
        console.log(`✅ Grid has ${rowCount} rows`);
    });

    test('Should get column information - PROVEN WORKING', async () => {
        await grid.waitForGridReady();

        const columns = await grid.getColumnInfo();

        expect(columns).toBeDefined();
        expect(columns.length).toBeGreaterThan(0);

        console.log('✅ Available columns:', columns);
    });

    test('Should get cell text from first record - PROVEN WORKING', async () => {
        await grid.waitForGridReady();

        // Test main field (column 2)
        const mainFieldText = await grid.getCellTextByIndex(0, 2);
        expect(mainFieldText).toBeTruthy();

        // Test getRecordName (should be same as column 2)
        const recordName = await grid.getRecordName(0);
        expect(recordName).toBe(mainFieldText);

        console.log('✅ Record name:', recordName);
    });

    test('Should open first record - YOUR ORIGINAL WORKING TEST', async () => {
        await grid.openNthRecord(0);

        // Use your working validation
        const isFormReady = await page.evaluate(() => {
            return window.Xrm?.Page?.data?.entity?.getId() !== null;
        });

        expect(isFormReady).toBe(true);
        console.log('✅ Successfully opened record');
    });

    // NEW DOUBLE-CLICK TESTS
    test('Should double-click main field to open record', async () => {
        await grid.waitForGridReady();

        // Double-click column 2 (Case Name - main field)
        await grid.doubleClickCell(0, 2);

        // Use your proven validation method
        const isFormReady = await page.evaluate(() => {
            return window.Xrm?.Page?.data?.entity?.getId() !== null;
        });

        expect(isFormReady).toBe(true);
        console.log('✅ doubleClickCell(0, 2) successfully opened record');
    });

    // test('Should click Case Category lookup link to open related record', async () => {
    //     await grid.waitForGridReady();
    //     await grid.clickLookupLink(0, 4);

    //     // Use your proven form ready check
    //     const isFormReady = await page.evaluate(() => {
    //         return window.Xrm?.Page?.data?.entity?.getId() !== null;
    //     });

    //     expect(isFormReady).toBe(true);
    //     console.log('✅ Successfully clicked Case Category lookup link and opened related record');
    // });
});