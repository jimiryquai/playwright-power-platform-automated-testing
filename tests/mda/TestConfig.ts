import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  appUrl: string;
  mdaUrl: string;
  appName: string;
  username: string;
  password: string;
  tenantId: string;
}

export const testConfig: Config = {
  appUrl: process.env.APP_URL || '',
  mdaUrl: process.env.APP_URL || '',
  appName: process.env.APP_NAME || '',
  username: process.env.O365_USERNAME || '',
  password: process.env.O365_PASSWORD || '',
  tenantId: process.env.O365_TENANT_ID || '',
};

export const validateConfig = (): void => {
  const requiredFields = ['appUrl', 'username', 'password'];
  const missing = requiredFields.filter(field => !testConfig[field as keyof Config]);

  if (missing.length > 0) {
    throw new Error(`Missing required MDA environment variables: ${missing.join(', ')}`);
  }
};
