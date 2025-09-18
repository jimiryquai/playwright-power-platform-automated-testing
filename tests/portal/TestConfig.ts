import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../.env') });

export interface OrganizationData {
  name: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}

export interface Config {
  portalUrl: string;
  b2cUsername: string;
  b2cPassword: string;
  username: string;
  password: string;
  testOrg: OrganizationData;
}

export const testConfig: Config = {
  portalUrl: process.env.PORTAL_URL || '',
  b2cUsername: process.env.B2C_USERNAME || '',
  b2cPassword: process.env.B2C_PASSWORD || '',
  username: process.env.O365_USERNAME || '',
  password: process.env.O365_PASSWORD || '',
  
  testOrg: {
    name: process.env.TEST_ORG_NAME || 'Playwright Test Organization',
    address: process.env.TEST_ORG_ADDRESS || '1 Playwright Lane',
    city: process.env.TEST_ORG_CITY || 'Playwright Town',
    postcode: process.env.TEST_ORG_POSTCODE || 'PL1 2LP',
    country: process.env.TEST_ORG_COUNTRY || 'England'
  }
};

export const validateConfig = (): void => {
  const requiredFields = ['portalUrl', 'b2cUsername', 'b2cPassword'];
  const missing = requiredFields.filter(field => !testConfig[field as keyof Config]);

  if (missing.length > 0) {
    throw new Error(`Missing required Portal environment variables: ${missing.join(', ')}`);
  }
};
