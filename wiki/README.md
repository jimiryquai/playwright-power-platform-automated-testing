# Playwright Power Platform Automated Testing

> **Comprehensive end-to-end testing framework for Microsoft Power Platform applications using Playwright and Python Locust**

This documentation hub provides everything you need to understand, use, and extend the automated testing framework for three Power Platform applications: Model-Driven Apps (MDA), Power Pages Portal, and Public File Static Web App.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** (comes with Node.js)
- **Python** 3.9+ (for load testing)
- **Azure DevOps** account (for CI/CD integration)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/itweedie/playwrightOnPowerPlatform.git
   cd playwrightOnPowerPlatform
   ```

2. **Install dependencies**
   ```bash
   npm install
   npx playwright install --with-deps
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   # MDA Configuration
   MDA_URL=https://your-org.crm.dynamics.com/...
   APP_NAME=Your App Name
   O365_USERNAME=your-username@domain.com
   O365_PASSWORD=your-password

   # Portal Configuration
   PORTAL_URL=https://your-portal.powerappsportals.com
   B2C_USERNAME=your-b2c-username
   B2C_PASSWORD=your-b2c-password

   # Public File Configuration
   AZURE_APP_URL=https://your-app.azurestaticapps.net
   AZURE_PASSWORD=your-azure-password

   # Azure Test Plans Integration
   AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org
   AZURE_DEVOPS_TOKEN=your-pat-token
   AZURE_TEST_PLAN_ID=123
   AZURE_PROJECT_NAME=Your Project Name
   ```

4. **Run your first tests**
   ```bash
   # Run all tests
   npm test

   # Run tests for a specific application
   npm run test:mda
   npm run test:portal
   npm run test:public-file
   ```

## 📚 Documentation Guide

### Core Framework Documentation

| Document | Description | When to Read |
|----------|-------------|--------------|
| **[Framework Components](./framework-components.md)** | Architecture, design patterns, and core utilities | Starting development or understanding the codebase |
| **[Data Patterns](./data-patterns.md)** | Test data generation using factories and Faker API | Writing tests that need realistic data |
| **[Testing Guide](./testing-guide.md)** | Writing, organizing, and running tests | Creating new tests or test suites |
| **[Authentication](./authentication.md)** | Multi-platform authentication setup and configuration | Setting up authentication or troubleshooting login issues |
| **[Load Testing](./load-testing.md)** | Performance testing with Python Locust | Running load tests or performance validation |
| **[Pipeline Setup](./pipeline-setup.md)** | Azure DevOps CI/CD pipeline configuration | Setting up or modifying the CI/CD pipeline |

### Quick Reference by Task

**I want to...**

- 📝 **Write a new test** → Start with [Testing Guide](./testing-guide.md)
- 🔑 **Fix authentication issues** → Check [Authentication](./authentication.md)
- 🏗️ **Understand the architecture** → Read [Framework Components](./framework-components.md)
- 🎲 **Generate test data** → See [Data Patterns](./data-patterns.md)
- ⚡ **Run load tests** → Follow [Load Testing](./load-testing.md)
- 🔄 **Configure CI/CD** → Review [Pipeline Setup](./pipeline-setup.md)

## 🏗️ Project Structure

```
playwright-power-platform-automated-testing/
├── tests/                          # Test files organized by application
│   ├── mda/                       # Model-Driven App tests
│   │   ├── auth.setup.ts         # MDA authentication setup
│   │   └── *.spec.ts             # MDA test specifications
│   ├── portal/                    # Power Pages Portal tests
│   │   ├── auth-b2c.setup.ts     # Portal B2C authentication
│   │   └── *.spec.ts             # Portal test specifications
│   └── public-file/               # Public File Static Web App tests
│       ├── auth-public-file.setup.ts  # Azure auth setup
│       └── *.spec.ts             # Public file test specifications
│
├── load-tests/                     # Load testing with Locust
│   ├── locustfiles/               # Locust test scenarios
│   │   ├── portal_with_auth.py   # Portal load tests
│   │   └── public_file_with_auth.py  # Public file load tests
│   ├── helpers/                   # Authentication and utilities
│   └── requirements.txt           # Python dependencies
│
├── helpers/                        # Shared utilities and helpers
│   ├── TestDataFactory.ts        # Test data generation
│   └── playwright_auth.py        # Python auth helper for Locust
│
├── auth/                          # Saved authentication states
│   ├── user.json                 # MDA auth state
│   ├── auth.json                 # Portal auth state
│   └── public-file.json          # Public file auth state
│
├── pipeline/                      # Azure DevOps pipeline configuration
│   ├── automatedTesting.yml      # Main pipeline definition
│   └── templates/                # Reusable job templates
│       └── test-job-template.yml # Template for test jobs
│
├── docs/                          # 📖 Documentation (you are here!)
│   ├── README.md                 # This file
│   ├── framework-components.md   # Architecture guide
│   ├── data-patterns.md          # Test data guide
│   ├── testing-guide.md          # Test writing guide
│   ├── authentication.md         # Auth configuration
│   ├── load-testing.md           # Performance testing
│   └── pipeline-setup.md         # CI/CD guide
│
├── playwright.config.ts           # Playwright configuration
├── package.json                   # npm scripts and dependencies
└── .env                          # Environment variables (not committed)
```

## 🧪 Testing Strategy

### Three Power Platform Applications

This framework tests three distinct Power Platform applications, each with its own authentication mechanism:

| Application | Authentication | Use Case |
|-------------|---------------|----------|
| **Model-Driven App (MDA)** | Microsoft 365 OAuth | Internal business processes and data management |
| **Power Pages Portal** | Azure AD B2C | External user-facing portal with form submissions |
| **Public File Static Web App** | Azure AD | Public file upload and verification |

### Test Types

- **UI Tests**: End-to-end user journey validation using Playwright
- **Accessibility Tests**: WCAG 2.1 compliance testing (Portal and Public File only)
- **Load Tests**: Performance testing under concurrent user load using Locust
- **Integration Tests**: Cross-application workflows and data flow validation

## 🎯 Common Tasks

### Running Tests

```bash
# All tests
npm test

# Specific application
npm run test:mda          # Model-Driven App
npm run test:portal       # Power Pages Portal
npm run test:public-file  # Public File App

# With UI mode (interactive)
npm run test:ui

# In headed mode (see the browser)
npm run test:headed

# Generate test code
npm run codegen:portal
npm run codegen:public-file
```

### Authentication Setup

```bash
# Run authentication setup for each app
npm run setup:portal
npm run setup:public-file

# MDA auth runs automatically before MDA tests
```

### Load Testing

```bash
# Install Python dependencies
npm run load:install

# Test authentication for load tests
npm run load:test-auth

# Run Portal load tests
npm run load:portal

# Run Public File load tests (via bash or cmd script)
bash run-locust.sh public_file_with_auth
```

### Viewing Results

```bash
# Open HTML test report
npm run test:report

# View trace for debugging
npm run test:trace
```

## 🔧 Development Workflow

### Standard Process

1. **Pull latest changes** from `main`
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch** using user story number
   ```bash
   git checkout -b "2032"
   ```

3. **Generate initial tests** using codegen
   ```bash
   npm run codegen:portal
   ```

4. **Refactor and enhance tests**
   - Make tests maintainable and readable
   - Add comprehensive assertions
   - Use Page Object Model patterns
   - Leverage test data factories

5. **Run tests locally** to verify
   ```bash
   npm run test:portal
   ```

6. **Commit and push** changes
   ```bash
   git add .
   git commit -m "Add portal form submission tests for story 2032"
   git push origin 2032
   ```

7. **Create Pull Request**
   - Link to Azure DevOps user story
   - Assign reviewer
   - Ensure CI checks pass

8. **After approval**, merge with "Delete source branch" checked

## 🛠️ Configuration

### Playwright Configuration (`playwright.config.ts`)

Key configuration options:

```typescript
{
  testDir: './tests',
  fullyParallel: true,           // Run tests in parallel
  retries: process.env.CI ? 2 : 0,  // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined,  // Limit workers in CI
  reporter: [
    'junit',                     // For Azure Test Plans
    'html',                      // Interactive HTML report
    '@alex_neo/playwright-azure-reporter'  // Azure DevOps integration
  ]
}
```

### Project-Specific Settings

Each application has its own Playwright project:

- **mda-setup** / **mda-tests**: Model-Driven App with O365 auth
- **portal-setup** / **portal-tests**: Power Pages with B2C auth
- **public-file-setup** / **public-file-tests**: Static Web App with Azure auth

Tests automatically run their respective setup projects first to handle authentication.

## 🔐 Security Best Practices

### Environment Variables

✅ **DO:**
- Store all credentials in `.env` file (local) or Azure DevOps variables (CI/CD)
- Use `.gitignore` to exclude `.env` from version control
- Mark passwords as secret in Azure DevOps
- Rotate credentials regularly

❌ **DON'T:**
- Hardcode credentials in test files
- Commit `.env` files to the repository
- Share credentials via email or chat
- Use production accounts for automated testing

### Authentication Files

The `auth/` directory contains saved authentication states:
- These files are gitignored and regenerated on each test run
- They contain session tokens but not passwords
- They expire and are automatically refreshed

## 🚦 CI/CD Pipeline

### Trigger Behavior

| Trigger Type | Test Selection | Use Case |
|--------------|---------------|----------|
| **Code Push** (to `main`) | All 3 apps run automatically | Continuous integration |
| **Upstream Pipeline** | All 3 apps run automatically | Post-deployment validation |
| **Manual Run** | Select via checkboxes | Development and debugging |

### Running in Azure DevOps

1. Navigate to **Pipelines** → **automatedTesting**
2. Click **Run pipeline**
3. Select which tests to run:
   - ☑ Run MDA Tests
   - ☑ Run Portal Tests
   - ☑ Run Public File Tests
4. Optionally override variables (e.g., `AZURE_TEST_PLAN_ID`)
5. Click **Run**

See [Pipeline Setup](./pipeline-setup.md) for detailed configuration.

## 📊 Test Reporting

### Local Reports

After running tests locally:

```bash
npm run test:report
```

This opens an HTML report showing:
- Test pass/fail status
- Execution time
- Screenshots on failure
- Video recordings
- Trace files for debugging

### Azure DevOps Reports

Tests automatically publish results to:
- **Azure Test Plans**: Results synced with test cases
- **Pipeline Artifacts**: HTML reports, videos, screenshots
- **Test Results Tab**: JUnit XML results with trends

### Understanding Test Results

- **✅ Passed**: Test completed successfully
- **❌ Failed**: Test failed with assertion error
- **⏭️ Skipped**: Test was skipped (usually conditionally)
- **🔄 Flaky**: Test passed on retry (needs investigation)

## 🐛 Troubleshooting

### Common Issues

#### Authentication Failures

**Symptom**: Tests fail at login step

**Solutions**:
1. Verify credentials in `.env` file
2. Check if MFA is required (not supported)
3. Ensure passwords are current
4. Review [Authentication](./authentication.md) guide

#### Tests Run Locally But Fail in Pipeline

**Symptom**: Green locally, red in CI

**Solutions**:
1. Check Azure DevOps variables are set correctly
2. Verify secret variables are marked as such
3. Review pipeline logs for error messages
4. Ensure `CI=true` environment variable handling

#### Flaky Tests

**Symptom**: Tests sometimes pass, sometimes fail

**Solutions**:
1. Add explicit waits instead of fixed timeouts
2. Wait for network requests to complete
3. Ensure proper page load detection
4. Use `waitForLoadState('networkidle')`

#### Load Tests Fail

**Symptom**: Locust tests error out

**Solutions**:
1. Verify Python dependencies: `npm run load:install`
2. Test authentication: `npm run load:test-auth`
3. Check auth files exist in `auth/` directory
4. Review [Load Testing](./load-testing.md) guide

### Getting Help

- Review the relevant documentation guide
- Check existing GitHub issues
- Run tests with `--debug` flag for detailed output
- Use `npm run test:ui` for interactive debugging

## 📈 Performance Considerations

### Test Execution Time

| Test Suite | Typical Duration | Parallel Capable |
|------------|------------------|-----------------|
| MDA Tests | 5-10 minutes | Yes (local) / No (CI) |
| Portal Tests | 8-15 minutes | Yes (local) / No (CI) |
| Public File Tests | 3-5 minutes | Yes (local) / No (CI) |
| Load Tests | 2-5 minutes | N/A |

### Optimization Tips

1. **Run tests in parallel locally**: Let Playwright use multiple workers
2. **Use test projects**: Separate setup from tests for faster reruns
3. **Selective test execution**: Only run affected tests during development
4. **Shared authentication**: Reuse auth state across tests
5. **Efficient selectors**: Use data-testid or role-based selectors

## 🤝 Contributing

### Before You Start

1. Read [Framework Components](./framework-components.md) to understand the architecture
2. Review [Testing Guide](./testing-guide.md) for best practices
3. Check existing tests for examples

### Code Standards

- **TypeScript**: All new code should be TypeScript
- **Page Object Model**: Use POM pattern for UI interactions
- **Data Factories**: Use factories for test data generation
- **Descriptive Names**: Clear test names that describe the scenario
- **Comments**: Explain "why" not "what" (code should be self-documenting)

### Pull Request Checklist

- [ ] Tests run successfully locally
- [ ] Code follows project conventions
- [ ] Documentation updated if needed
- [ ] Commit messages are clear and descriptive
- [ ] User story linked in Azure DevOps
- [ ] Reviewer assigned

## 🔗 Related Resources

### External Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Locust Documentation](https://docs.locust.io/)
- [Azure DevOps Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [Power Platform Documentation](https://docs.microsoft.com/en-us/power-platform/)

### Tools

- [Playwright VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
- [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
- [Faker API](https://fakerapi.it/) - Test data generation

### Internal Links

- [GitHub Repository](https://github.com/itweedie/playwrightOnPowerPlatform)
- [Azure DevOps Project](https://dev.azure.com/your-org/your-project)

## 📝 License

This project is internal to the organization. All rights reserved.

## 🆘 Support

For questions or issues:

1. **Check documentation**: Start with the relevant guide above
2. **Search existing issues**: Someone may have encountered the same problem
3. **Ask the team**: Reach out in the project chat
4. **Create an issue**: If you've found a bug or have a feature request

---

**Last Updated**: October 2025  
**Framework Version**: 1.0  
**Playwright Version**: 1.55.0