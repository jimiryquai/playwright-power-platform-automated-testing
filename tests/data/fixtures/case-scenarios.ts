// tests/data/fixtures/case-scenarios.ts
import { SHOW_ON_PORTAL_OPTIONS } from '../factories/CaseCategoryFactory';
import type { CreateCategoryOptions } from '../factories/CaseCategoryFactory';
import type { CreateCaseTypeOptions } from '../factories/CaseTypeFactory';
import type { CreateCaseOptions } from '../factories/CaseFactory';

interface CaseScenario {
  entities: {
    category: { type: string };
    caseType: { type: string };
    case: { type: string };
  };
  data: {
    category: CreateCategoryOptions;
    caseType: CreateCaseTypeOptions;
    case: CreateCaseOptions;
  };
}

export const CASE_TEST_SCENARIOS: Record<string, CaseScenario> = {
  SIMPLE_CASE: {
    entities: {
      category: { type: 'cg_case_category' },
      caseType: { type: 'cg_case_type' },
      case: { type: 'cg_case' }
    },
    data: {
      category: {
        name: 'Simple Test Category',
        showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
      },
      caseType: {
        name: 'Simple Investigation',
        description: 'Simple test investigation type',
        showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
      },
      case: {
        name: 'Simple Test Case'
      }
    }
  },
  
  COMPLEX_CASE: {
    entities: {
      category: { type: 'cg_case_category' },
      caseType: { type: 'cg_case_type' },
      case: { type: 'cg_case' }
    },
    data: {
      category: {
        name: 'Complex Investigation Category',
        showOnPortal: SHOW_ON_PORTAL_OPTIONS.NO
      },
      caseType: {
        name: 'Complex Investigation Type',
        description: 'Complex multi-phase investigation',
        showOnPortal: SHOW_ON_PORTAL_OPTIONS.NO
      },
      case: {
        name: 'Complex Multi-Phase Investigation Case'
      }
    }
  },

  DUMPING_INVESTIGATION: {
    entities: {
      category: { type: 'cg_case_category' },
      caseType: { type: 'cg_case_type' },
      case: { type: 'cg_case' }
    },
    data: {
      category: {
        name: 'Anti-Dumping Category',
        showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
      },
      caseType: {
        name: 'Dumping Investigation',
        description: 'Anti-dumping investigation case type',
        showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
      },
      case: {
        name: 'Dumping Investigation Test Case'
      }
    }
  },

  BSG_REVIEW: {
    entities: {
      category: { type: 'cg_case_category' },
      caseType: { type: 'cg_case_type' },
      case: { type: 'cg_case' }
    },
    data: {
      category: {
        name: 'BSG Review Category',
        showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
      },
      caseType: {
        name: 'BSG Review',
        description: 'BSG review case type',
        showOnPortal: SHOW_ON_PORTAL_OPTIONS.YES
      },
      case: {
        name: 'BSG Review Test Case'
      }
    }
  }
} as const;

export type CaseScenarioName = keyof typeof CASE_TEST_SCENARIOS;
