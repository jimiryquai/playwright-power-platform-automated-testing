// tests/data/factories/CaseCategoryFactory.ts

// Constants for option set values
export const SHOW_ON_PORTAL_OPTIONS = {
  YES: 121480000,
  NO: 121480001
} as const;

export type ShowOnPortal = typeof SHOW_ON_PORTAL_OPTIONS[keyof typeof SHOW_ON_PORTAL_OPTIONS];

export interface CaseCategoryData {
  cg_case_category: string;
  cg_showonportal: ShowOnPortal;
}

export interface CreateCategoryOptions {
  name?: string;
  showOnPortal?: ShowOnPortal;
}

export class CaseCategoryFactory {
  // Default portal visibility setting
  private static readonly DEFAULT_SHOW_ON_PORTAL: ShowOnPortal = SHOW_ON_PORTAL_OPTIONS.YES;

  private static getTimestamp(): number {
    return Date.now();
  }

  static create(options: CreateCategoryOptions = {}): CaseCategoryData {
    const timestamp = this.getTimestamp();
    return {
      cg_case_category: `${options.name ?? 'Test Category'} ${timestamp}`,
      cg_showonportal: options.showOnPortal ?? this.DEFAULT_SHOW_ON_PORTAL
    };
  }
}
