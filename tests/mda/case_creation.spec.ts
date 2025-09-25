// tests/mda/case-creation.spec.ts
import { test, expect } from '@playwright/test';
import { XrmHelper } from './utils/XrmHelper';
import { WebApi } from './utils/WebApi';
import { CaseCategoryFactory } from '../data/factories/CaseCategoryFactory';
import { CaseTypeFactory } from '../data/factories/CaseTypeFactory';
import { CaseFactory } from '../data/factories/CaseFactory';
import { CASE_TEST_SCENARIOS } from '../data/fixtures/case-scenarios';
import { testConfig } from './TestConfig';

interface CreatedEntity {
  id: string;
  entityType: string;
}

test.describe('Case Creation Tests', () => {
  let xrmHelper: XrmHelper;
  let webApi: WebApi;

  test.beforeEach(async ({ page }) => {
    await page.goto(testConfig.mdaUrl);
    xrmHelper = new XrmHelper(page);
    webApi = new WebApi(xrmHelper);
  });

  test('Should create case hierarchy with proper relationships and cleanup in correct order', async () => {
    const scenario = CASE_TEST_SCENARIOS.SIMPLE_CASE;
    const { entities, data } = scenario;
    const { category: categoryEntity, caseType: caseTypeEntity, case: caseEntity } = entities;
    const { category: categoryData, caseType: caseTypeData, case: caseData } = data;
    const createdEntities: CreatedEntity[] = [];

    try {
      // Step 1: Create case category
      console.log('Creating case category...');
      const categoryFactoryData = CaseCategoryFactory.create(categoryData);
      const category = await webApi.createRecord(categoryEntity.type, categoryFactoryData);
      createdEntities.push({ id: category.id, entityType: categoryEntity.type });
      console.log(`Created category with ID: ${category.id}`);

      // Step 2: Create case type linked to category
      console.log('Creating case type linked to category...');
      const caseTypeFactoryData = CaseTypeFactory.create({
        ...caseTypeData,
        categoryId: category.id
      });
      const caseType = await webApi.createRecord(caseTypeEntity.type, caseTypeFactoryData);
      createdEntities.push({ id: caseType.id, entityType: caseTypeEntity.type });
      console.log(`Created case type with ID: ${caseType.id}`);

      // Step 3: Create case linked to both category and case type
      console.log('Creating case linked to both category and case type...');
      const caseFactoryData = CaseFactory.create({
        ...caseData,
        categoryId: category.id,
        caseTypeId: caseType.id
      });
      const testCase = await webApi.createRecord(caseEntity.type, caseFactoryData);
      createdEntities.push({ id: testCase.id, entityType: caseEntity.type });
      console.log(`Created case with ID: ${testCase.id}`);

      // Verify all entities were created successfully
      expect(category.id).toBeTruthy();
      expect(caseType.id).toBeTruthy();
      expect(testCase.id).toBeTruthy();

      // Verify the relationships are established correctly
      console.log('Verifying relationships...');
      const caseWithRelationships = await webApi.retrieveRecord(
        caseEntity.type,
        testCase.id,
        '?$select=_cg_case_category_value,_cg_case_type_value'
      );
      
      expect(caseWithRelationships._cg_case_category_value).toBe(category.id);
      expect(caseWithRelationships._cg_case_type_value).toBe(caseType.id);
      console.log('Relationships verified successfully');

    } finally {
      // Cleanup in reverse order: case -> case type -> category
      // This respects foreign key constraints
      console.log('Starting cleanup in reverse order...');
      
      for (const entity of createdEntities.reverse()) {
        try {
          console.log(`Deleting ${entity.entityType} with ID: ${entity.id}`);
          await webApi.deleteRecord(entity.entityType, entity.id);
          console.log(`Successfully deleted ${entity.entityType}`);
        } catch (error) {
          console.error(`Failed to cleanup ${entity.entityType} ${entity.id}:`, error);
        }
      }
      
      console.log('Cleanup completed');
    }
  });
});
