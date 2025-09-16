import { Page } from '@playwright/test';

export class PortalLoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    await this.page.getByRole('textbox', { name: 'Email address' }).click();
    await this.page.getByRole('textbox', { name: 'Email address' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password' }).click();
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click(); // Submit button
    
    // Wait for login to complete
    await this.page.waitForLoadState('networkidle');
  }
}