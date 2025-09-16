import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },

  projects: [
    // D365/MDA Setup and Tests
    { 
      name: 'mda-setup', 
      testMatch: /auth\.setup\.ts/, // Only matches tests/auth.setup.ts
    },
    {
      name: 'mda-tests',
      testDir: './tests/mda',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'auth/user.json', // Uses D365 auth
      },
      dependencies: ['mda-setup'],
    },

    // Office 365/Portal Setup and Tests  
    { 
      name: 'portal-setup', 
      testMatch: /auth-b2c\.setup\.ts/, // Only matches the b2c setup
    },
    {
      name: 'portal-tests',
      testDir: './tests/portal',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'auth/auth.json', // Uses Office 365 auth
      },
      dependencies: ['portal-setup'],
    },
  ],
});
