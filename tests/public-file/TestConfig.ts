import { config } from 'dotenv';
import path from 'path';

// Load .env from project root - explicit and clear
config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  azureAppUrl: string;
  azurePassword: string;
}

export const testConfig: Config = {
  azureAppUrl: process.env.AZURE_APP_URL || '',
  azurePassword: process.env.AZURE_PASSWORD || '',
};

export const validateConfig = (): void => {
  const requiredFields = ['azureAppUrl', 'azurePassword'];
  const missing = requiredFields.filter(field => !testConfig[field as keyof Config]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};