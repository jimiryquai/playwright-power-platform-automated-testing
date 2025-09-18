import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  mdaUrl: string;
  appName: string;
  username: string;
  password: string;
}

export const testConfig: Config = {
  mdaUrl: process.env.MDA_URL || '',
  appName: process.env.APP_NAME || '',
  username: process.env.O365_USERNAME || '',
  password: process.env.O365_PASSWORD || '',
};

export const validateConfig = (): void => {
  const requiredFields = ['mdaUrl', 'username', 'password'];
  const missing = requiredFields.filter(field => !testConfig[field as keyof Config]);

  if (missing.length > 0) {
    throw new Error(`Missing required MDA environment variables: ${missing.join(', ')}`);
  }
};
