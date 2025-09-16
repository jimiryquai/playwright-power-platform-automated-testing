import 'dotenv/config';

export interface Config {
  appUrl: string;
  appName: string;
  username: string;
  password: string;
  tenantId: string;
  portalUrl: string;
}

export const testConfig: Config = {
  // D365/MDA Configuration
  appUrl: process.env.APP_URL || 'https://futuretrsbuild.crm11.dynamics.com/main.aspx?appid=a38e444a-c33a-ef11-a317-002248c65cbe',
  appName: process.env.APP_NAME || 'Microsoft',
  
  // Portal Configuration  
  portalUrl: process.env.PORTAL_URL || 'https://ftrs-modeloffice.powerappsportals.com/',
  
  // Authentication
  username: process.env.O365_USERNAME || '',
  password: process.env.O365_PASSWORD || '',
  tenantId: process.env.O365_TENANT_ID || '',
};

// Optional: Add validation
export const validateConfig = (): void => {
  const requiredFields = ['username', 'password', 'appUrl', 'portalUrl'];
  const missing = requiredFields.filter(field => !testConfig[field as keyof Config]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};