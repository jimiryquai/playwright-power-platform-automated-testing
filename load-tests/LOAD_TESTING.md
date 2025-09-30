# Load Testing Documentation

## Overview

This repository uses **Locust** for load testing Power Platform Portal applications. The load tests reuse authentication from **Playwright** tests, eliminating the need to handle authentication separately.

### Key Features

- **Authentication Reuse**: Uses Playwright-saved auth state (cookies/tokens)
- **Portal Focus**: Tests Portal Web API operations
- **CI/CD Ready**: Headless mode with HTML reports
- **Easy Setup**: One command to install dependencies

---

## Architecture

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

---

## Project Structure

```
load-tests/
├── locustfiles/                    # Load test scenarios
│   └── portal_with_auth.py         # Portal Web API load test
│
├── helpers/
│   └── playwright_auth.py          # Helper to read Playwright auth
│
├── requirements.txt                # Python dependencies
├── test_auth.py                    # Verify auth is working
└── reports/                        # Generated HTML reports (created on run)

Root files:
├── run-locust.sh                   # Bash script to run tests
└── run-locust.cmd                  # Windows script to run tests
```

---

## Prerequisites

### 1. Python Environment

You need Python 3.9+ and `uv` (fast Python package installer):

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment (first time only)
python -m venv .venv

# Activate virtual environment
# On Mac/Linux:
source .venv/bin/activate
# On Windows:
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

This creates auth file:
- `auth/auth.json` (Portal)

### 3. Environment Variables

Ensure your `.env` file contains:

```env
PORTAL_URL=https://your-portal.powerappsportals.com
```

---

## Running Load Tests

### Quick Start

```bash
# 1. Verify authentication is working
npm run load:test-auth

# 2. Run Portal load test (interactive UI)
npm run load:portal
```

### Interactive Mode (Development)

Interactive mode opens a web UI at http://localhost:8089 where you can:
- Set number of users
- Set spawn rate
- Start/stop tests
- View real-time statistics

```bash
npm run load:portal        # Portal (opens UI)
```

### Headless Mode (CI/CD)

Headless mode runs tests automatically and generates HTML reports:

```bash
# Portal: 20 users, spawn 5/sec, run for 60s
npm run load:ci:portal

# View reports in load-tests/reports/
```

### Custom Parameters

You can pass custom Locust parameters:

```bash
# Mac/Linux
bash run-locust.sh portal_with_auth "--headless -u 50 -r 10 -t 120s"

# Windows
run-locust.cmd portal_with_auth --headless -u 50 -r 10 -t 120s

# Parameters:
# -u = Number of users (concurrent)
# -r = Spawn rate (users/second)
# -t = Run time (e.g., 60s, 5m, 1h)
# --html = Generate HTML report
```

---

## Understanding the Load Tests

### Portal Load Test (`portal_with_auth.py`)

Tests the complete Web API flow for form submissions and PATCH operations:

**Complete Flow:**
1. Load form page and extract ASP.NET tokens (__VIEWSTATE, etc.)
2. Submit organization form with extracted tokens
3. Extract AppID from redirect response
4. Get anti-forgery token from `/_layout/tokenhtml`
5. PATCH application via Web API with token

**What it tests:**
- Concurrent Web API PATCH operations
- Form submission under load
- Token extraction and handling
- Complete form-to-API workflow
- Breaking point for API operations

**Purpose:**
Designed to find the breaking point for concurrent Web API operations on Power Apps Portals.

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

### SSL Certificate Errors (Corporate Networks)

**Problem:** SSL verification errors

**Solution:** The tests already disable SSL verification for corporate networks. If you still see errors, check your network proxy settings.

### Path Errors on Windows

**Problem:** `bash: command not found`

**Solution:** Use the Windows scripts:
```bash
run-locust.cmd portal_with_auth
```

---

## Adding New Load Tests

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
    
    @task(5)
    def your_task(self):
        """Your load test task"""
        self.client.get("/your-endpoint")
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
          PORTAL_USERNAME: ${{ secrets.PORTAL_USERNAME }}
          PORTAL_PASSWORD: ${{ secrets.PORTAL_PASSWORD }}
      
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
- Begin with 5-10 users
- Increase gradually to find breaking points
- Monitor server resources during tests

### 2. Realistic Wait Times
- Use `wait_time = between(2, 5)` to simulate real user behavior
- Don't hammer servers with zero wait time

### 3. Test Different Scenarios
- Peak hours vs off-hours
- Different form submission patterns
- Different user behaviors

### 4. Monitor and Alert
- Set up monitoring on your Power Platform environment
- Define acceptable response times
- Alert when thresholds are exceeded

### 5. Regular Testing
- Run load tests regularly (weekly/monthly)
- Test after major deployments
- Keep historical reports for comparison

---

## Understanding Reports

After running headless tests, open the HTML report:

```
load-tests/reports/portal-report.html
```

### Key Metrics

- **RPS (Requests Per Second)**: How many requests the system handled
- **Response Times**: 50th, 95th, 99th percentile response times
- **Failure Rate**: Percentage of failed requests
- **Concurrent Users**: Number of simulated users

### What to Look For

- **Response time increases** as users increase = normal
- **Sudden spikes** in response time = investigate
- **High failure rates** (>1%) = problem
- **Stable metrics** across test duration = good

### Interpreting PATCH Performance

The Portal load test specifically tracks Web API PATCH operations. Look for:
- **204 responses**: Success (expected for PATCH)
- **400 responses**: Validation errors
- **401/403 responses**: Authentication issues
- **429 responses**: Rate limiting (breaking point reached)
- **500+ responses**: Server errors

---

## Maintenance

### Weekly Tasks
- Verify auth is still working: `npm run load:test-auth`
- Check if dependencies need updates: `pip list --outdated`

### Monthly Tasks
- Run full load tests and review reports
- Update baseline metrics if infrastructure changed
- Archive old reports (optional)

### After Major Changes
- Re-run Playwright auth setup
- Update load test scenarios if app behavior changed
- Update this documentation

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

### File Locations

- Load test file: `load-tests/locustfiles/portal_with_auth.py`
- Auth helper: `load-tests/helpers/playwright_auth.py`
- Reports: `load-tests/reports/`
- Auth state: `auth/auth.json`

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

### Playwright Authentication
- See: `README.md` in project root
- Auth setup tests: `tests/auth/`

### Getting Help
- Check this documentation first
- Review load test output for specific errors
- Check Playwright auth is working: `npm run load:test-auth`
- Review `.env` file for correct URLs

---

## Summary

This load testing setup provides:
- ✅ Simple authentication reuse from Playwright
- ✅ Portal Web API stress testing
- ✅ Easy local development with interactive UI
- ✅ CI/CD ready with headless mode
- ✅ Detailed HTML reports
- ✅ Corporate network friendly (SSL disabled)

**Key Point**: These tests find the breaking point for your Portal's Web API PATCH operations under concurrent load. Use them regularly to ensure your application can handle expected traffic.