import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { Grid } from './components/Grid';
import { XrmHelper } from './utils/XrmHelper';
import { Entity } from './utils/Entity';
import { Sidebar } from './components/Sidebar';
import { testConfig, validateConfig } from '../config/TestConfig';

test.describe('Interested Parties MDA Test', () => {
    let page: Page;
    let grid: Grid;
    let xrmHelper: XrmHelper;
    let entity: Entity;
    let sidebar: Sidebar;

    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        grid = new Grid(page, 'Active Cases');
        xrmHelper = new XrmHelper(page);
        entity = new Entity(page);
        sidebar = new Sidebar(page);

        validateConfig();
        await page.setViewportSize({ width: 2560, height: 1440 });
        // Navigate to the app URL

        await page.goto(testConfig.appUrl);
        await xrmHelper.waitForXrmReady();
    });

    test('Should navigate to Interested Parties and open first record', async () => {
        // Step 1: Use sidebar component instead of direct locator
        await sidebar.navigateToCases();

        await xrmHelper.waitForXrmReady();

        // Step 2: Open first record
        await grid.openNthRecord(0);
        await entity.waitForFormReady();

        const isFormReady = await page.evaluate(() => {
            return window.Xrm?.Page?.data?.entity?.getId() !== null;
        });

        expect(isFormReady).toBe(true);
    });
})