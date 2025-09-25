// tests/data/factories/CaseFactory.ts

export interface CaseData {
  cg_name: string;
  'cg_Case_Category@odata.bind'?: string;
  'cg_Case_Type@odata.bind'?: string;
}

export interface CreateCaseOptions {
  name?: string;
  categoryId?: string;
  caseTypeId?: string;
}

export class CaseFactory {
  private static getTimestamp(): number {
    return Date.now();
  }

  static create(options: CreateCaseOptions = {}): CaseData {
    const timestamp = this.getTimestamp();
    const caseData: CaseData = {
      cg_name: `${options.name ?? 'Test Case'} ${timestamp}`
    };

    if (options.categoryId) {
      caseData['cg_Case_Category@odata.bind'] = `/cg_case_categories(${options.categoryId})`;
    }

    if (options.caseTypeId) {
      caseData['cg_Case_Type@odata.bind'] = `/cg_case_types(${options.caseTypeId})`;
    }

    return caseData;
  }

  static createBulk(
    count: number, 
    options: CreateCaseOptions = {}
  ): CaseData[] {
    const cases: CaseData[] = [];
    
    for (let i = 0; i < count; i++) {
      const caseOptions = {
        ...options,
        name: `${options.name ?? 'Bulk Test Case'} ${i + 1}`
      };
      cases.push(this.create(caseOptions));
    }
    
    return cases;
  }
}
