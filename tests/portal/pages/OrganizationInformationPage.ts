import { Page, Locator, expect } from '@playwright/test';

export class OrganizationInformationPage {
  readonly page: Page;
  
  // Page elements
  readonly heading: Locator;
  readonly subHeading: Locator;
  readonly backLink: Locator;
  readonly returnToTasksLink: Locator;
  
  // Form fields - Required
  readonly organizationNameField: Locator;
  readonly addressLine1Field: Locator;
  readonly cityTownField: Locator;
  readonly postalCodeField: Locator;
  readonly countryField: Locator;
  
  // Form fields - Optional
  readonly addressLine2Field: Locator;
  readonly addressLine3Field: Locator;
  readonly countyStateField: Locator;
  readonly organizationNumberField: Locator;
  readonly websiteField: Locator;
  
  // Radio buttons - Relationship
  readonly employeeRadioButton: Locator;
  readonly directorRadioButton: Locator;
  readonly externalPartyRadioButton: Locator;
  
  // Conditional field (appears only for external party)
  readonly externalPartyRoleField: Locator;
  
  // Actions
  readonly submitButton: Locator;
  readonly companiesHouseLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Page elements
    this.heading = page.getByRole('heading', { name: 'Organisation information', level: 3 });
    this.subHeading = page.getByRole('heading', { name: 'Details of the organisation that is applying for a new investigation', level: 1 });
    this.backLink = page.locator('a.govuk-back-link', { hasText: 'Back' });
    this.returnToTasksLink = page.locator('a.govuk-back-link', { hasText: 'Return to tasks' });
    
    // Required form fields
    this.organizationNameField = page.locator('input[name*="cg_organisationname"]');
    this.addressLine1Field = page.locator('input[name*="cg_addressline1"]');
    this.cityTownField = page.locator('input[name*="cg_town"]');
    this.postalCodeField = page.locator('input[name*="cg_postcode"]');
    this.countryField = page.locator('input[name*="cg_country"]');
    
    // Optional form fields
    this.addressLine2Field = page.locator('input[name*="cg_addressline2"]');
    this.addressLine3Field = page.locator('input[name*="cg_addressline3"]');
    this.countyStateField = page.locator('input[name*="cg_county"]');
    this.organizationNumberField = page.locator('input[name*="cg_organisationnumber"]');
    this.websiteField = page.locator('input[name*="cg_website"]');
    
    // Radio buttons - using the IDs from existing POM
    this.employeeRadioButton = page.locator('input[value="121480000"]'); // Employee
    this.directorRadioButton = page.locator('input[value="121480001"]'); // Director
    this.externalPartyRadioButton = page.locator('input[value="121480002"]'); // External party
    
    // Conditional field for external party
    this.externalPartyRoleField = page.locator('input[name*="cg_firstrepresentativeorgrelationshiptext"]');
    
    // Action buttons/links
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.companiesHouseLink = page.getByRole('link', { name: /Companies House/i });
  }

  /**
   * Verify page structure and content
   */
  async verifyPageStructure(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.subHeading).toBeVisible();
    await expect(this.backLink).toBeVisible();
    await expect(this.returnToTasksLink).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Verify all required fields are present and editable
   */
  async verifyRequiredFieldsEditable(): Promise<void> {
    await expect(this.organizationNameField).toBeVisible();
    await expect(this.organizationNameField).toBeEditable();
    
    await expect(this.addressLine1Field).toBeVisible();
    await expect(this.addressLine1Field).toBeEditable();
    
    await expect(this.cityTownField).toBeVisible();
    await expect(this.cityTownField).toBeEditable();
    
    await expect(this.postalCodeField).toBeVisible();
    await expect(this.postalCodeField).toBeEditable();
    
    await expect(this.countryField).toBeVisible();
    await expect(this.countryField).toBeEditable();
  }

  /**
   * Verify all optional fields are present and editable
   */
  async verifyOptionalFieldsEditable(): Promise<void> {
    await expect(this.addressLine2Field).toBeVisible();
    await expect(this.addressLine2Field).toBeEditable();
    
    await expect(this.addressLine3Field).toBeVisible();
    await expect(this.addressLine3Field).toBeEditable();
    
    await expect(this.countyStateField).toBeVisible();
    await expect(this.countyStateField).toBeEditable();
    
    await expect(this.organizationNumberField).toBeVisible();
    await expect(this.organizationNumberField).toBeEditable();
    
    await expect(this.websiteField).toBeVisible();
    await expect(this.websiteField).toBeEditable();
  }

  /**
   * Verify relationship radio buttons are present
   */
  async verifyRelationshipOptions(): Promise<void> {
    await expect(this.employeeRadioButton).toBeVisible();
    await expect(this.directorRadioButton).toBeVisible();
    await expect(this.externalPartyRadioButton).toBeVisible();
  }

  /**
   * Test conditional field: Select external party and verify role field appears
   */
  async verifyExternalPartyConditionalField(): Promise<void> {
    // Initially the role field should not be visible
    await expect(this.externalPartyRoleField).not.toBeVisible();
    
    // Select external party
    await this.externalPartyRadioButton.check();
    
    // Verify the conditional field appears
    await expect(this.externalPartyRoleField).toBeVisible();
    await expect(this.externalPartyRoleField).toBeEditable();
  }

  /**
   * Fill organization information form
   */
  async fillOrganizationInfo(data: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    cityTown: string;
    countyState?: string;
    postalCode: string;
    country: string;
    organizationNumber?: string;
    website?: string;
    relationship: 'employee' | 'director' | 'external';
    externalRole?: string;
  }): Promise<void> {
    // Fill required fields
    await this.organizationNameField.fill(data.name);
    await this.addressLine1Field.fill(data.addressLine1);
    await this.cityTownField.fill(data.cityTown);
    await this.postalCodeField.fill(data.postalCode);
    await this.countryField.fill(data.country);
    
    // Fill optional fields if provided
    if (data.addressLine2) {
      await this.addressLine2Field.fill(data.addressLine2);
    }
    if (data.addressLine3) {
      await this.addressLine3Field.fill(data.addressLine3);
    }
    if (data.countyState) {
      await this.countyStateField.fill(data.countyState);
    }
    if (data.organizationNumber) {
      await this.organizationNumberField.fill(data.organizationNumber);
    }
    if (data.website) {
      await this.websiteField.fill(data.website);
    }
    
    // Select relationship
    switch (data.relationship) {
      case 'employee':
        await this.employeeRadioButton.check();
        break;
      case 'director':
        await this.directorRadioButton.check();
        break;
      case 'external':
        await this.externalPartyRadioButton.check();
        if (data.externalRole) {
          await this.externalPartyRoleField.fill(data.externalRole);
        }
        break;
    }
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Click Return to tasks link
   */
  async returnToTasks(): Promise<void> {
    await this.returnToTasksLink.click();
  }

  /**
   * Click Back link
   */
  async goBack(): Promise<void> {
    await this.backLink.click();
  }
}