import { FormConfig } from './form-config';

/**
 * Represents a snapshot of a form at a specific point in time.
 */
export interface FormVersion {
  /**
   * Version number (integer, increments with each change)
   */
  version: number;

  /**
   * The form configuration for this version
   */
  formConfig: FormConfig;

  /**
   * ISO string timestamp of when this version was created
   */
  createdAt: string;

  /**
   * A brief description of the changes made in this version
   */
  changeSummary?: string | undefined;
}

/**
 * Manages the version history of a form.
 */
export class FormVersionManager {
  private history: FormVersion[] = [];

  constructor(initialFormConfig: FormConfig) {
    this.addVersion(initialFormConfig, 'Initial version');
  }

  /**
   * Adds a new version to the history.
   * @param formConfig The new form configuration.
   * @param changeSummary A summary of the changes.
   * @returns The newly created version.
   */
  public addVersion(formConfig: FormConfig, changeSummary?: string): FormVersion {
    const versionNumber = formConfig.metadata?.version || this.history.length + 1;
    
    const existingVersion = this.getVersion(versionNumber);
    if (existingVersion) {
      existingVersion.changeSummary = changeSummary;
      existingVersion.formConfig = JSON.parse(JSON.stringify(formConfig));
      return existingVersion;
    }

    const newVersion: FormVersion = {
      version: versionNumber,
      formConfig: JSON.parse(JSON.stringify(formConfig)), // Deep copy
      createdAt: formConfig.metadata?.updatedAt || new Date().toISOString(),
      changeSummary: changeSummary,
    };
    
    this.history.push(newVersion);
    this.history.sort((a, b) => a.version - b.version); // Keep sorted
    return newVersion;
  }

  /**
   * Retrieves a specific version by its number.
   * @param versionNumber The version to retrieve.
   * @returns The form version, or undefined if not found.
   */
  public getVersion(versionNumber: number): FormVersion | undefined {
    return this.history.find(v => v.version === versionNumber);
  }

  /**
   * Gets the latest version of the form.
   * @returns The current form version, or undefined if history is empty.
   */
  public getCurrentVersion(): FormVersion | undefined {
    if (this.history.length === 0) {
      return undefined;
    }
    return this.history[this.history.length - 1];
  }

  /**
   * Rolls back to a previous version of the form.
   * @param versionNumber The version number to roll back to.
   * @returns The form configuration of the target version, or undefined if the version doesn't exist.
   */
  public rollbackTo(versionNumber: number): FormConfig | undefined {
    const targetVersion = this.getVersion(versionNumber);
    if (!targetVersion) {
      return undefined;
    }

    // Remove all versions after the target version
    this.history = this.history.filter(v => v.version <= versionNumber);
    
    return this.getCurrentVersion()?.formConfig;
  }

  /**
   * Returns the entire version history.
   */
  public getHistory(): FormVersion[] {
    return this.history;
  }
} 