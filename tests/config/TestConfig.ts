import 'dotenv/config';

// Add interface for organization test data
export interface OrganizationData {
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}

export interface Config {
  appUrl: string;
  appName: string;
  username: string;
  password: string;
  tenantId: string;
  portalUrl: string;
  b2cUsername: string;
  b2cPassword: string;
  azureAppUrl: string;      // ← New property
  azurePassword: string;    // ← New property
  testOrg: OrganizationData;
}

export const testConfig: Config = {
  // D365/MDA Configuration
  appUrl: process.env.APP_URL || '',
  appName: process.env.APP_NAME || '',

  // Portal Configuration  
  portalUrl: process.env.PORTAL_URL || '',

  // Authentication
  username: process.env.O365_USERNAME || '',
  password: process.env.O365_PASSWORD || '',
  tenantId: process.env.O365_TENANT_ID || '',
  b2cUsername: process.env.B2C_USERNAME || '',
  b2cPassword: process.env.B2C_PASSWORD || '',

  // Azure Configuration
  azureAppUrl: process.env.AZURE_APP_URL || '',
  azurePassword: process.env.AZURE_PASSWORD || '',

  // Add organization test data
  testOrg: {
    name: process.env.TEST_ORG_NAME || 'Playwright Test Organization',
    address: process.env.TEST_ORG_ADDRESS || '1 Playwright Lane',
    city: process.env.TEST_ORG_CITY || 'Playwright Town',
    postcode: process.env.TEST_ORG_POSTCODE || 'PL1 2LP',
    country: process.env.TEST_ORG_COUNTRY || 'England'
  }
};

// Optional: Add validation
export const validateConfig = (): void => {
  const requiredFields = ['username', 'password', 'appUrl', 'portalUrl'];
  const missing = requiredFields.filter(field => !testConfig[field as keyof Config]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};