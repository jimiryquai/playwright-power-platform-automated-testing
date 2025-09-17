import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { Grid } from '../components/Grid';
import { XrmHelper } from '../utils/XrmHelper';
import { Entity } from '../utils/Entity';

test.describe('Interested Parties MDA Test', () => {
    let page: Page;
    let grid: Grid;
    let xrmHelper: XrmHelper;
    let entity: Entity;

    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        grid = new Grid(page, 'Interested Parties Grid');
        xrmHelper = new XrmHelper(page);
        entity = new Entity(page);
        
        // Navigate to D365 - auth is already handled by auth.setup.ts and storageState
        await page.goto(process.env.APP_URL!);
        
        // Wait for D365 to load
        await xrmHelper.waitForXrmReady();
    });

    test('Should navigate to Interested Parties and open first record', async () => {
        // Step 1: Click on the Interested Parties sidebar link
        // Using the specific ID from your HTML
        await page.click("li[id='sitemap-entity-subarea_2a27803a']");
        
        // Alternative selectors you could use:
        // await page.click("li[aria-label='Interested Parties']");
        // await page.click("li[data-text='Interested Parties']");
        
        // Wait for navigation to complete and grid to load
        await page.waitForLoadState('networkidle');
        await xrmHelper.waitForXrmReady();
        
        // Wait specifically for the grid to be visible
        await page.waitForSelector("[data-lp-id='MscrmControls.Grid.GridControl']", { timeout: 30000 });
        
        // Step 2: Open the first record using your Grid class
        await grid.openNthRecord(0); // Zero-based index for first record
        
        // Wait for the record form to load - now using Entity
        await entity.waitForFormReady();
        
        // Optional: Add verification that we successfully opened a record
        await expect(page.locator("div[data-id='form-container']")).toBeVisible();
    });

    test('Should select first record instead of opening', async () => {
        // Navigate to Interested Parties
        await page.click("li[id='sitemap-entity-subarea_2a27803a']");
        
        // Wait for grid to load
        await page.waitForLoadState('networkidle');
        await xrmHelper.waitForXrmReady();
        await page.waitForSelector("[data-lp-id='MscrmControls.Grid.GridControl']", { timeout: 30000 });
        
        // Select the first record instead of opening it
        await grid.selectNthRecord(0);
        
        // Verify record is selected (optional)
        const selectedRow = await page.locator("[role='grid'] tr.selected, [role='grid'] tr[aria-selected='true']");
        await expect(selectedRow).toBeVisible();
    });

    test('Should handle errors gracefully if no records exist', async () => {
        // Navigate to Interested Parties
        await page.click("li[id='sitemap-entity-subarea_2a27803a']");
        
        await page.waitForLoadState('networkidle');
        await xrmHelper.waitForXrmReady();
        
        // Check if grid has any records before trying to open
        const gridRows = await page.locator("[role='grid'] tr[data-lp-id]").count();
        
        if (gridRows > 0) {
            await grid.openNthRecord(0);
            await entity.waitForFormReady();
        } else {
            console.log('No records found in Interested Parties grid');
            // Handle empty grid scenario
        }
    });

    test('Should open second record if multiple records exist', async () => {
        // Navigate to Interested Parties
        await page.click("li[id='sitemap-entity-subarea_2a27803a']");
        
        await page.waitForLoadState('networkidle');
        await xrmHelper.waitForXrmReady();
        
        // Wait for grid and check record count
        await page.waitForSelector("[data-lp-id='MscrmControls.Grid.GridControl']", { timeout: 30000 });
        
        const recordCount = await page.locator("[role='grid'] tbody tr").count();
        
        if (recordCount >= 2) {
            // Open the second record (index 1)
            await grid.openNthRecord(1);
            await entity.waitForFormReady();
            
            await expect(page.locator("div[data-id='form-container']")).toBeVisible();
        } else {
            test.skip();
            console.log('Skipping test - not enough records in grid');
        }
    });

    test('Should click sidebar with retry logic for reliability', async () => {
        // More robust approach with retry logic
        const maxRetries = 3;
        let attempt = 0;
        let clickSuccess = false;
        
        while (attempt < maxRetries && !clickSuccess) {
            try {
                await page.click("li[id='sitemap-entity-subarea_2a27803a']", { timeout: 10000 });
                
                // Verify navigation started
                await page.waitForLoadState('networkidle', { timeout: 15000 });
                
                // Check if we're on the right page
                const gridExists = await page.locator("[data-lp-id='MscrmControls.Grid.GridControl']").isVisible();
                if (gridExists) {
                    clickSuccess = true;
                } else {
                    throw new Error('Grid not found after click');
                }
            } catch (error) {
                attempt++;
                if (error instanceof Error) {
                    console.log(`Sidebar click attempt ${attempt} failed:`, error.message);
                } else {
                    console.log(`Sidebar click attempt ${attempt} failed:`, error);
                }
                
                if (attempt < maxRetries) {
                    await page.waitForTimeout(2000); // Wait before retry
                }
            }
        }
        
        if (!clickSuccess) {
            throw new Error(`Failed to navigate to Interested Parties after ${maxRetries} attempts`);
        }
        
        await xrmHelper.waitForXrmReady();
        
        // Now open the first record
        await grid.openNthRecord(0);
        await entity.waitForFormReady();
    });
});

// Alternative test structure if you prefer a single test with multiple steps
test('Complete Interested Parties workflow', async ({ page }) => {
    const grid = new Grid(page, 'Interested Parties Grid');
    const xrmHelper = new XrmHelper(page);
    const entity = new Entity(page);
    
    // Setup - navigate to D365 (auth already handled by setup)
    await page.goto(process.env.APP_URL!);
    await xrmHelper.waitForXrmReady();
    
    // Step 1: Navigate to Interested Parties
    await test.step('Navigate to Interested Parties', async () => {
        await page.click("li[id='sitemap-entity-subarea_2a27803a']");
        await page.waitForLoadState('networkidle');
        await page.waitForSelector("[data-lp-id='MscrmControls.Grid.GridControl']", { timeout: 30000 });
    });
    
    // Step 2: Open first record
    await test.step('Open first record in grid', async () => {
        await grid.openNthRecord(0);
        await entity.waitForFormReady();
        await expect(page.locator("div[data-id='form-container']")).toBeVisible();
    });
    
    // Step 3: Verify record details (optional)
    await test.step('Verify record opened correctly', async () => {
        // Add specific verifications based on your record structure
        // await expect(page.locator("input[data-id='name.fieldControl-text-box-text']")).toBeVisible();
    });
});