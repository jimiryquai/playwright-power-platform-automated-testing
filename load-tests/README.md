# Load Tests

Performance testing for Power Platform applications using [Locust](https://locust.io/).

## Quick Start

```bash
# 1. Install dependencies
npm run load:install

# 2. Setup authentication (first time only)
npm run setup:portal
npm run setup:public-file

# 3. Verify auth is working
npm run load:test-auth

# 4. Run load tests
npm run load:portal        # Interactive UI
npm run load:public-file   # Interactive UI
```

## What's Included

### Applications
- **Portal** (`portal_with_auth.py`) - Web API load testing
  - Form submission with ASP.NET tokens
  - AppID extraction from redirects
  - Anti-forgery token handling
  - Web API PATCH operations
  - Tests breaking point for concurrent API calls
- **Public File** (`public_file_with_auth.py`) - Public file app testing

### Helper Tools
- **`helpers/playwright_auth.py`** - Reuses Playwright authentication
- **`test_auth.py`** - Verifies authentication is working

## Architecture

```
Playwright Tests → auth/*.json → Locust Load Tests
```

Load tests reuse authentication from Playwright tests, so you don't need to handle login separately.

## Running Tests

### Interactive Mode (Development)

Opens a web UI at http://localhost:8089:

```bash
npm run load:portal
npm run load:public-file
```

### Headless Mode (CI/CD)

Runs automatically and generates HTML reports:

```bash
npm run load:ci:portal        # 20 users, 60s
npm run load:ci:public-file   # 10 users, 60s
```

Reports saved to: `load-tests/reports/`

### Custom Parameters

```bash
# Mac/Linux
bash run-locust.sh portal_with_auth "--headless -u 50 -r 10 -t 120s --html reports/custom.html"

# Windows
run-locust.cmd portal_with_auth --headless -u 50 -r 10 -t 120s --html reports/custom.html
```

Parameters:
- `-u` Number of concurrent users
- `-r` Spawn rate (users/second)
- `-t` Test duration (e.g., 60s, 5m)
- `--html` Generate HTML report

## File Structure

```
load-tests/
├── locustfiles/
│   ├── portal_with_auth.py          # Portal load test (consolidated)
│   └── public_file_with_auth.py     # Public file load test
├── helpers/
│   └── playwright_auth.py           # Auth helper
├── requirements.txt                 # Python dependencies
├── test_auth.py                     # Auth verification
└── reports/                         # Generated reports
```

## Troubleshooting

### Authentication Fails

```bash
# Re-run auth setup
npm run setup:portal
npm run setup:public-file

# Verify it works
npm run load:test-auth
```

### Python Module Errors

```bash
# Activate virtual environment
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\activate     # Windows

# Reinstall
npm run load:install
```

### Need More Help?

See the main **Load Testing Documentation** artifact for:
- Complete setup instructions
- CI/CD integration examples
- How to add new tests
- Best practices
- Detailed troubleshooting

## Environment Variables

Required in `.env`:

```env
PORTAL_URL=https://your-portal.powerappsportals.com
AZURE_APP_URL=https://your-app.azurewebsites.net
```

## Dependencies

- Python 3.9+
- `uv` (fast package installer)
- Locust 2.20.0+
- See `requirements.txt` for full list

## Adding New Tests

1. Create `locustfiles/your_test.py`
2. Extend `PlaywrightAuthReuser` if needed
3. Add npm scripts to `package.json`
4. Run and verify

See main documentation for detailed examples.

## Reports

After running headless tests, open:
- `reports/portal-report.html`
- `reports/public-file-report.html`

Key metrics to monitor:
- Response times (50th, 95th, 99th percentile)
- Requests per second (RPS)
- Failure rate
- Concurrent users

## CI/CD Integration

Example GitHub Actions workflow available in main documentation.

Tests can run on schedule (nightly) or manually triggered.

## Maintenance

- **Weekly**: Verify auth (`npm run load:test-auth`)
- **Monthly**: Run full load tests and review reports
- **After changes**: Re-run auth setup if app behavior changed

---

For complete documentation, see the **Load Testing Handover Documentation** artifact.