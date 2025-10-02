# Testing Guide

Comprehensive guide to writing and maintaining Playwright tests for Power Platform applications.

---

## Table of Contents

1. [Framework Overview](#framework-overview)
2. [Testing Standards](#testing-standards)
3. [Test Organization](#test-organization)
4. [Writing Tests](#writing-tests)
5. [Test Types](#test-types)
   - [UI Functional Tests](#ui-functional-tests)
   - [Load Tests](#load-tests)
6. [Platform-Specific Testing](#platform-specific-testing)
7. [Future Enhancements](#future-enhancements)

---

## Framework Overview

### Scope

This framework focuses on **end-to-end (E2E) and system-level tests** that simulate real user interactions.

**✅ Included:**
- UI Functional Tests (Power Pages, Model-Driven Apps, Static Web Apps)
- API Tests (Direct Dataverse interactions)
- Load/Performance Tests (Locust-based)

**❌ Excluded:**
- Static Code Analysis (handled separately)
- Unit Tests (e.g., plugins, PCF controls)
- Accessibility Tests (planned for future - see [Future Enhancements](#future-enhancements))

### Applications Under Test

```
playwright-power-platform-automated-testing/
├── tests/
│   ├── mda/           # Model-Driven App tests
│   ├── portal/        # Power Pages tests
│   └── public-file/   # Static Web App tests
```

Each application has its own:
- Test folder structure
- Authentication method
- Page objects
- Test scenarios

---

## Testing Standards

### Page Object Model (POM)

**✅ DO:**
```typescript
// pages/FooPage.ts
import { Locator, Page } from '@playwright/test';

export class FooPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly buttonFoo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('text=My Page');
    this.buttonFoo = page.locator('text=Foo');
  }
}

// tests/foo.spec.ts
import { test, expect } from '@playwright/test';
import { FooPage } from '../pages/FooPage';

test('displays foo bar', async ({ page }) => {
  const fooPage = new FooPage(page);
  
  await fooPage.buttonFoo.click();
  await expect(fooPage.pageTitle).toBeVisible();
});
```

**❌ DO NOT:**
```typescript
// Including locators directly in tests
test('displays foo bar', async ({ page }) => {
  await page.locator('text=Foo').click();
  await expect(page.locator('text=My Page')).toBeVisible();
});
```

**Key Rules:**
- All interactions through Page Objects (no selectors in tests)
- All assertions in tests (no assertions in POMs)
- Each page has corresponding POM file

### Test Structure: Arrange, Act, Assert (AAA)

**✅ DO:**
```typescript
test('can raise a charge', async ({ page }) => {
  // Arrange
  await createProperty();
  
  // Act
  await raiseCharge();
  
  // Assert
  expect(charge).toBe('raised');
});
```

Add comments defining each section for readability.

### Data Management

**✅ DO:**
```typescript
test('case workflow', async ({ page }) => {
  // Arrange: Create test data
  const category = await webApi.createRecord('cg_case_category', {
    cg_case_category: 'Test Category'
  });
  
  try {
    // Act & Assert: Run test
    await sidebar.navigateByAriaLabel('Cases');
    await grid.waitForGridReady();
    expect(await grid.getGridRowCount()).toBeGreaterThan(0);
    
  } finally {
    // Teardown: Clean up
    await webApi.deleteRecord('cg_case_category', category.id);
  }
});
```

**Key Rules:**
- Each test creates its own data
- Each test cleans up after itself (teardown)
- Never rely on existing data
- Never leave uncleared state

### Test Naming & Azure DevOps Integration

**IMPORTANT:** All tests must include an **Azure DevOps Test Case ID** for proper integration with Azure Test Plans.

**Test Naming Pattern:**
```typescript
test('{test-case-id} - Descriptive test name', {
  tag: [
    '@{application}',
    '@{test-type}',
    '@[{test-case-id}]'
  ]
}, async ({ page }) => {
  // test code
});
```

**Real Example:**
```typescript
test('3321 - Application Start Page', {
  tag: [
    '@portal',
    '@core',
    '@regression',
    '@[3321]'
  ]
}, async ({ page }) => {
  // Arrange
  const appStartPage = new CreateApplicationStartPage(page);
  
  // Act
  await page.goto(testConfig.portalUrl + '/Create-Application-Start');
  
  // Assert
  await expect(page).toHaveURL(/create-application-start/i);
  await appStartPage.verifyPageStructure();
});
```

**Why This Matters:**
- The `@alex_neo/playwright-azure-reporter` uses test case IDs to link test results to Azure DevOps Test Plans
- Test case ID appears in **both** the test name and the `@[{id}]` tag
- Without proper IDs, results won't sync to Azure Test Plans

**Common Tags:**
- **Application:** `@mda`, `@portal`, `@public-file`
- **Test Type:** `@smoke`, `@critical`, `@regression`, `@core`
- **Feature:** `@cases`, `@accounts`, `@applications`
- **Test Case ID:** `@[3321]`, `@[3322]`, etc.

See [Pipeline Setup](./pipeline-setup.md) for more on Azure DevOps integration.

### Naming Conventions

**Variables:** camelCase
```typescript
const testAccountName = 'Test Account';
```

**Booleans:** Start with `is`, `has`, `are`, `have`
```typescript
let isTurnedOn = false;
let hasPermission = true;
```

**Page Objects/Classes:** PascalCase
```typescript
export class AddWorksOrderModal { }
export class AccountFormPage { }
```

**Locators:** Descriptive with action + element type
```typescript
// ✅ Good
readonly submitButton: Locator;
readonly accountNameField: Locator;
readonly cancelModalButton: Locator;

// ❌ Bad
readonly button1: Locator;
readonly input: Locator;
readonly clickHere: Locator;
```

### Flaky Tests

**Mark with `.fixme`** to skip until resolved:
```typescript
test.fixme('flaky test that needs fixing', async ({ page }) => {
  // test code
});
```

**Resolve flaky tests as a priority.**

### Avoid Conditionals

Tests should be **deterministic** - they return predictable results.

**❌ Avoid:**
```typescript
test('conditional test', async ({ page }) => {
  if (await element.isVisible()) {
    await element.click();
  } else {
    await alternativeElement.click();
  }
});
```

Having conditionals often means the test is doing too much. Break it into separate tests.

---

## Test Organization

### Folder Structure

```
tests/
├── mda/                      # Model-Driven App
│   ├── pages/
│   │   ├── AccountPage.ts
│   │   └── CasePage.ts
│   ├── utils/
│   │   ├── WebApi.ts
│   │   └── XrmHelper.ts
│   └── specs/
│       ├── account.spec.ts
│       └── case.spec.ts
│
├── portal/                   # Power Pages
│   ├── pages/
│   │   └── ApplicationPage.ts
│   └── specs/
│       └── application.spec.ts
│
├── public-file/              # Static Web App
│   ├── pages/
│   └── specs/
│
└── auth/                     # Authentication setup files
    ├── auth.setup.ts         # MDA auth
    ├── auth-b2c.setup.ts     # Portal auth
    └── auth-public-file.setup.ts  # Public File auth
```

### Playwright Configuration

The `playwright.config.ts` defines three test projects:

**1. MDA Tests** (`mda-tests`)
- **Setup Project:** `mda-setup` (runs `auth.setup.ts`)
- **Auth File:** `auth/user.json`
- **Test Directory:** `tests/mda/`
- **Authentication:** Microsoft Entra ID

**2. Portal Tests** (`portal-tests`)
- **Setup Project:** `portal-setup` (runs `auth-b2c.setup.ts`)
- **Auth File:** `auth/auth.json`
- **Test Directory:** `tests/portal/`
- **Authentication:** Azure AD B2C

**3. Public File Tests** (`public-file-tests`)
- **Setup Project:** `public-file-setup` (runs `auth-public-file.setup.ts`)
- **Auth File:** `auth/public-file.json`
- **Test Directory:** `tests/public-file/`
- **Authentication:** Azure AD

Each project has a **setup dependency** that runs authentication before tests execute.

### File Naming

- Test specs: `{feature}.spec.ts`
- Page objects: `{PageName}Page.ts`
- Utilities: `{UtilityName}.ts`

---

## Writing Tests

### Complete Example

```typescript
import { test, expect } from '@playwright/test';
import { Grid } from '../components/Grid';
import { Sidebar } from '../components/Sidebar';
import { XrmHelper } from '../utils/XrmHelper';
import { WebApi } from '../utils/WebApi';

test.describe('@mda @cases @smoke', () => {
  test('can create and view case', async ({ page }) => {
    // Arrange
    const xrmHelper = new XrmHelper(page);
    const webApi = new WebApi(xrmHelper);
    const sidebar = new Sidebar(page);
    const grid = new Grid(page);
    
    const category = await webApi.createRecord('cg_case_category', {
      cg_case_category: 'Test Category'
    });
    
    try {
      // Act
      await sidebar.navigateByAriaLabel('Cases');
      await grid.waitForGridReady();
      
      const count = await grid.getGridRowCount();
      await grid.openNthRecord(0);
      
      // Assert
      expect(count).toBeGreaterThan(0);
      // Additional assertions...
      
    } finally {
      // Cleanup
      await webApi.deleteRecord('cg_case_category', category.id);
    }
  });
});
```

### Using Framework Components

See [Framework Components](./framework-components.md) for detailed documentation on:
- **Grid Component** - AG Grid interactions
- **Sidebar Component** - Sitemap navigation
- **XrmHelper** - D365 Xrm API bridge
- **WebApi** - Dataverse CRUD operations

### Using Data Patterns

See [Data Patterns](./data-patterns.md) for:
- Test data factories
- FakerAPI integration
- Data cleanup patterns

---

## Test Types

### UI Functional Tests

Standard Playwright tests validating user workflows.

**Location:** `tests/{app}/*.spec.ts`

**Run:**
```bash
npm run test:mda
npm run test:portal
npm run test:public-file
```

**See Also:** [Test Naming & Azure DevOps Integration](#test-naming--azure-devops-integration) for required test case ID conventions.

### Load Tests

See [Load Testing](./load-testing.md) for comprehensive guide.

**Quick start:**
```bash
npm run load:install        # Install Python dependencies
npm run setup:portal        # Setup auth
npm run load:test-auth      # Verify auth
npm run load:portal         # Run load test (interactive)
npm run load:ci:portal      # Run load test (headless CI mode)
npm run test:portal:full    # Full test suite (setup + tests + load)
```

---

## Platform-Specific Testing

### Power Pages (Portal)

**Focus:** Public accessibility, performance under load, user registration/forms

**Test Types:**
- ✅ Playwright UI Tests
- ✅ Locust Load Tests
  - Concurrent users browsing
  - File uploads to Portal Web API
  - Form submissions and updates

**Authentication:** Azure AD B2C

**Key Scenarios:**
- Public user registration
- Multi-step form completion
- Document uploads
- Data submission and viewing

### Model-Driven Apps (MDA)

**Focus:** Internal business processes, data integrity, complex workflows

**Test Types:**
- ✅ Playwright UI Tests
- ❌ Load tests (not typically needed - predictable user counts)

**Authentication:** Microsoft Entra ID (formerly Azure AD)

**Key Scenarios:**
- Case management workflows
- Business Process Flows
- Form interactions with sub-grids
- Security role validation
- Dataverse operations

### Static Web App (Public File)

**Focus:** Content availability, handling traffic spikes

**Test Types:**
- ✅ Playwright UI Tests
- ✅ Locust Load Tests (planned)
  - Traffic spike simulation

**Authentication:** Azure AD

**Key Scenarios:**
- Page loading and navigation
- Content verification
- Interactive elements (search, filters)
- High-traffic scenarios

---

## Future Enhancements

### Accessibility Testing (WCAG 2.1)

**Status:** Not currently implemented

Automated accessibility testing using `axe-core` to check for WCAG 2.1 compliance.

**Potential Implementation:**
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('@accessibility @portal home page', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  });
});
```

**When to implement:**
- When WCAG 2.1 compliance becomes a requirement
- For public-facing applications (Portal, Public File)
- As part of CI/CD quality gates

**Benefits:**
- Automated accessibility regression testing
- Early detection of accessibility issues
- Screen reader compatibility verification
- Color contrast validation

---

### Role-Based Testing (Not Currently Implemented)

The framework can be extended to support role-based testing across multiple applications:

**Potential Structure:**
```
tests/
├── auth/
│   ├── mda/
│   │   ├── admin.setup.ts
│   │   ├── sales.setup.ts
│   │   └── service.setup.ts
│   ├── portal/
│   │   ├── customer.setup.ts
│   │   ├── partner.setup.ts
│   │   └── admin.setup.ts
│   └── public-file/
│       ├── internal.setup.ts
│       └── external.setup.ts
│
└── {app}/
    └── {role}/
        └── specs/
```

**Configuration Example:**
```typescript
// playwright.config.ts (future)
export default defineConfig({
  projects: [
    // MDA Projects
    { 
      name: 'mda-admin',
      dependencies: ['setup-mda-admin'],
      use: { storageState: 'auth/mda-admin.json' }
    },
    { 
      name: 'mda-sales',
      dependencies: ['setup-mda-sales'],
      use: { storageState: 'auth/mda-sales.json' }
    },
    
    // Portal Projects
    { 
      name: 'portal-customer',
      dependencies: ['setup-portal-customer'],
      use: { storageState: 'auth/portal-customer.json' }
    },
  ]
});
```

**Benefits:**
- Test role-specific functionality
- Verify security role restrictions
- Parallel execution by role
- Granular test selection

**When to implement:**
- When role-specific testing becomes critical
- When security role validation is a priority
- When multiple user types need comprehensive testing

---

## Quick Reference

### Running Tests

```bash
# All tests
npm test

# Specific application
npm run test:mda
npm run test:portal
npm run test:public-file

# Setup authentication
npm run setup:portal
npm run setup:public-file

# Codegen with authentication
npm run codegen:portal
npm run codegen:public-file

# Using Playwright directly with tags
npx playwright test --grep @smoke
npx playwright test --grep @critical
npx playwright test --grep @mda

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# Headed mode
npx playwright test --headed
```

### Linting

The project uses ESLint with the `eslint-plugin-playwright` for enforcing testing standards.

**Currently configured but no npm scripts defined.** To add linting:

```bash
# Run ESLint directly
npx eslint tests/**/*.ts

# Or add to package.json:
# "lint": "eslint tests/**/*.ts",
# "lint:fix": "eslint tests/**/*.ts --fix"
```

See the Playwright Testing Standards section for recommended linting rules.

---

## Best Practices Checklist

- [ ] Use Page Object Model (no selectors in tests)
- [ ] Follow AAA pattern (Arrange, Act, Assert)
- [ ] Create test data, don't rely on existing data
- [ ] Clean up test data in `finally` blocks
- [ ] Use descriptive test names and tags
- [ ] Add comments for complex test logic
- [ ] Avoid conditionals in tests
- [ ] Fix flaky tests immediately (or mark with `.fixme`)
- [ ] Use framework components (Grid, Sidebar, XrmHelper, WebApi)
- [ ] Follow naming conventions (camelCase, PascalCase)
- [ ] Use Playwright built-in waiters, not `waitForTimeout()`
- [ ] Run tests locally before pushing

---

## Getting Help

- **Framework Components:** See [framework-components.md](./framework-components.md)
- **Data Patterns:** See [data-patterns.md](./data-patterns.md)
- **Load Testing:** See [load-testing.md](./load-testing.md)
- **Authentication:** See [authentication.md](./authentication.md)
- **Pipeline Setup:** See [pipeline-setup.md](./pipeline-setup.md)
- **Playwright Docs:** https://playwright.dev/
- **Locust Docs:** https://docs.locust.io/

---

## Summary

This testing framework provides:
- ✅ Consistent testing standards across all applications
- ✅ Clear organization by application and feature
- ✅ Reusable components and utilities
- ✅ Azure DevOps Test Plan integration
- ✅ Comprehensive test types (UI, load)
- ✅ Scalable architecture that grows with your needs
- ✅ CI/CD integration for automated testing

Follow these standards to maintain a robust, maintainable test suite that provides confidence in your Power Platform applications.