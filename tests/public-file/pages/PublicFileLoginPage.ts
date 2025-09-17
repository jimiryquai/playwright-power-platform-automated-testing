import { Page, Locator, expect } from '@playwright/test';

export class PublicFileLoginPage {
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Specific selectors for your login form
    this.passwordInput = page.locator('input[type="password"], input[name="password"], input[id="password"]').first();
    this.loginButton = page.locator('button.btn.swabutton.btn-primary.ml-2[onclick="submitPassword()"], button.btn.swabutton.btn-primary.ml-2, button:has-text("Submit")');
    this.errorMessage = page.locator('.error, .alert-danger, [class*="error"], [class*="alert"]');
  }

  async login(password: string): Promise<void> {
    console.log('Starting login process for Public File...');

    
    // Fill in password
    await this.passwordInput.fill(password);
    console.log('Password entered');
    
    // Click login button
    await this.loginButton.click();
    console.log('Login button clicked');

    // Wait for either success or error state
    await this.page.waitForFunction(
      () => {
        // Check if login form disappeared (success) or error appeared
        const passwordField = document.querySelector('input[type="password"]');
        const submitButton = document.querySelector('button.btn.swabutton.btn-primary.ml-2');
        const errorElement = document.querySelector('.error, .alert-danger, [class*="error"], [class*="alert"]');
        
        // Login succeeded if form elements are gone
        if (!passwordField || !submitButton) return 'success';
        
        // Login failed if error message appeared
        if (errorElement && errorElement.textContent?.trim()) return 'error';
        
        // Still processing
        return false;
      },
      { timeout: 15000 }
    );

    // Check for login errors
    const errorVisible = await this.errorMessage.isVisible().catch(() => false);
    if (errorVisible) {
      const errorText = await this.errorMessage.textContent();
      throw new Error(`Login failed: ${errorText}`);
    }
    
    console.log('Login process completed');
  }

  async isLoggedIn(): Promise<boolean> {
    // Check if we're still on a login page or if we've been redirected
    // You may need to adjust this based on your app's behavior
    const isOnLoginPage = await this.loginButton.isVisible().catch(() => false);
    return !isOnLoginPage;
  }

  async waitForLogin(): Promise<void> {
    // Wait for successful login indicators
    // You may need to adjust these based on your app's UI after login
    await this.page.waitForFunction(
      () => !document.querySelector('input[type="password"]'), 
      { timeout: 30000 }
    );
  }
}