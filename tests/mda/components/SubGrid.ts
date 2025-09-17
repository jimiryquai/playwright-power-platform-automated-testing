import { Page } from '@playwright/test';
import { Control } from '../utils/Control';
import { XrmHelper } from '../utils/XrmHelper';

export class SubGridComponent {
    private control: Control;
    private xrmHelper: XrmHelper;
    readonly page: Page;
    readonly subgridName: string;

    constructor(page: Page, subgridName: string) {
        this.page = page;
        this.subgridName = subgridName;
        this.control = new Control(page);
        this.xrmHelper = new XrmHelper(page);
    }

    /**
     * Check if this subgrid is visible to the user
     */
    async isVisible(): Promise<boolean> {
        return await this.control.isControlVisible(this.subgridName);
    }

    /**
     * Check if this subgrid is disabled
     */
    async isDisabled(): Promise<boolean> {
        return await this.control.isControlDisabled(this.subgridName);
    }

    /**
     * Get the record count of this subgrid
     */
    async getRecordCount(): Promise<number> {
        await this.xrmHelper.waitForXrmReady();

        const count = await this.page.evaluate((name) => {
            const control = window.Xrm.Page.getControl(name) as Xrm.Controls.GridControl;

            if (!control) {
                throw new Error(`Subgrid control '${name}' not found`);
            }

            return control.getGrid().getTotalRecordCount();
        }, this.subgridName);

        return count || 0;
    }

    /**
     * Open the nth record in the subgrid
     */
    async openNthRecord(recordNumber: number): Promise<void> {
        await this.xrmHelper.waitForXrmReady();

        const recordReference = await this.page.evaluate(([name, position]) => {
            const control = window.Xrm.Page.getControl(name) as Xrm.Controls.GridControl;
            if (!control) throw new Error(`Subgrid control '${name}' not found`);
            const grid = control.getGrid();
            const row = grid.getRows().get(position);
            if (!row) throw new Error(`No row at position ${position}`);
            const entity = row.data.entity;
            return { id: entity.getId(), entityType: entity.getEntityName() };
        }, [this.subgridName, recordNumber]);

        if (!recordReference) {
            throw new Error(`No record found at index ${recordNumber} in subgrid '${this.subgridName}'`);
        }

        // Navigate to the record
        await this.page.evaluate(([entityName, recordId]) => {
            return window.Xrm.Navigation.openForm({
                entityName: entityName,
                entityId: recordId
            });
        }, [recordReference.entityType, recordReference.id]);

        await this.xrmHelper.waitForXrmReady();
    }

    /**
     * Click the "Add New" button for this subgrid
     */
    async createNewRecord(): Promise<void> {
        await this.xrmHelper.waitForXrmReady();

        // First, ensure the parent tab is active
        const parentTab = await this.page.evaluate((name) => {
            const control = window.Xrm.Page.getControl(name) as Xrm.Controls.GridControl;

            if (!control) {
                throw new Error(`Subgrid control '${name}' not found`);
            }

            return control.getParent().getParent().getName();
        }, this.subgridName);

        // Open the parent tab
        await this.page.evaluate((tabName) => {
            const tab = window.Xrm.Page.ui.tabs.get(tabName);
            if (tab) {
                tab.setFocus();
            }
        }, parentTab);

        // Get the entity name for the button selector
        const entityName = await this.page.evaluate((name) => {
            const control = window.Xrm.Page.getControl(name) as Xrm.Controls.GridControl;
            return control ? control.getEntityName() : null;
        }, this.subgridName);

        if (!entityName) {
            throw new Error(`Could not determine entity name for subgrid '${this.subgridName}'`);
        }

        // Try to click the Add New button
        const addButtonSelector = `div[data-control-name='${this.subgridName}'] button[data-id*='Mscrm.SubGrid.${entityName}.AddNewStandard']`;

        try {
            await this.page.click(addButtonSelector, { timeout: 5000 });
        } catch {
            // Try overflow menu if direct button not found
            const overflowSelector = `div[data-control-name='${this.subgridName}'] button[data-id*='OverflowButton']`;
            await this.page.click(overflowSelector);

            // Click button in overflow menu
            await this.page.click(`ul[data-id='OverflowFlyout'] button[data-id*='Mscrm.SubGrid.${entityName}.AddNewStandard']`);
        }

        // Wait for navigation to complete
        await this.xrmHelper.waitForXrmReady();
    }

    /**
     * Refresh this subgrid
     */
    async refresh(): Promise<void> {
        await this.xrmHelper.waitForXrmReady();

        await this.page.evaluate((name) => {
            const control = window.Xrm.Page.getControl(name) as Xrm.Controls.GridControl;

            if (!control) {
                throw new Error(`Subgrid control '${name}' not found`);
            }

            return control.refresh();
        }, this.subgridName);
    }
}