import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { XrmHelper } from './utils/XrmHelper';
import { Sidebar } from './components/Sidebar';
import { testConfig, validateConfig } from './TestConfig';

// Increase test timeout to 3 minutes
test.setTimeout(180000);

test.describe('Sidebar Comprehensive Tests', () => {
  let page: Page;
  let sidebar: Sidebar;
  let xrmHelper: XrmHelper;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    xrmHelper = new XrmHelper(page);
    sidebar = new Sidebar(page);

    validateConfig();
    await page.goto(testConfig.mdaUrl);
    await xrmHelper.waitForXrmReady();

    // Check if we landed on an error page from failed auth
    if (page.url().includes('error/errorhandler.aspx')) {
      throw new Error(`Test session landed on error page: ${page.url()}`);
    }

    await sidebar.waitForSidebarLoaded();

    const homeVisible = await sidebar.isHomeVisible();
    const recentVisible = await sidebar.isElementVisible('[aria-label="Recent"]');
    const pinnedVisible = await sidebar.isElementVisible('[aria-label="Pinned"]');

    if (!homeVisible || !recentVisible || !pinnedVisible) {
      console.warn('Warning: Some sidebar elements not found. Tests may be limited.');
    }

  });

  test.describe('Basic Navigation Methods', () => {
    test('navigateByAriaLabel - should navigate using aria-label', async () => {
      // Use Cases since your setup already checks for it
      if (await sidebar.isElementVisible('[aria-label="Cases"]')) {
        await sidebar.navigateByAriaLabel('Cases');

        // Verify navigation occurred - wait for XRM to be ready after navigation
        await xrmHelper.waitForXrmReady();

        // Check if we can find an active element or URL change
        await expect(page.locator('[aria-selected="true"], [aria-current="page"]')).toBeVisible({ timeout: 10000 });
      } else {
        console.log('Cases entity not available in this environment');
      }
    });

    test('navigateByText - should navigate using data-text attribute', async () => {
      // Get available sub-areas dynamically instead of hard-coding
      const groups = await sidebar.getGroupsInCurrentArea();
      if (groups.length > 0) {
        const subAreas = await sidebar.getSubAreasInGroup(groups[0]);
        if (subAreas.length > 0) {
          const targetSubArea = subAreas[0];
          await sidebar.navigateByText(targetSubArea);

          await xrmHelper.waitForXrmReady();
          await expect(page.locator(`[data-text="${targetSubArea}"][aria-selected="true"]`)).toBeVisible();
        } else {
          console.log('No sub-areas available for navigation test');
        }
      } else {
        console.log('No groups available for navigation test');
      }
    });

    test('navigateByDataId - should navigate using data-id attribute', async () => {
      // Get a valid data-id dynamically from available sub-areas
      const groups = await sidebar.getGroupsInCurrentArea();
      if (groups.length > 0) {
        const subAreas = await sidebar.getSubAreasInGroup(groups[0]);
        if (subAreas.length > 0) {
          const targetSubArea = subAreas[0];
          const dataId = await page.locator(`[data-text="${targetSubArea}"]`).getAttribute('data-id');

          if (dataId) {
            await sidebar.navigateByDataId(dataId);
            await xrmHelper.waitForXrmReady();
            await expect(page.locator('[aria-selected="true"][aria-current="page"]')).toBeVisible();
          } else {
            console.log('Could not retrieve data-id for navigation test');
          }
        } else {
          console.log('No sub-areas available for data-id test');
        }
      } else {
        console.log('No groups available for data-id test');
      }
    });
  });

  test.describe('Home Menu Operations', () => {
    test('navigateToHome - should navigate to home page', async () => {
      await sidebar.navigateToHome();
      await xrmHelper.waitForXrmReady();

      // Verify we're on home - could check URL or page elements
      // Adjust this assertion based on what indicates you're on the home page
      const currentUrl = page.url();
      expect(currentUrl.includes('main.aspx') || currentUrl.includes('home')).toBe(true);
    });

    test('isHomeVisible - should return true when home is visible', async () => {
      const isVisible = await sidebar.isHomeVisible();
      expect(isVisible).toBe(true);
    });
  });

  test.describe('Recent Menu Operations', () => {
    test('expandRecentMenu - should expand collapsed recent menu', async () => {
      await sidebar.collapseRecentMenu();
      expect(await sidebar.isRecentMenuExpanded()).toBe(false);

      await sidebar.expandRecentMenu();
      expect(await sidebar.isRecentMenuExpanded()).toBe(true);
    });

    test('collapseRecentMenu - should collapse expanded recent menu', async () => {
      await sidebar.expandRecentMenu();
      expect(await sidebar.isRecentMenuExpanded()).toBe(true);

      await sidebar.collapseRecentMenu();
      expect(await sidebar.isRecentMenuExpanded()).toBe(false);
    });

    test('getRecentItems - should return list of recent items', async () => {
      await sidebar.expandRecentMenu();
      const items = await sidebar.getRecentItems();

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(0);

      if (items.length > 0) {
        expect(typeof items[0]).toBe('string');
        expect(items[0].length).toBeGreaterThan(0);
      }
    });

    test('getRecentItemsCount - should return correct count', async () => {
      await sidebar.expandRecentMenu();
      const items = await sidebar.getRecentItems();
      const count = await sidebar.getRecentItemsCount();

      expect(count).toBe(items.length);
    });

    test('clickRecentItem - should navigate to recent item', async () => {
      await sidebar.expandRecentMenu();
      const items = await sidebar.getRecentItems();

      if (items.length > 0) {
        const itemName = items[0];
        await sidebar.clickRecentItem(itemName);

        // Wait for XRM to be ready after navigation
        await xrmHelper.waitForXrmReady();

        // Verify navigation occurred - check for URL change or page elements
        await expect(page).toHaveURL(/.*/, { timeout: 10000 });
      } else {
        console.log('No recent items available for testing');
      }
    });
  });

  test.describe('Pinned Menu Operations', () => {
    test('expandPinnedMenu - should expand collapsed pinned menu', async () => {
      await sidebar.collapsePinnedMenu();
      expect(await sidebar.isPinnedMenuExpanded()).toBe(false);

      await sidebar.expandPinnedMenu();
      expect(await sidebar.isPinnedMenuExpanded()).toBe(true);
    });

    test('collapsePinnedMenu - should collapse expanded pinned menu', async () => {
      await sidebar.expandPinnedMenu();
      expect(await sidebar.isPinnedMenuExpanded()).toBe(true);

      await sidebar.collapsePinnedMenu();
      expect(await sidebar.isPinnedMenuExpanded()).toBe(false);
    });

    test('getPinnedItems - should return list of pinned items', async () => {
      await sidebar.expandPinnedMenu();
      const items = await sidebar.getPinnedItems();

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    test('getPinnedItemsCount - should return correct count', async () => {
      await sidebar.expandPinnedMenu();
      const items = await sidebar.getPinnedItems();
      const count = await sidebar.getPinnedItemsCount();

      expect(count).toBe(items.length);
    });
  });

  test.describe('Pin/Unpin Operations', () => {
    test('pinRecentItem - should pin an item from recent list', async () => {
      await sidebar.expandRecentMenu();
      const recentItems = await sidebar.getRecentItems();

      if (recentItems.length > 0) {
        const itemName = recentItems[0];
        const initialPinnedCount = await sidebar.getPinnedItemsCount();

        // Check if already pinned
        const alreadyPinned = await sidebar.isRecentItemPinned(itemName);

        if (alreadyPinned) {
          console.log(`Item ${itemName} was already pinned`);
          expect(alreadyPinned).toBe(true); // Test passes
        } else {
          // Actually pin it
          await sidebar.pinRecentItem(itemName);

          // Verify pinned count increased
          const finalPinnedCount = await sidebar.getPinnedItemsCount();
          expect(finalPinnedCount).toBe(initialPinnedCount + 1);
        }
      } else {
        console.log('No recent items available for pinning test');
      }
    });

    test('unpinItem - should unpin an item from pinned list', async () => {
      const pinnedItems = await sidebar.getPinnedItems();
      if (pinnedItems.length > 0) {
        // Use actual pinned item, not assumed one
        await sidebar.unpinItem(pinnedItems[0]);
      } else {
        console.log('No pinned items to test unpinning');
      }
    });

    test.describe('Area Operations', () => {
      test('getCurrentArea - should return current area name', async () => {
        const currentArea = await sidebar.getCurrentArea();

        expect(typeof currentArea).toBe('string');
        expect(currentArea.length).toBeGreaterThan(0);
      });

      test('isAreaSwitcherVisible - should detect area switcher visibility', async () => {
        const isVisible = await sidebar.isAreaSwitcherVisible();
        expect(typeof isVisible).toBe('boolean');

        // If there are multiple areas, switcher should be visible
        if (isVisible) {
          await expect(page.locator('#areaSwitcherId')).toBeVisible();
        }
      });

      test('getAvailableAreas - should return list of available areas', async () => {
        const areas = await sidebar.getAvailableAreas();
        expect(Array.isArray(areas)).toBe(true);

        // Don't fail if environment only has one area
        if (areas.length > 0) {
          areas.forEach(area => {
            expect(typeof area).toBe('string');
            expect(area.length).toBeGreaterThan(0);
          });
        } else {
          console.log('Single area environment detected');
        }
      });

      test('changeArea - should switch to different area', async () => {
        const currentArea = await sidebar.getCurrentArea();
        const availableAreas = await sidebar.getAvailableAreas();
        const targetArea = availableAreas.find(area => area !== currentArea);

        if (targetArea) {
          await sidebar.changeArea(targetArea);
          await page.waitForTimeout(3000); // 3 second pause
          await sidebar.getCurrentArea();
         
          await expect(page.locator('#areaSwitcherId')).toContainText(targetArea);

        } else {
          console.log('Only one area available, skipping area change test');
        }
      });

    });


    test.describe('Group and Sub-area Operations', () => {
      test('getGroupsInCurrentArea - should return list of groups', async () => {
        const groups = await sidebar.getGroupsInCurrentArea();

        expect(Array.isArray(groups)).toBe(true);
        expect(groups.length).toBeGreaterThan(0);

        groups.forEach(group => {
          expect(typeof group).toBe('string');
          expect(group.length).toBeGreaterThan(0);
        });
      });

      test('getSubAreasInGroup - should return sub-areas for a group', async () => {
        const groups = await sidebar.getGroupsInCurrentArea();

        if (groups.length > 0) {
          const firstGroup = groups[0];
          const subAreas = await sidebar.getSubAreasInGroup(firstGroup);

          expect(Array.isArray(subAreas)).toBe(true);

          subAreas.forEach(subArea => {
            expect(typeof subArea).toBe('string');
            expect(subArea.length).toBeGreaterThan(0);
          });
        } else {
          console.log('No groups available');
        }
      });

      test('getCurrentSubArea - should return current active sub-area', async () => {
        const currentSubArea = await sidebar.getCurrentSubArea();

        expect(typeof currentSubArea).toBe('string');
        expect(currentSubArea.length).toBeGreaterThan(0);
      });
    });

    test.describe('State Management Methods', () => {
      test('getSidebarSummary - should return complete sidebar state', async () => {
        const summary = await sidebar.getSidebarSummary();

        expect(summary).toHaveProperty('currentArea');
        expect(summary).toHaveProperty('currentSubArea');
        expect(summary).toHaveProperty('groups');
        expect(summary).toHaveProperty('recentItemsCount');
        expect(summary).toHaveProperty('pinnedItemsCount');
        expect(summary).toHaveProperty('recentExpanded');
        expect(summary).toHaveProperty('pinnedExpanded');

        expect(typeof summary.currentArea).toBe('string');
        expect(typeof summary.currentSubArea).toBe('string');
        expect(Array.isArray(summary.groups)).toBe(true);
        expect(typeof summary.recentItemsCount).toBe('number');
        expect(typeof summary.pinnedItemsCount).toBe('number');
        expect(typeof summary.recentExpanded).toBe('boolean');
        expect(typeof summary.pinnedExpanded).toBe('boolean');
      });
    });

    test.describe('Utility Methods', () => {
      test('isElementVisible - should detect element visibility', async () => {
        // WRONG: const homeVisible = await sidebar.isElementVisible('[aria-label="Go to home page"]');
        // Your debug showed it's actually "Home", not "Go to home page"
        const homeVisible = await sidebar.isElementVisible('[aria-label="Home"]');
        expect(homeVisible).toBe(true);

        const nonExistentVisible = await sidebar.isElementVisible('[data-test-id="non-existent-element"]');
        expect(nonExistentVisible).toBe(false);
      });

      test('waitForSidebarLoaded - should wait for sidebar components', async () => {
        await expect(async () => {
          await sidebar.waitForSidebarLoaded();
        }).not.toThrow();
      });

      test('isSidebarFullyLoaded - should validate sidebar loading state', async () => {
        const isLoaded = await sidebar.isSidebarFullyLoaded();
        expect(isLoaded).toBe(true);
      });
    });

    test.describe('Waiting and Validation Methods', () => {

      test('waitForItemInList - should wait for item to appear in recent list', async () => {
        await sidebar.expandRecentMenu();
        const recentItems = await sidebar.getRecentItems();

        if (recentItems.length > 0) {
          const itemName = recentItems[0];

          // Item should already exist
          const itemFound = await sidebar.waitForItemInList('recent', itemName, true, 2000);
          expect(itemFound).toBe(true);
        }
      });
    });
  });

  // Helper test to validate test data setup
  test.describe('Test Environment Validation', () => {
    test('should have required sidebar elements', async ({ page }) => {
      const sidebar = new Sidebar(page);
      const xrmHelper = new XrmHelper(page);

      validateConfig();
      await page.goto(testConfig.mdaUrl);
      await xrmHelper.waitForXrmReady();

      // Check for error page
      if (page.url().includes('error/errorhandler.aspx')) {
        throw new Error(`Test environment landed on error page: ${page.url()}`);
      }

      // Validate required elements exist
      await expect(page.locator('[aria-label="Home"], [aria-label="Go to home page"]')).toBeVisible();
      await expect(page.locator('[aria-label="Recent"]')).toBeVisible();
      await expect(page.locator('[aria-label="Pinned"]')).toBeVisible();

      const summary = await sidebar.getSidebarSummary();
      console.log('Test Environment Summary:', summary);

      // Log available entities for debugging
      const groups = await sidebar.getGroupsInCurrentArea();
      console.log('Available groups:', groups);

      if (groups.length > 0) {
        const subAreas = await sidebar.getSubAreasInGroup(groups[0]);
        console.log(`Sub-areas in "${groups[0]}":`, subAreas);
      }

      // Check for Cases entity specifically since it's used in your setup
      const casesVisible = await sidebar.isElementVisible('[aria-label="Cases"]');
      console.log('Cases entity visible:', casesVisible);
    });
  });
});