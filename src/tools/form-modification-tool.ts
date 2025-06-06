import { Tool } from './tool';
import { TallyApiService } from '../services';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { TallyForm, TallyFormsResponse } from '../models/tally-schemas';
import { FormConfig } from '../models';

export interface FormModificationArgs {
  /**
   * Natural language command describing the modification to make
   */
  command: string;
  
  /**
   * ID of the form to modify (if not specified, will try to parse from command)
   */
  formId?: string;
}

export interface FormModificationResult {
  /**
   * Whether the modification was successful
   */
  success: boolean;
  
  /**
   * The modified form (if successful)
   */
  modifiedForm?: TallyForm;
  
  /**
   * Human-readable message about what was done
   */
  message: string;
  
  /**
   * Summary of changes made
   */
  changes?: string[];
  
  /**
   * Any errors that occurred
   */
  errors?: string[];
}

export interface FormRetrievalOptions {
  /**
   * Page number for pagination
   */
  page?: number;
  
  /**
   * Number of forms per page
   */
  limit?: number;
  
  /**
   * Workspace ID to filter forms
   */
  workspaceId?: string;
}

export class FormModificationTool implements Tool<FormModificationArgs, FormModificationResult> {
  public readonly name = 'form_modification_tool';
  public readonly description = 'Modifies existing Tally forms through natural language commands';

  private tallyApiService: TallyApiService;

  constructor(apiClientConfig: TallyApiClientConfig) {
    this.tallyApiService = new TallyApiService(apiClientConfig);
  }

  /**
   * Execute the form modification based on natural language command
   */
  public async execute(args: FormModificationArgs): Promise<FormModificationResult> {
    try {
      console.log(`Executing form modification with command: ${args.command}`);
      
      // For now, this is a placeholder that demonstrates form retrieval
      // The actual command parsing and modification logic will be implemented in subsequent subtasks
      
      const formId = args.formId;
      if (!formId) {
        return {
          success: false,
          message: 'Form ID is required for modification. This will be enhanced in future iterations to parse form ID from natural language.',
          errors: ['Missing form ID']
        };
      }

      // Retrieve the form to verify it exists and get current state
      const existingForm = await this.getForm(formId);
      
      if (!existingForm) {
        return {
          success: false,
          message: `Form with ID ${formId} not found.`,
          errors: [`Form ${formId} does not exist`]
        };
      }

      return {
        success: true,
        message: `Successfully retrieved form "${existingForm.title}". Modification capabilities will be implemented in subsequent subtasks.`,
        modifiedForm: existingForm,
        changes: [`Retrieved form: ${existingForm.title}`]
      };

    } catch (error) {
      console.error('Error in form modification:', error);
      return {
        success: false,
        message: 'An error occurred while processing the form modification request.',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Retrieve a specific form by ID
   */
  public async getForm(formId: string): Promise<TallyForm | null> {
    try {
      return await this.tallyApiService.getForm(formId);
    } catch (error) {
      console.error(`Error retrieving form ${formId}:`, error);
      return null;
    }
  }

  /**
   * Retrieve a list of available forms
   */
  public async getForms(options: FormRetrievalOptions = {}): Promise<TallyFormsResponse | null> {
    try {
      return await this.tallyApiService.getForms(options);
    } catch (error) {
      console.error('Error retrieving forms list:', error);
      return null;
    }
  }

  /**
   * Update an existing form
   */
  public async updateForm(formId: string, formConfig: Partial<FormConfig>): Promise<TallyForm | null> {
    try {
      return await this.tallyApiService.updateForm(formId, formConfig);
    } catch (error) {
      console.error(`Error updating form ${formId}:`, error);
      return null;
    }
  }

  /**
   * Partially update an existing form with raw data
   */
  public async patchForm(formId: string, updates: Record<string, any>): Promise<TallyForm | null> {
    try {
      return await this.tallyApiService.patchForm(formId, updates);
    } catch (error) {
      console.error(`Error patching form ${formId}:`, error);
      return null;
    }
  }

  /**
   * Check if the API client is properly configured and can connect
   */
  public async validateConnection(): Promise<boolean> {
    try {
      // Try to retrieve a list of forms to validate the connection
      const result = await this.getForms({ limit: 1 });
      return result !== null;
    } catch (error) {
      console.error('Connection validation failed:', error);
      return false;
    }
  }
} 