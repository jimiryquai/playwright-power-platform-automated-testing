import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { XrmHelper } from '../../utils/XrmHelper';
import 'dotenv/config';

 
// Define the configuration interface and load values from environment variables
interface Config {
  appUrl: string; // URL of the application to test
  appName: string; // Name of the application to verify
  username: string; // Username for login
  password: string; // Password for login
  tenantId: string; // Tenant ID for the Office 365 account
}
 
// Load configuration values, falling back to defaults if environment variables are not set
const config: Config = {
  appUrl: process.env.APP_URL || 'default_url',
  appName: process.env.APP_NAME || 'default_name',
  username: process.env.O365_USERNAME || 'default_username',
  password: process.env.O365_PASSWORD || 'default_password',
  tenantId: process.env.O365_TENANT_ID || 'default_tenant_id',
};


test.describe('MDA Tests', () => {
  let loginPage: LoginPage;
  // let accountPage: AccountPage;
  // let homeGridPage: HomePage;
  let xrmHelper: XrmHelper;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    loginPage = new LoginPage(page);
    // homeGridPage = new HomePage(page, 'account');
    xrmHelper = new XrmHelper(page);
    
    // Arrange - Login first
    await page.goto(config.appUrl);
    await loginPage.login(config.username, config.password);
    await xrmHelper.waitForXrmReady();
  });

  // test('can create a new account with required fields', async () => {
  //   // Arrange
  //   const testAccountName = `Test Account ${Date.now()}`;

  //   // Act
  //   await homeGridPage.openNewRecordForm();
  //   await xrmHelper.waitForFormReady();
  //   await accountPage.fillAccountName(testAccountName);
  //   await accountPage.saveButton.waitFor({ state: 'visible', timeout: 10000 });
  //   await accountPage.saveButton.click();
  //   await accountPage.page.waitForFunction(
  //     () => !window.Xrm.Page.data.entity.getIsDirty(),
  //     { timeout: 10000 }
  //   );

  //   // Assert
  //   const recordId = await accountPage.getRecordId();
  //   expect(recordId).toBeTruthy();
  //   expect(recordId).toMatch(/^{[0-9a-f-]{36}}$/i); // GUID format
    
  //   // Verify the name field contains our test data
  //   await expect(accountPage.accountNameField).toHaveValue(testAccountName);
  // });
});