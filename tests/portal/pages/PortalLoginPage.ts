import { Page, Locator, expect } from '@playwright/test';

export class PortalLoginPage {
  private page: Page;

  // Existing login locators
  private signInButton: Locator;
  private emailInput: Locator;
  private passwordInput: Locator;
  
  // Forgot password locators
  private forgotPasswordLink: Locator;
  private sendVerificationButton: Locator;
  private emailVerificationControl: Locator;
  private resendVerificationLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Existing login locators
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.emailInput = page.getByRole('textbox', { name: 'Email address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    
    // Forgot password locators
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot your password?' });
    this.sendVerificationButton = page.getByRole('button', { name: 'Send verification code' });
    this.emailVerificationControl = page.locator('#emailVerificationControl');
    this.resendVerificationLink = page.getByRole('link', { name: 'Send a new verification code' });
  }

  // Existing login method
  async login(username: string, password: string): Promise<void> {
    await this.signInButton.click();
    await this.emailInput.click();
    await this.emailInput.fill(username);
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
    await this.signInButton.click(); // Submit button
    
    // Wait for login to complete
    await this.page.waitForLoadState('networkidle');
  }

  // Navigate to forgot password page
  async navigateToForgotPassword(): Promise<void> {
    await this.signInButton.click();
    await this.forgotPasswordLink.click();
  }

  // Send verification code with email
  async sendVerificationCode(email?: string): Promise<void> {
    if (email) {
      await this.emailInput.click();
      await this.emailInput.fill(email);
    }
    await this.sendVerificationButton.click();
  }

  // Click resend verification code link
  async clickResendVerificationCode(): Promise<void> {
    await this.resendVerificationLink.click();
  }

  // Check if resend link is visible
  async isResendLinkVisible(): Promise<boolean> {
    return await this.resendVerificationLink.isVisible();
  }
}