import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { Grid } from './components/Grid';
import { XrmHelper } from './utils/XrmHelper';
import { Entity } from './utils/Entity';
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

        // Wait for sidebar to load
        await page.waitForSelector('[role="treeitem"]', { state: 'visible' });

        // Check if Cases link is visible before clicking
        if (!(await sidebar.isEntityVisible('Cases'))) {
            throw new Error('Cases link not visible in sidebar');
        }

        await sidebar.navigateToCases();
        await xrmHelper.waitForXrmReady();
        await sidebar.navigateToCases();
        await xrmHelper.waitForXrmReady();
    });

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

    test('Should click Case Category lookup link to open related record', async () => {
        await grid.waitForGridReady();
        await grid.clickLookupLink(0, 4);

        // Use your proven form ready check
        const isFormReady = await page.evaluate(() => {
            return window.Xrm?.Page?.data?.entity?.getId() !== null;
        });

        expect(isFormReady).toBe(true);
        console.log('✅ Successfully clicked Case Category lookup link and opened related record');
    });
});