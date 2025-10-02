# Data Patterns

## Why Use Factories?

Factories create consistent, unique test data. Benefits:

- **Unique data** - Timestamps prevent conflicts between test runs
- **Consistent structure** - All tests use same data shape
- **Easy to maintain** - Change data structure in one place
- **Readable tests** - `CaseFactory.create({ name: 'Test' })` vs manual object construction
- **Relationships** - Built-in support for foreign keys via `@odata.bind`

## Factory Pattern

Each factory has:
- Static `create()` method that returns data object
- Options parameter for customization
- Timestamp for uniqueness
- Defaults for optional fields

### Example: CaseCategoryFactory

```typescript
// tests/data/factories/CaseCategoryFactory.ts

export const SHOW_ON_PORTAL_OPTIONS = {
  YES: 121480000,
  NO: 121480001
} as const;

export interface CreateCategoryOptions {
  name?: string;
  showOnPortal?: ShowOnPortal;
}

export class CaseCategoryFactory {
  private static readonly DEFAULT_SHOW_ON_PORTAL = SHOW_ON_PORTAL_OPTIONS.YES;

  static create(options: CreateCategoryOptions = {}) {
    const timestamp = Date.now();
    return {
      cg_case_category: `${options.name ?? 'Test Category'} ${timestamp}`,
      cg_showonportal: options.showOnPortal ?? this.DEFAULT_SHOW_ON_PORTAL
    };
  }
}
```

Usage:
```typescript
const categoryData = CaseCategoryFactory.create({ 
  name: 'Investigation',
  showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES 
});

const category = await webApi.createRecord('cg_case_category', categoryData);
```

### Example: CaseTypeFactory

```typescript
export interface CreateCaseTypeOptions {
  name?: string;
  description?: string;
  showOnPortal?: ShowOnPortal;
  categoryId?: string;  // Links to parent category
}

export class CaseTypeFactory {
  static create(options: CreateCaseTypeOptions = {}) {
    const timestamp = Date.now();
    const data = {
      cg_case_type: `${options.name ?? 'Test Case Type'} ${timestamp}`,
      cg_description: options.description ?? `Test description ${timestamp}`,
      cg_showonportal: options.showOnPortal ?? SHOW_ON_PORTAL_OPTIONS.YES
    };

    // Add relationship to category if provided
    if (options.categoryId) {
      data['cg_Case_Category@odata.bind'] = `/cg_case_categories(${options.categoryId})`;
    }

    return data;
  }
}
```

Usage:
```typescript
const caseTypeData = CaseTypeFactory.create({
  name: 'Dumping Investigation',
  categoryId: category.id  // Links to parent
});

const caseType = await webApi.createRecord('cg_case_type', caseTypeData);
```

### Example: CaseFactory

```typescript
export interface CreateCaseOptions {
  name?: string;
  categoryId?: string;
  caseTypeId?: string;
}

export class CaseFactory {
  static create(options: CreateCaseOptions = {}) {
    const timestamp = Date.now();
    const data = {
      cg_name: `${options.name ?? 'Test Case'} ${timestamp}`
    };

    if (options.categoryId) {
      data['cg_Case_Category@odata.bind'] = `/cg_case_categories(${options.categoryId})`;
    }

    if (options.caseTypeId) {
      data['cg_Case_Type@odata.bind'] = `/cg_case_types(${options.caseTypeId})`;
    }

    return data;
  }
}
```

## Available Factories

- **CaseCategoryFactory** - Creates case categories
- **CaseTypeFactory** - Creates case types (can link to category)
- **CaseFactory** - Creates cases (can link to category and type)

## Fixtures: Predefined Test Scenarios

Fixtures are predefined combinations of data for common test scenarios. Think of them as "recipe books" for your test data.

### Why Use Fixtures?

- **Reusable scenarios** - Define once, use in multiple tests
- **Clear intent** - `CASE_TEST_SCENARIOS.SIMPLE_CASE` vs manual data construction
- **Consistency** - All tests using "simple case" use same data structure
- **Easy maintenance** - Update scenario in one place

### Example: Case Scenarios

```typescript
// tests/data/fixtures/case-scenarios.ts
import { SHOW_ON_PORTAL_OPTIONS } from '../factories/CaseCategoryFactory';
import type { CreateCategoryOptions } from '../factories/CaseCategoryFactory';
import type { CreateCaseTypeOptions } from '../factories/CaseTypeFactory';
import type { CreateCaseOptions } from '../factories/CaseFactory';

interface CaseScenario {
  category: CreateCategoryOptions;
  caseType: CreateCaseTypeOptions;
  case: CreateCaseOptions;
}

export const CASE_TEST_SCENARIOS: Record<string, CaseScenario> = {
  SIMPLE_CASE: {
    category: {
      name: 'Simple Test Category',
      showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
    },
    caseType: {
      name: 'Simple Investigation',
      description: 'Simple test investigation type',
      showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
    },
    case: {
      name: 'Simple Test Case'
    }
  },
  
  DUMPING_INVESTIGATION: {
    category: {
      name: 'Anti-Dumping Category',
      showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
    },
    caseType: {
      name: 'Dumping Investigation',
      description: 'Anti-dumping investigation case type',
      showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
    },
    case: {
      name: 'Dumping Investigation Test Case'
    }
  },

  BSG_REVIEW: {
    category: {
      name: 'BSG Review Category',
      showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
    },
    caseType: {
      name: 'BSG Review',
      description: 'BSG review case type',
      showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
    },
    case: {
      name: 'BSG Review Test Case'
    }
  }
};
```

### Using Fixtures in Tests

```typescript
import { CASE_TEST_SCENARIOS } from '../data/fixtures/case-scenarios';

test('simple case scenario', async () => {
  const scenario = CASE_TEST_SCENARIOS.SIMPLE_CASE;
  const createdEntities = [];
  
  try {
    // Create using scenario data
    const categoryData = CaseCategoryFactory.create(scenario.category);
    const category = await webApi.createRecord('cg_case_category', categoryData);
    createdEntities.push({ type: 'cg_case_category', id: category.id });
    
    const caseTypeData = CaseTypeFactory.create({
      ...scenario.caseType,
      categoryId: category.id
    });
    const caseType = await webApi.createRecord('cg_case_type', caseTypeData);
    createdEntities.push({ type: 'cg_case_type', id: caseType.id });
    
    const caseData = CaseFactory.create({
      ...scenario.case,
      categoryId: category.id,
      caseTypeId: caseType.id
    });
    const testCase = await webApi.createRecord('cg_case', caseData);
    createdEntities.push({ type: 'cg_case', id: testCase.id });
    
    // Test assertions...
    expect(testCase.id).toBeTruthy();
    
  } finally {
    for (const entity of createdEntities.reverse()) {
      await webApi.deleteRecord(entity.type, entity.id);
    }
  }
});
```

## Setup/Teardown Pattern

Every test creates its own data and cleans up afterward.

### The Pattern

```typescript
test('my test', async () => {
  const createdEntities = [];
  
  try {
    // Setup: Create test data
    const category = await webApi.createRecord('cg_case_category', {...});
    createdEntities.push({ type: 'cg_case_category', id: category.id });
    
    const caseType = await webApi.createRecord('cg_case_type', {...});
    createdEntities.push({ type: 'cg_case_type', id: caseType.id });
    
    // Test: Your assertions here
    expect(category.id).toBeTruthy();
    
  } finally {
    // Teardown: Delete in REVERSE order
    for (const entity of createdEntities.reverse()) {
      await webApi.deleteRecord(entity.type, entity.id);
    }
  }
});
```

### Critical: Reverse Deletion Order

**Always delete in reverse order of creation** to respect foreign key constraints.

```typescript
// Create: Category → CaseType → Case
const category = await webApi.createRecord('cg_case_category', {...});
const caseType = await webApi.createRecord('cg_case_type', {...});  // References category
const testCase = await webApi.createRecord('cg_case', {...});       // References both

// Delete: Case → CaseType → Category (REVERSE!)
await webApi.deleteRecord('cg_case', testCase.id);
await webApi.deleteRecord('cg_case_type', caseType.id);
await webApi.deleteRecord('cg_case_category', category.id);
```

**Why?** If you delete the category first, D365 throws a foreign key constraint error because the case type still references it.

## Full Example: Case Hierarchy Test

```typescript
import { test, expect } from '@playwright/test';
import { XrmHelper } from './utils/XrmHelper';
import { WebApi } from './utils/WebApi';
import { CaseCategoryFactory } from '../data/factories/CaseCategoryFactory';
import { CaseTypeFactory } from '../data/factories/CaseTypeFactory';
import { CaseFactory } from '../data/factories/CaseFactory';

test('create case hierarchy with relationships', async ({ page }) => {
  const xrmHelper = new XrmHelper(page);
  const webApi = new WebApi(xrmHelper);
  
  await page.goto(testConfig.mdaUrl);
  await xrmHelper.waitForXrmReady();
  
  const createdEntities = [];
  
  try {
    // Step 1: Create category
    const categoryData = CaseCategoryFactory.create({ 
      name: 'Investigation' 
    });
    const category = await webApi.createRecord('cg_case_category', categoryData);
    createdEntities.push({ type: 'cg_case_category', id: category.id });
    console.log(`Created category: ${category.id}`);
    
    // Step 2: Create case type linked to category
    const caseTypeData = CaseTypeFactory.create({
      name: 'Dumping Investigation',
      categoryId: category.id
    });
    const caseType = await webApi.createRecord('cg_case_type', caseTypeData);
    createdEntities.push({ type: 'cg_case_type', id: caseType.id });
    console.log(`Created case type: ${caseType.id}`);
    
    // Step 3: Create case linked to both
    const caseData = CaseFactory.create({
      name: 'Test Investigation',
      categoryId: category.id,
      caseTypeId: caseType.id
    });
    const testCase = await webApi.createRecord('cg_case', caseData);
    createdEntities.push({ type: 'cg_case', id: testCase.id });
    console.log(`Created case: ${testCase.id}`);
    
    // Verify all created successfully
    expect(category.id).toBeTruthy();
    expect(caseType.id).toBeTruthy();
    expect(testCase.id).toBeTruthy();
    
    // Verify relationships
    const caseWithRelationships = await webApi.retrieveRecord(
      'cg_case',
      testCase.id,
      '?$select=_cg_case_category_value,_cg_case_type_value'
    );
    
    expect(caseWithRelationships._cg_case_category_value).toBe(category.id);
    expect(caseWithRelationships._cg_case_type_value).toBe(caseType.id);
    
  } finally {
    // Cleanup in REVERSE order
    console.log('Cleaning up...');
    for (const entity of createdEntities.reverse()) {
      try {
        await webApi.deleteRecord(entity.type, entity.id);
        console.log(`Deleted ${entity.type}: ${entity.id}`);
      } catch (error) {
        console.error(`Failed to delete ${entity.type} ${entity.id}:`, error);
      }
    }
  }
});
```

## Adding a New Entity (Step-by-Step)

### Step 1: Create the Factory

```typescript
// tests/data/factories/AccountFactory.ts

export interface AccountData {
  name: string;
  industrycode?: number;
  revenue?: number;
  'parentaccountid@odata.bind'?: string;
}

export interface CreateAccountOptions {
  name?: string;
  industry?: number;
  revenue?: number;
  parentAccountId?: string;
}

export class AccountFactory {
  static create(options: CreateAccountOptions = {}): AccountData {
    const timestamp = Date.now();
    const data: AccountData = {
      name: `${options.name ?? 'Test Account'} ${timestamp}`,
      industrycode: options.industry ?? 1,
      revenue: options.revenue ?? 100000
    };
    
    if (options.parentAccountId) {
      data['parentaccountid@odata.bind'] = `/accounts(${options.parentAccountId})`;
    }
    
    return data;
  }
}
```

### Step 2: Create Fixtures (Optional but Recommended)

```typescript
// tests/data/fixtures/account-scenarios.ts
import type { CreateAccountOptions } from '../factories/AccountFactory';

interface AccountScenario {
  account: CreateAccountOptions;
}

export const ACCOUNT_TEST_SCENARIOS: Record<string, AccountScenario> = {
  SIMPLE_ACCOUNT: {
    account: {
      name: 'Simple Test Account',
      industry: 1,
      revenue: 500000
    }
  },
  
  ENTERPRISE_ACCOUNT: {
    account: {
      name: 'Enterprise Account',
      industry: 2,
      revenue: 10000000
    }
  }
};
```

### Step 3: Use in Tests

```typescript
// tests/mda/account-creation.spec.ts
import { test, expect } from '@playwright/test';
import { XrmHelper } from './utils/XrmHelper';
import { WebApi } from './utils/WebApi';
import { AccountFactory } from '../data/factories/AccountFactory';
import { ACCOUNT_TEST_SCENARIOS } from '../data/fixtures/account-scenarios';

test('create account', async ({ page }) => {
  const xrmHelper = new XrmHelper(page);
  const webApi = new WebApi(xrmHelper);
  const scenario = ACCOUNT_TEST_SCENARIOS.SIMPLE_ACCOUNT;
  
  const createdEntities = [];
  
  try {
    // Use factory with scenario data
    const accountData = AccountFactory.create(scenario.account);
    const account = await webApi.createRecord('account', accountData);
    createdEntities.push({ type: 'account', id: account.id });
    
    expect(account.id).toBeTruthy();
    
  } finally {
    for (const entity of createdEntities.reverse()) {
      await webApi.deleteRecord(entity.type, entity.id);
    }
  }
});
```

### Quick Checklist

When adding a new entity:

- [ ] Create factory in `tests/data/factories/[Entity]Factory.ts`
- [ ] Define data interface (what gets sent to WebApi)
- [ ] Define options interface (what users pass to `create()`)
- [ ] Add timestamp for uniqueness
- [ ] Handle relationships with `@odata.bind`
- [ ] Create fixtures in `tests/data/fixtures/[entity]-scenarios.ts` (optional)
- [ ] Define common test scenarios
- [ ] Write tests using factory and fixtures
- [ ] Always include cleanup in `finally` block

## Factory vs Fixture: When to Use What

| Use Factory Directly | Use Fixtures |
|---------------------|--------------|
| Simple one-off data | Common scenarios |
| Unique test case | Reused across tests |
| Exploring edge cases | Standard happy path |
| Quick prototype | Production test suite |

**Example:**
```typescript
// Direct factory - unique test case
const accountData = AccountFactory.create({ 
  name: 'Edge Case Account',
  revenue: -1000  // Testing negative revenue handling
});

// Fixture - common scenario
const scenario = ACCOUNT_TEST_SCENARIOS.ENTERPRISE_ACCOUNT;
const accountData = AccountFactory.create(scenario.account);
```

## Best Practices

1. **Each test owns its data** - Never rely on existing data
2. **Use factories for all data** - Don't manually construct objects
3. **Track what you create** - Push to array for cleanup
4. **Always use try/finally** - Ensures cleanup even on test failure
5. **Delete in reverse** - Respect foreign key constraints
6. **Log your operations** - Helps debug when cleanup fails
7. **Use fixtures for common scenarios** - Don't repeat scenario data
8. **Keep fixtures focused** - One scenario = one test purpose

## Common Patterns

### Simple Record
```typescript
const data = AccountFactory.create({ name: 'Test' });
const record = await webApi.createRecord('account', data);
```

### With Relationships
```typescript
const contactData = ContactFactory.create({ 
  firstName: 'John',
  accountId: account.id  // Links to parent account
});
const contact = await webApi.createRecord('contact', contactData);
```

### Using Scenarios
```typescript
const scenario = CASE_TEST_SCENARIOS.DUMPING_INVESTIGATION;
const categoryData = CaseCategoryFactory.create(scenario.category);
const caseTypeData = CaseTypeFactory.create(scenario.caseType);
const caseData = CaseFactory.create(scenario.case);
```

### Bulk Creation
```typescript
const cases = CaseFactory.createBulk(10, { categoryId: category.id });
for (const caseData of cases) {
  await webApi.createRecord('cg_case', caseData);
}
```
