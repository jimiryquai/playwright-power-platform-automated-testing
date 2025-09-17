// utils/Entity.ts
import { XrmHelper } from './XrmHelper';

export class Entity extends XrmHelper {

  /**
 * Wait for the form to be fully loaded and ready for interaction
 */
  async waitForFormReady(timeout: number = 30000): Promise<void> {
    await this.waitForXrmReady();

    await this.page.waitForFunction(() => {
      return window.Xrm?.Page?.data?.entity;
    }, { timeout });
  }
  
  /**
   * Get the current record ID, waiting for it to be available
   */
  async getRecordId(): Promise<string> {
    await this.waitForXrmReady();

    await this.page.waitForFunction(() => {
      const id = window.Xrm.Page.data.entity.getId();
      return id && id !== "" && id !== null;
    }, { timeout: 10000 });

    return await this.page.evaluate(() => {
      return window.Xrm.Page.data.entity.getId();
    });
  }

  /**
   * Save the current record
   */
  async save(): Promise<void> {
    await this.waitForXrmReady();
    await this.page.evaluate(() => {
      return window.Xrm.Page.data.entity.save();
    });
  }

  /**
   * Check if record has unsaved changes
   */
  async isDirty(): Promise<boolean> {
    await this.waitForXrmReady();
    return await this.page.evaluate(() => {
      return window.Xrm.Page.data.entity.getIsDirty();
    });
  }
}