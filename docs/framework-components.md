# Framework Components

Four components built on top of Playwright for D365 interactions.

## Grid Component

Interact with AG Grid tables in D365.

```typescript
import { Grid } from './components/Grid';

const grid = new Grid(page, 'Active Cases');
await grid.waitForGridReady();
await grid.openNthRecord(0);  // Open first record by double-clicking
const count = await grid.getGridRowCount();
const cellText = await grid.getCellTextByIndex(0, 2);  // Row 0, Column 2
```

### Key Methods

**`waitForGridReady()`**
Waits for grid data to load. Handles spinner and ensures first row is visible.

**`openNthRecord(recordNumber, columnIndex = 2)`**
Double-clicks a grid cell to open the record. Column 2 is typically the main field (e.g., Case Name).

**`getGridRowCount()`**
Returns total number of visible data rows.

**`getCellTextByIndex(recordNumber, columnIndex)`**
Gets text from a specific cell.

**`getRecordName(recordNumber)`**
Shortcut for getting the main field text (column 2).

### Common Pattern

```typescript
const grid = new Grid(page, 'Cases');
await grid.waitForGridReady();
const rowCount = await grid.getGridRowCount();

if (rowCount > 0) {
  await grid.openNthRecord(0);  // Opens first record
}
```

### Important Notes
- Record numbers are **zero-based**
- Column 2 is usually the primary field
- Always call `waitForGridReady()` before other grid operations

---

## Sidebar Component

Navigate the D365 sitemap.

```typescript
import { Sidebar } from './components/Sidebar';

const sidebar = new Sidebar(page);
await sidebar.navigateToHome();
await sidebar.navigateByAriaLabel('Cases');
await sidebar.navigateByText('All Cases');
```

### Key Methods

**`navigateToHome()`**
Navigates to home page.

**`navigateByAriaLabel(label)`**
Navigates using aria-label attribute. Example: `navigateByAriaLabel('Cases')`.

**`navigateByText(text)`**
Navigates using data-text attribute. Example: `navigateByText('Active Cases')`.

**`getGroupsInCurrentArea()`**
Returns list of group names in current sitemap area.

**`getSubAreasInGroup(groupName)`**
Returns list of sub-areas within a group.

### Common Pattern

```typescript
const sidebar = new Sidebar(page);

// Navigate to specific entity
await sidebar.navigateByAriaLabel('Cases');

// Or discover available options
const groups = await sidebar.getGroupsInCurrentArea();
const subAreas = await sidebar.getSubAreasInGroup(groups[0]);
await sidebar.navigateByText(subAreas[0]);
```

---

## XrmHelper

Bridge between Playwright and D365's `window.Xrm` API.

```typescript
import { XrmHelper } from './utils/XrmHelper';

const xrmHelper = new XrmHelper(page);
await xrmHelper.waitForXrmReady();
```

### Key Method

**`waitForXrmReady()`**
Waits until `window.Xrm` is available and ready (60 second timeout).

### Why It Exists
D365 loads Xrm asynchronously. This helper ensures Xrm is ready before you try to use it.

### Usage
Call this after any navigation or page load:

```typescript
await page.goto(testConfig.mdaUrl);
await xrmHelper.waitForXrmReady();

// Now safe to interact with D365
```

Most components (Grid, WebApi) call this internally, but you may need it directly when navigating.

---

## WebApi

Direct Dataverse CRUD operations. Use for setup/teardown, not UI testing.

```typescript
import { WebApi } from './utils/WebApi';
import { XrmHelper } from './utils/XrmHelper';

const xrmHelper = new XrmHelper(page);
const webApi = new WebApi(xrmHelper);

// Create
const record = await webApi.createRecord('account', { name: 'Test Account' });
console.log(record.id);  // GUID of created record

// Retrieve
const account = await webApi.retrieveRecord('account', record.id, '?$select=name,accountnumber');

// Update
await webApi.updateRecord('account', record.id, { name: 'Updated Name' });

// Delete
await webApi.deleteRecord('account', record.id);
```

### Key Methods

**`createRecord(entityType, data)`**
Creates a record. Returns `{ id, entityType }`.

**`retrieveRecord(entityType, id, options?)`**
Retrieves a record. Options supports OData query parameters like `?$select=name,email`.

**`updateRecord(entityType, id, data)`**
Updates a record.

**`deleteRecord(entityType, id)`**
Deletes a record.

**`retrieveMultipleRecords(entityType, options?, maxPageSize?)`**
Queries multiple records. Returns `{ entities: [], '@odata.nextLink'?: string }`.

### OData Relationships

Use `@odata.bind` for lookups:

```typescript
await webApi.createRecord('cg_case', {
  cg_name: 'Test Case',
  'cg_Case_Category@odata.bind': `/cg_case_categories(${categoryId})`
});
```

### Critical: Delete Order

**Always delete in REVERSE order of creation** to respect foreign key constraints:

```typescript
const category = await webApi.createRecord('cg_case_category', {...});
const caseType = await webApi.createRecord('cg_case_type', {...});
const testCase = await webApi.createRecord('cg_case', {...});

// Delete in REVERSE order
await webApi.deleteRecord('cg_case', testCase.id);
await webApi.deleteRecord('cg_case_type', caseType.id);
await webApi.deleteRecord('cg_case_category', category.id);
```

---

## When to Use What

| Task | Component |
|------|-----------|
| Navigate sitemap | **Sidebar** |
| Interact with grid | **Grid** |
| Create test data | **WebApi** |
| Clean up test data | **WebApi** |
| Wait for D365 to load | **XrmHelper** |
| Fill forms | Use standard Playwright locators |
| Verify form state | Use Playwright assertions |

**Key principle:** Use WebApi for data setup/teardown. Use Grid/Sidebar for UI testing.

---

## Full Example

```typescript
import { test } from '@playwright/test';
import { Grid } from './components/Grid';
import { Sidebar } from './components/Sidebar';
import { XrmHelper } from './utils/XrmHelper';
import { WebApi } from './utils/WebApi';

test('case workflow', async ({ page }) => {
  const xrmHelper = new XrmHelper(page);
  const webApi = new WebApi(xrmHelper);
  const sidebar = new Sidebar(page);
  const grid = new Grid(page);
  
  // Setup: Create test data
  const category = await webApi.createRecord('cg_case_category', {
    cg_case_category: 'Test Category'
  });
  
  try {
    // Navigate
    await sidebar.navigateByAriaLabel('Cases');
    
    // Interact with grid
    await grid.waitForGridReady();
    const count = await grid.getGridRowCount();
    expect(count).toBeGreaterThan(0);
    
    await grid.openNthRecord(0);
    
    // Test assertions here...
    
  } finally {
    // Teardown: Clean up
    await webApi.deleteRecord('cg_case_category', category.id);
  }
});
```
