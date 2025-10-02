// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import type { AzureReporterOptions } from '@alex_neo/playwright-azure-reporter';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  expect: {
    timeout: 30000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['junit', { outputFile: 'results.xml' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    [
      '@alex_neo/playwright-azure-reporter',
      {
        orgUrl: process.env.AZURE_DEVOPS_ORG_URL || 'https://dev.azure.com/your-organization',
        token: process.env.AZURE_DEVOPS_TOKEN || '',
        planId: parseInt(process.env.AZURE_TEST_PLAN_ID || '0'),
        projectName: process.env.AZURE_PROJECT_NAME || 'Your Project Name',
        logging: true,
        testRunTitle: `Future TRS Tests - ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${process.env.CI ? 'Pipeline' : 'Local'}`,
        publishTestResultsMode: 'testRun',
        uploadAttachments: true,
        attachmentsType: ['screenshot', 'video', 'trace'],
        testRunConfig: {
          comment: 'Automated Playwright Test Execution',
          configurationIds: [1], // Default configuration ID - you can get actual IDs from Azure DevOps
        },
        // Enable test case summary for unmatched test cases
        testCaseSummary: {
          enabled: true,
          outputPath: 'test-case-summary.md',
          consoleOutput: true,
          publishToRun: true
        }
      } as AzureReporterOptions
    ]
  ],
  use: {
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    navigationTimeout: 60000,
    actionTimeout: 15000,
  },

  projects: [
    // D365/MDA Setup and Tests
    {
      name: 'mda-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'mda-tests',
      testDir: './tests/mda',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/user.json',
      },
      dependencies: ['mda-setup'],
    },

    // Office 365/Portal Setup and Tests  
    {
      name: 'portal-setup',
      testMatch: /auth-b2c\.setup\.ts/,
    },
    {
      name: 'portal-tests',
      testDir: './tests/portal',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/auth.json',
      },
      dependencies: ['portal-setup'],
    },

    // Public File Setup and Tests
    {
      name: 'public-file-setup',
      testMatch: /auth-public-file\.setup\.ts/, // Only matches the public-file setup
    },
    {
      name: 'public-file-tests',
      testDir: './tests/public-file',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/public-file.json', // Uses Azure auth
      },
      dependencies: ['public-file-setup'],
    },
  ],
});
