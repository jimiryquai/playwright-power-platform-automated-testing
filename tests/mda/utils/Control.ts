import { Page } from '@playwright/test';
import { XrmHelper } from './XrmHelper';

/**
 * State of a control from user perspective
 */
export interface ControlState {
  /**
   * Whether the control is currently visible to the user
   */
  isVisible: boolean;
  /**
   * Whether the control is currently disabled
   */
  isDisabled: boolean;
}

/**
 * Utility class for inspecting D365 Controls (user perspective)
 */
export class Control {
  private xrmHelper: XrmHelper;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.xrmHelper = new XrmHelper(page);
  }

  /**
   * Gets the state of the specified control as a user would see it
   * @param controlName Name of the control to retrieve
   * @returns Promise which fulfills with the current control state
   */
  async getControlState(controlName: string): Promise<ControlState> {
    await this.xrmHelper.waitForXrmReady();

    return await this.page.evaluate((name: string) => {
      const control = window.Xrm.Page.getControl(name);
      
      if (!control) {
        throw new Error(`Control '${name}' not found`);
      }

      // Check control visibility and parent visibility (section/tab)
      const isVisible = control.getVisible() && 
        (!control.getParent() || control.getParent().getVisible()) && 
        (!control.getParent() || !control.getParent().getParent() || control.getParent().getParent().getVisible());

      return {
        isVisible: isVisible,
        isDisabled: (control as any).getDisabled() as boolean
      };
    }, controlName);
  }

  /**
   * Gets the options of the specified option set control (what user can see)
   * @param controlName Name of the control to retrieve  
   * @returns Promise which fulfills with the control's options
   */
  async getControlOptions(controlName: string): Promise<Array<{ value: number; text: string }>> {
    await this.xrmHelper.waitForXrmReady();

    return await this.page.evaluate((name: string) => {
      const control = window.Xrm.Page.getControl(name);
      
      if (!control) {
        throw new Error(`OptionSet control '${name}' not found`);
      }

      return (control as any).getOptions();
    }, controlName);
  }

  /**
   * Check if a control is visible to the user (including parent visibility)
   * @param controlName Name of the control to check
   * @returns Promise which resolves to true if control is visible
   */
  async isControlVisible(controlName: string): Promise<boolean> {
    const state = await this.getControlState(controlName);
    return state.isVisible;
  }

  /**
   * Check if a control is disabled
   * @param controlName Name of the control to check  
   * @returns Promise which resolves to true if control is disabled
   */
  async isControlDisabled(controlName: string): Promise<boolean> {
    const state = await this.getControlState(controlName);
    return state.isDisabled;
  }
}