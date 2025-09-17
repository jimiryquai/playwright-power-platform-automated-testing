import { Page, Locator } from '@playwright/test';
import { testConfig } from '../../config/TestConfig';

export class OrganizationPage {
  private page: Page;

  // locators
  readonly organizationNameField: Locator;
  readonly addressLine1Field: Locator;
  readonly cityTownField: Locator;
  readonly postalCodeField: Locator;
  readonly countryField: Locator;
  readonly employeeRadioButton: Locator;
  readonly directorRadioButton: Locator;
  readonly externalPartyRadioButton: Locator;
  readonly submitButton: Locator;
  readonly organizationInfoLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Define all locators
    this.organizationNameField = page.getByRole('textbox', { name: 'Organisation Name' });
    this.addressLine1Field = page.getByRole('textbox', { name: 'Address Line 1' });
    this.cityTownField = page.getByRole('textbox', { name: 'City / Town' });
    this.postalCodeField = page.getByRole('textbox', { name: 'Postal Code' });
    this.countryField = page.getByRole('textbox', { name: 'Country' });

    // Fixed radio button locators
    this.employeeRadioButton = page.locator('#cg_firstreporgrelationship_0');
    this.directorRadioButton = page.locator('#cg_firstreporgrelationship_1');
    this.externalPartyRadioButton = page.locator('#cg_firstreporgrelationship_2');

    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.organizationInfoLink = page.getByRole('link', { name: 'Organisation information' });
  }

  // Page actions
  async navigateToOrganizationPage(): Promise<void> {
    await this.organizationInfoLink.click();
  }

  async fillOrganizationDetails(orgData?: any): Promise<void> {
    const data = orgData || testConfig.testOrg;

    await this.organizationNameField.fill(data.name);
    await this.addressLine1Field.fill(data.address);
    await this.cityTownField.fill(data.city);
    await this.postalCodeField.fill(data.postcode);
    await this.countryField.fill(data.country);
  }

  async selectEmployeeRelationship(): Promise<void> {
    await this.employeeRadioButton.check();
  }

  async submitOrganizationForm(): Promise<void> {
    await this.submitButton.click();
  }

  // Combined workflow method
  async completeOrganizationSetup(orgData?: any): Promise<void> {
    await this.navigateToOrganizationPage();
    await this.fillOrganizationDetails(orgData);
    await this.selectEmployeeRelationship();
    await this.submitOrganizationForm();
  }
}