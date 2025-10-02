# Load Testing Guide

Performance testing for Power Platform applications using Locust.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Running Load Tests](#running-load-tests)
6. [Understanding the Tests](#understanding-the-tests)
7. [Reports and Metrics](#reports-and-metrics)
8. [Troubleshooting](#troubleshooting)
9. [Adding New Tests](#adding-new-tests)
10. [CI/CD Integration](#cicd-integration)
11. [Best Practices](#best-practices)

---

## Overview

### What is Locust?

[Locust](https://locust.io/) is an open-source load testing tool that lets you define user behavior in Python code and simulate millions of concurrent users to test your application's performance under stress.

### Key Features

- **Authentication Reuse**: Uses Playwright-saved auth state (no separate login needed)
- **Portal Focus**: Tests Portal Web API operations
- **CI/CD Ready**: Headless mode with HTML reports
- **Easy Setup**: One command to install dependencies
- **Interactive UI**: Monitor tests in real-time at http://localhost:8089

### What We Test

**Portal Web API Load Test** (`portal_with_auth.py`)
- Form submission with ASP.NET tokens
- AppID extraction from redirects
- Anti-forgery token handling
- Web API PATCH operations
- Tests breaking point for concurrent API calls

---

## Quick Start

```bash
# 1. Install Python dependencies
npm run load:install

# 2. Setup authentication (first time only)
npm run setup:portal

# 3. Verify auth is working
npm run load:test-auth

# 4. Run load tests
npm run load:portal        # Interactive UI
npm run load:ci:portal     # Headless CI mode
```

---

## Architecture

### Authentication Reuse

```
┌─────────────────────────────────────────────────────────┐
│                    Playwright Tests                      │
│  (Handles authentication, saves to auth/auth.json)       │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Saves auth state
                         ▼
                ┌────────────────┐
                │ auth/auth.json │
                │  - Cookies     │
                │  - Tokens      │
                └───────┬────────┘
                        │
                        │ Reads auth
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Locust Load Tests                           │
│  (Reuses auth, simulates concurrent users)               │
│                                                           │
│  └── portal_with_auth.py → Portal Web API test          │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- No separate auth handling in load tests
- Same credentials as Playwright tests
- Consistent authentication across test types

See [Authentication Guide](./authentication.md) for auth setup details.

---

## Prerequisites

### 1. Python Environment

**Required:** Python 3.9+ and `uv` (fast Python package installer)

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment (first time only)
python -m venv .venv

# Activate virtual environment
# Mac/Linux:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Install load test dependencies
npm run load:install
```

### 2. Playwright Authentication

Load tests require Playwright authentication to be set up first:

```bash
# Set up Portal authentication
npm run setup:portal
```

This creates `auth/auth.json` with saved authentication state.

### 3. Environment Variables

Ensure your `.env` file contains:

```bash
PORTAL_URL=https://your-portal.powerappsportals.com
```

---

## Running Load Tests

### Interactive Mode (Development)

Opens a web UI at http://localhost:8089 where you can:
- Set number of users
- Set spawn rate
- Start/stop tests
- View real-time statistics

```bash
npm run load:portal
```

**UI Features:**
- **Users**: Number of concurrent simulated users
- **Spawn Rate**: Users added per second
- **Charts**: Real-time response time and RPS graphs
- **Statistics**: Request counts, failures, response times
- **Download Data**: Export results as CSV

---

### Headless Mode (CI/CD)

Runs tests automatically and generates HTML reports:

```bash
npm run load:ci:portal        # 20 users, spawn 5/sec, run 60s
```

**Output:**
- Console statistics during run
- HTML report: `load-tests/reports/portal-report.html`

---

### Custom Parameters

Run Locust with custom settings:

```bash
# Mac/Linux
bash run-locust.sh portal_with_auth "--headless -u 50 -r 10 -t 120s --html reports/custom.html"

# Windows
run-locust.cmd portal_with_auth --headless -u 50 -r 10 -t 120s --html reports/custom.html
```

**Common Parameters:**
- `-u` Number of users (concurrent)
- `-r` Spawn rate (users/second)
- `-t` Run time (e.g., 60s, 5m, 1h)
- `--headless` Run without UI
- `--html` Generate HTML report

---

### Full Test Suite

Run Playwright tests + Load tests together:

```bash
npm run test:portal:full
# Runs: setup:portal → test:portal → load:ci:portal
```

---

## Understanding the Tests

### Portal Load Test: `portal_with_auth.py`

**Complete Flow:**
1. Load form page and extract ASP.NET tokens (`__VIEWSTATE`, etc.)
2. Submit organization form with extracted tokens
3. Extract AppID from redirect response
4. Get anti-forgery token from `/_layout/tokenhtml`
5. PATCH application via Web API with token

**What it Tests:**
- Concurrent Web API PATCH operations
- Form submission under load
- Token extraction and handling
- Complete form-to-API workflow
- Breaking point for API operations

**Code Structure:**

```python
class PortalWebAPIUser(HttpUser):
    wait_time = between(2, 5)  # Random wait between requests
    host = os.getenv('PORTAL_URL')
    
    def on_start(self):
        """Load authentication when user starts"""
        auth = PlaywrightAuthReuser('portal')
        cookies = auth.get_cookies()
        
        for name, value in cookies.items():
            self.client.cookies.set(name, value)
    
    @task(1)
    def complete_submission_flow(self):
        """Main test task - runs for each simulated user"""
        # ... form submission and API PATCH logic
```

**Key Components:**
- `wait_time`: Simulates realistic user behavior
- `on_start()`: Loads auth once per user
- `@task(1)`: Defines user actions (weight = 1)
- `self.client`: HTTP client with cookies

---

## Reports and Metrics

### HTML Report

After headless runs, open: `load-tests/reports/portal-report.html`

**Key Sections:**

**1. Statistics Table**
- Request counts (total, failures)
- Response times (min, max, avg, percentiles)
- Requests per second (RPS)
- Failure rate

**2. Charts**
- Total Requests per Second
- Response Times (95th, 99th percentile)
- Number of Users

**3. Failures**
- Lists all failed requests
- Shows error messages
- Groups by error type

---

### Key Metrics to Monitor

**Response Times:**
- **50th percentile**: Median response time
- **95th percentile**: 95% of requests faster than this
- **99th percentile**: 99% of requests faster than this

**Requests Per Second (RPS):**
- How many requests the system handled
- Higher is generally better

**Failure Rate:**
- Percentage of failed requests
- Should be < 1% for healthy systems

**Concurrent Users:**
- Number of simulated users
- Increase until failure rate rises

---

### Interpreting Results

**Good Performance:**
```
Requests: 5000
Failures: 0 (0.0%)
95th percentile: 250ms
99th percentile: 500ms
RPS: 100
```

**Warning Signs:**
```
Requests: 5000
Failures: 50 (1.0%)
95th percentile: 2000ms  ← Slow
99th percentile: 5000ms  ← Very slow
RPS: 50  ← Lower than expected
```

**Critical Issues:**
```
Requests: 5000
Failures: 500 (10.0%)  ← High failure rate
95th percentile: 10000ms
Status codes: Many 429, 500, 503
```

---

### Response Codes

**Success:**
- **204**: Success (expected for PATCH operations)

**Client Errors:**
- **400**: Validation errors (check form fields)
- **401/403**: Authentication issues (re-run auth setup)

**Rate Limiting:**
- **429**: Too many requests (breaking point reached)

**Server Errors:**
- **500+**: Server errors (investigate application)

---

## Troubleshooting

### Authentication Failures

**Problem:** Load test fails with 401/403 errors

**Solution:**
```bash
# 1. Re-run Playwright auth setup
npm run setup:portal

# 2. Verify auth is working
npm run load:test-auth

# 3. Try load test again
npm run load:portal
```

**Common Causes:**
- Auth file expired
- Auth file not found
- Wrong environment URL
- Cookies not loading correctly

---

### Missing Python Dependencies

**Problem:** `ModuleNotFoundError: No module named 'locust'`

**Solution:**
```bash
# Ensure virtual environment is activated
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\activate     # Windows

# Reinstall dependencies
npm run load:install
```

---

### SSL Certificate Errors

**Problem:** SSL verification errors (common in corporate networks)

**Solution:** Tests already disable SSL verification for corporate networks:

```python
# Already in code
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

self.client.verify = False
```

If still seeing errors, check network proxy settings.

---

### Path Errors on Windows

**Problem:** `bash: command not found`

**Solution:** Use the Windows script:
```bash
run-locust.cmd portal_with_auth
```

---

### All PATCH Fail with 400

**Problem:** All Web API PATCH operations return 400

**Solutions:**
1. **Check form fields match your portal:**
```python
# Update in portal_with_auth.py
form_data = {
    'cg_organisationname': org_name,
    'cg_organisationtype': '...',
    # Add/modify fields to match your portal
}
```

2. **Verify anti-forgery token:**
```python
# Add debug logging
print(f"Token: {token}")
print(f"AppID: {app_id}")
```

3. **Check Dataverse field names:**
- Field names must match your Dataverse entity
- Use exact API names (e.g., `cg_name` not `Name`)

---

## Adding New Tests

### 1. Create New Locustfile

Create `load-tests/locustfiles/your_new_test.py`:

```python
from locust import HttpUser, task, between
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from helpers.playwright_auth import PlaywrightAuthReuser

class YourNewUser(HttpUser):
    wait_time = between(2, 5)
    host = os.getenv('YOUR_APP_URL', 'https://default.com')
    
    def on_start(self):
        """Load authentication"""
        auth = PlaywrightAuthReuser('portal')  # Currently only portal supported
        cookies = auth.get_cookies()
        for name, value in cookies.items():
            self.client.cookies.set(name, value)
    
    @task(5)  # Weight: runs 5x more than weight=1 tasks
    def your_task(self):
        """Your load test task"""
        response = self.client.get("/your-endpoint")
        
        # Add assertions if needed
        if response.status_code != 200:
            response.failure(f"Got {response.status_code}")
```

### 2. Add NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "load:your-app": "bash run-locust.sh your_new_test",
    "load:ci:your-app": "cd load-tests && python -m locust -f locustfiles/your_new_test.py --headless -u 10 -r 2 -t 60s --html reports/your-app-report.html"
  }
}
```

### 3. Test Your Changes

```bash
# Interactive mode
npm run load:your-app

# Headless mode
npm run load:ci:your-app
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Portal Load Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Run nightly at 2 AM
  workflow_dispatch:      # Allow manual trigger

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          npm ci
          npx playwright install --with-deps
          pip install uv
          npm run load:install
      
      - name: Setup authentication
        run: npm run setup:portal
        env:
          PORTAL_URL: ${{ secrets.PORTAL_URL }}
          B2C_USERNAME: ${{ secrets.B2C_USERNAME }}
          B2C_PASSWORD: ${{ secrets.B2C_PASSWORD }}
      
      - name: Run Portal load test
        run: npm run load:ci:portal
      
      - name: Upload reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: load-test-reports
          path: load-tests/reports/
```

---

## Best Practices

### 1. Start Small

Don't immediately test with hundreds of users:

```bash
# Start with 5-10 users
npm run load:portal
# In UI: Set 10 users, spawn rate 2

# Gradually increase
# 10 → 25 → 50 → 100 → 200
```

### 2. Realistic Wait Times

Simulate real user behavior:

```python
# Good: Random wait like real users
wait_time = between(2, 5)

# Bad: No wait (unrealistic)
wait_time = constant(0)
```

### 3. Test Different Scenarios

Don't just test one endpoint:

```python
@task(5)  # Heavy use
def submit_form(self):
    # Form submission

@task(2)  # Moderate use
def view_application(self):
    # View existing data

@task(1)  # Light use
def search(self):
    # Search functionality
```

### 4. Monitor Server Resources

Watch your application server during tests:
- CPU usage
- Memory usage
- Database connections
- Network bandwidth

### 5. Regular Testing

```bash
# Weekly: Quick check
npm run load:ci:portal

# Monthly: Deep analysis
# Run with increasing user counts
# Compare results to previous months
```

### 6. Set Performance Baselines

Document expected performance:

```markdown
## Portal Performance Baseline (Jan 2025)
- 50 concurrent users
- 95th percentile: < 500ms
- Failure rate: < 0.5%
- RPS: > 80
```

---

## Maintenance

### Weekly Tasks
```bash
# Verify auth is still working
npm run load:test-auth

# Check Python dependencies
pip list --outdated
```

### Monthly Tasks
- Run full load tests and review reports
- Update baseline metrics if infrastructure changed
- Archive old reports (optional)

### After Major Changes
```bash
# Re-run Playwright auth setup
npm run setup:portal

# Update load test scenarios if app behavior changed
# Edit: load-tests/locustfiles/portal_with_auth.py

# Update this documentation
```

---

## File Structure

```
load-tests/
├── locustfiles/
│   └── portal_with_auth.py          # Portal Web API load test
├── helpers/
│   └── playwright_auth.py           # Auth helper
├── requirements.txt                 # Python dependencies
├── test_auth.py                     # Auth verification
└── reports/                         # Generated HTML reports

Root files:
├── run-locust.sh                    # Bash script to run tests
└── run-locust.cmd                   # Windows script to run tests
```

---

## Quick Reference

### Essential Commands

```bash
# Setup (first time)
npm run load:install
npm run setup:portal

# Verify
npm run load:test-auth

# Run tests (interactive)
npm run load:portal

# Run tests (CI/CD)
npm run load:ci:portal

# Full test suite
npm run test:portal:full
```

### Common Issues

| Issue | Solution |
|-------|----------|
| 401/403 errors | Re-run `npm run setup:portal` |
| Module not found | Activate venv and run `npm run load:install` |
| Bash not found | Use `run-locust.cmd` on Windows |
| SSL errors | Already handled, check proxy |
| All PATCH fail with 400 | Check form fields match your portal |

---

## Support and Further Reading

### Locust Documentation
- Official docs: https://docs.locust.io/
- Writing tasks: https://docs.locust.io/en/stable/writing-a-locustfile.html
- Command line options: https://docs.locust.io/en/stable/configuration.html

### Project Documentation
- [Authentication Guide](./authentication.md) - Auth setup and troubleshooting
- [Testing Guide](./testing-guide.md) - Playwright test setup
- [Pipeline Setup](./pipeline-setup.md) - CI/CD integration

---

## Summary

This load testing setup provides:
- ✅ Simple authentication reuse from Playwright
- ✅ Portal Web API stress testing
- ✅ Easy local development with interactive UI
- ✅ CI/CD ready with headless mode
- ✅ Detailed HTML reports
- ✅ Corporate network friendly (SSL disabled)

**Key Point:** These tests find the breaking point for your Portal's Web API PATCH operations under concurrent load. Use them regularly to ensure your application can handle expected traffic.

**Next Steps:**
- Run your first load test: `npm run load:portal`
- Review the HTML report
- Set performance baselines
- Integrate into CI/CD pipeline