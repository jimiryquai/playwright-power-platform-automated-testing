# Authentication Guide

Authentication strategy for Power Platform testing using Playwright's storage state pattern.

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Applications & Auth Methods](#applications--auth-methods)
4. [Setup Files](#setup-files)
5. [Running Setup](#running-setup)
6. [Load Test Integration](#load-test-integration)
7. [Troubleshooting](#troubleshooting)
8. [Environment Variables](#environment-variables)

---

## Overview

### The Challenge

Testing secure Power Platform applications requires handling various authentication providers:
- **Microsoft Entra ID** (formerly Azure AD) for Model-Driven Apps
- **Portal Authentication** for Power Pages (Azure B2C disabled in test environment)
- **Azure AD** for Static Web Apps

Running authentication for every test would be slow and unstable.

### The Solution: Auth Scraper

We use a **"setup" script pattern** where Playwright:
1. Logs in as a real user (once)
2. Captures authentication state (cookies, tokens, localStorage)
3. Saves it to a JSON file
4. Subsequent tests reuse this auth state

**Benefits:**
- ✅ Fast test execution (no repeated logins)
- ✅ Stable (avoid flaky auth flows)
- ✅ Reusable across Playwright tests AND load tests
- ✅ Handles different auth methods per application
- ✅ Flexible configuration per environment

---

## How It Works

### Playwright Storage State

Playwright's [`storageState`](https://playwright.dev/docs/auth) captures:
- **Cookies**
- **localStorage** (tokens, session data)
- **sessionStorage**

**Pattern:**
```typescript
// 1. Setup script logs in and saves state
await page.context().storageState({ path: 'auth/app.json' });

// 2. Tests load the saved state
{
  name: 'app-tests',
  use: {
    storageState: 'auth/app.json'  // Pre-authenticated!
  }
}
```

### Project Dependencies

In `playwright.config.ts`, setup projects run **before** test projects:

```typescript
projects: [
  { name: 'portal-setup', testMatch: /auth-b2c\.setup\.ts/ },
  { 
    name: 'portal-tests',
    use: { storageState: 'auth/auth.json' },
    dependencies: ['portal-setup']  // Runs portal-setup first
  }
]
```

---

## Applications & Auth Methods

### 1. Model-Driven App (MDA)

**Authentication:** Microsoft Entra ID (O365)

**Flow:**
1. Navigate to MDA URL
2. Enter O365 credentials
3. Save state to `auth/user.json`

**Note:** MFA is not currently handled. Use test accounts without MFA enabled.

**Setup File:** `tests/mda/auth.setup.ts`

**Auth Provider:** `tests/mda/pages/LoginPage.ts`

---

### 2. Power Pages Portal

**Authentication:** Portal Login (Azure B2C disabled in test environment)

**Flow:**
1. Navigate to Portal URL
2. Enter Portal credentials
3. Verify "Account Home" appears
4. Save state to `auth/auth.json`

**Setup File:** `tests/portal/auth-b2c.setup.ts` *(named for historical reasons)*

**Auth Providers:**
- `tests/portal/pages/LoginPage.ts` (B2C - not used in test env)
- `tests/portal/pages/PortalLoginPage.ts` (Portal - actually used)

**Note:** While Azure B2C is configured in production, it's **disabled in the test environment**. The authentication flow uses only the Portal login form. The setup file is named `auth-b2c.setup.ts` for historical/organizational reasons, but in practice only performs Portal authentication.

---

### 3. Static Web App (Public File)

**Authentication:** Azure AD with Password-Only Login

**Flow:**
1. Navigate to Static Web App URL
2. Enter password (no username required)
3. Wait for form to disappear (indicates success)
4. Save state to `auth/public-file.json`

**Setup File:** `tests/public-file/auth-public-file.setup.ts`

**Auth Provider:** `tests/public-file/pages/PublicFileLoginPage.ts`

---

## Setup Files

### MDA Setup: `tests/mda/auth.setup.ts`

```typescript
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const authFile = 'auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Navigate and login
  await page.goto(process.env.APP_URL);
  await loginPage.login(
    process.env.O365_USERNAME,
    process.env.O365_PASSWORD
  );
  await page.waitForLoadState('networkidle');

  // Verify success
  await expect(page).toHaveURL(/dynamics\.com/);

  // Save auth state
  await page.context().storageState({ path: authFile });
});
```

**Key Points:**
- Single-step O365 login
- Waits for networkidle
- Verifies URL contains `dynamics.com`

---

### Portal Setup: `tests/portal/auth-b2c.setup.ts`

```typescript
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PortalLoginPage } from './pages/PortalLoginPage';

const authFile = 'auth/auth.json';

setup('authenticate', async ({ page }) => {
  const portalLoginPage = new PortalLoginPage(page);

  await page.goto(process.env.PORTAL_URL);

  // Portal login (B2C disabled in test environment)
  await portalLoginPage.login(
    process.env.B2C_USERNAME,
    process.env.B2C_PASSWORD
  );

  // Verify success
  await expect(page.getByRole('heading', { name: 'Account Home' }))
    .toBeVisible({ timeout: 15000 });

  // Ensure not in auth loop
  await expect(page.locator('button:has-text("Sign in")'))
    .not.toBeVisible();

  // Save auth state
  await page.context().storageState({ path: authFile });
});
```

**Key Points:**
- Single-step Portal login (B2C disabled in test env)
- File named `auth-b2c.setup.ts` for historical reasons
- Verifies "Account Home" heading
- Checks for auth loop (Sign in button should be gone)

**Production Note:** In production environments, Azure B2C may be enabled, requiring a two-step flow (B2C → Portal). The setup file structure supports both scenarios.

---

### Public File Setup: `tests/public-file/auth-public-file.setup.ts`

```typescript
import { test as setup, expect } from '@playwright/test';
import { PublicFileLoginPage } from './pages/PublicFileLoginPage';

const authFile = 'auth/public-file.json';

setup('authenticate public-file', async ({ page }) => {
  const loginPage = new PublicFileLoginPage(page);

  await page.goto(process.env.AZURE_APP_URL);
  
  // Password-only login
  await loginPage.login(process.env.AZURE_PASSWORD);

  // Wait for auth to complete
  await page.waitForTimeout(3000);

  // Verify URL
  await expect(page).toHaveURL(process.env.AZURE_APP_URL);

  // Save auth state
  await page.context().storageState({ path: authFile });
});
```

**Key Points:**
- Password-only (no username)
- Waits 3 seconds for app to load
- Simple verification (same URL)

---

## Running Setup

### Manual Setup

Run setup for a specific application:

```bash
# Portal
npm run setup:portal

# Public File
npm run setup:public-file

# MDA (runs automatically with tests, no separate script)
npm run test:mda
```

### Automatic Setup

Setup runs automatically before tests via project dependencies:

```bash
npm run test:portal  # Runs portal-setup → portal-tests
```

### Verify Auth Files

After setup, check that auth files exist:

```bash
ls -la auth/
# Should see:
# auth/user.json         (MDA)
# auth/auth.json         (Portal)
# auth/public-file.json  (Public File)
```

---

## Load Test Integration

### Reusing Auth in Locust

Load tests reuse Playwright auth via `helpers/playwright_auth.py`:

```python
from helpers.playwright_auth import PlaywrightAuthReuser

class PortalUser(HttpUser):
    def on_start(self):
        # Load Playwright auth
        auth = PlaywrightAuthReuser('portal')
        cookies = auth.get_cookies()
        
        # Set cookies in Locust client
        for name, value in cookies.items():
            self.client.cookies.set(name, value)
```

### How It Works

1. `PlaywrightAuthReuser` reads `auth/auth.json`
2. Extracts cookies from storage state
3. Passes cookies to Locust HTTP client
4. Load test runs as authenticated user

**Benefits:**
- No separate auth for load tests
- Same credentials as Playwright tests
- Consistent authentication across test types

See [Load Testing Guide](./load-testing.md) for details.

---

## Troubleshooting

### Auth File Not Found

**Error:** `ENOENT: no such file or directory, open 'auth/app.json'`

**Solution:**
```bash
# Run setup for that app
npm run setup:portal
npm run setup:public-file
```

---

### Auth Loop (Portal)

**Symptom:** Tests keep seeing "Sign in" button, never get to home page

**Causes:**
- Portal credentials incorrect
- Portal login timing out
- Network issues preventing page load
- Portal session not being saved properly

**Solutions:**
```typescript
// 1. Verify credentials are correct
console.log('Portal User:', process.env.B2C_USERNAME);
console.log('Portal URL:', process.env.PORTAL_URL);

// 2. Increase timeouts
await expect(page.getByRole('heading', { name: 'Account Home' }))
  .toBeVisible({ timeout: 30000 });

// 3. Add wait for page to settle
await page.waitForTimeout(3000);

// 4. Check for error messages
const error = await page.locator('.error, .alert-danger').textContent();
console.log('Auth error:', error);

// 5. Verify network idle
await page.waitForLoadState('networkidle');
```

**Note:** Environment variable is named `B2C_USERNAME` for historical reasons, but it's actually the Portal username (B2C is disabled in test environment).

---

### Expired Auth

**Symptom:** Tests fail with 401/403 after auth file is old

**Solution:** Re-run setup to refresh auth state

```bash
# Refresh Portal auth
npm run setup:portal

# Verify auth works for load tests
npm run load:test-auth
```

**Best Practice:** Run setup daily or at start of pipeline.

---

### Different Credentials Per Environment

**Problem:** Dev, QA, Prod need different credentials

**Solution:** Use environment-specific `.env` files

```bash
# .env.dev
PORTAL_USERNAME=devuser@company.com
PORTAL_PASSWORD=DevPass123

# .env.qa
PORTAL_USERNAME=qauser@company.com
PORTAL_PASSWORD=QAPass123

# Load specific env
dotenv -e .env.qa -- npm run setup:portal
```

---

## Environment Variables

### Required Variables

Create `.env` file in project root:

```bash
# === MDA (Model-Driven App) ===
APP_URL=https://your-org.crm.dynamics.com/main.aspx?appid=YOUR-APP-ID
O365_USERNAME=testuser@yourcompany.com
O365_PASSWORD=YourSecurePassword123

# === Portal (Power Pages) ===
PORTAL_URL=https://your-portal.powerappsportals.com
B2C_USERNAME=testuser@yourcompany.com  # Often same as O365
B2C_PASSWORD=YourSecurePassword123

# === Public File (Static Web App) ===
AZURE_APP_URL=https://your-app.azurestaticapps.net
AZURE_PASSWORD=YourAppPassword123
```

### Loading Environment Variables

**Automatically loaded** via:
- `playwright.config.ts` (uses `dotenv`)
- Setup scripts (import `'dotenv/config'`)

**Manual loading:**
```typescript
import 'dotenv/config';

const config = {
  username: process.env.O365_USERNAME || '',
  password: process.env.O365_PASSWORD || ''
};
```

---

## Best Practices

### 1. Separate Test Accounts

**DO:**
```bash
# Dedicated test accounts
O365_USERNAME=playwright-test@company.com
B2C_USERNAME=portal-test@company.com
```

**DON'T:**
```bash
# Don't use personal accounts
O365_USERNAME=john.doe@company.com
```

### 2. Secure Credential Storage

**Local Development:**
- Use `.env` file (added to `.gitignore`)
- Never commit credentials

**CI/CD:**
- Use Azure DevOps secrets/variables
- GitHub Actions secrets
- Azure Key Vault

### 3. Refresh Auth Regularly

```bash
# In CI/CD pipeline, always run setup
- npm run setup:portal
- npm run setup:public-file
- npm test
```

### 4. Verify Auth Before Tests

```typescript
// In test file
test.beforeEach(async ({ page }) => {
  // Quick auth check
  await page.goto(APP_URL);
  
  // If auth fails, setup needs to run
  if (page.url().includes('login')) {
    throw new Error('Auth state invalid - run setup:portal');
  }
});
```

---

## Summary

This authentication strategy provides:
- ✅ **Fast tests** - No repeated logins
- ✅ **Stable** - Avoid flaky auth flows
- ✅ **Multi-app support** - MDA, Portal, Public File
- ✅ **Reusable** - Works for Playwright AND Locust
- ✅ **Environment-specific** - Different credentials per environment
- ✅ **Simple** - Single-step auth per application

**Key Files:**
- `auth/*.setup.ts` - Setup scripts
- `auth/*.json` - Saved auth states
- `pages/*LoginPage.ts` - Auth page objects
- `helpers/playwright_auth.py` - Load test integration

**Next Steps:**
- [Testing Guide](./testing-guide.md) - Write tests using auth
- [Load Testing Guide](./load-testing.md) - Use auth in load tests
- [Pipeline Setup](./pipeline-setup.md) - Integrate auth in CI/CD