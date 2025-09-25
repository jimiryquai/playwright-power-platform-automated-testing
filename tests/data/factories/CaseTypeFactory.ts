// tests/data/factories/CaseTypeFactory.ts
import { SHOW_ON_PORTAL_OPTIONS, ShowOnPortal } from './CaseCategoryFactory';

export interface CaseTypeData {
  cg_case_type: string;
  cg_description: string;
  cg_showonportal: ShowOnPortal;
  'cg_Case_Category@odata.bind'?: string;
}

export interface CreateCaseTypeOptions {
  name?: string;
  description?: string;
  showOnPortal?: ShowOnPortal;
  categoryId?: string;
}

export class CaseTypeFactory {
  // Default portal visibility setting
  private static readonly DEFAULT_SHOW_ON_PORTAL: ShowOnPortal = SHOW_ON_PORTAL_OPTIONS.YES;

  private static getTimestamp(): number {
    return Date.now();
  }

  static create(options: CreateCaseTypeOptions = {}): CaseTypeData {
    const timestamp = this.getTimestamp();
    const caseTypeData: CaseTypeData = {
      cg_case_type: `${options.name ?? 'Test Case Type'} ${timestamp}`,
      cg_description: options.description ?? `Test description ${timestamp}`,
      cg_showonportal: options.showOnPortal ?? this.DEFAULT_SHOW_ON_PORTAL
    };

    if (options.categoryId) {
      caseTypeData['cg_Case_Category@odata.bind'] = `/cg_case_categories(${options.categoryId})`;
    }

    return caseTypeData;
  }
}
