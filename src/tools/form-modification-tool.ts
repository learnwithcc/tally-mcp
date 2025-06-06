import { Tool } from './tool';
import { 
  TallyApiService, 
  FormModificationParser, 
  ParsedModificationCommand,
  FormModificationOperations
} from '../services';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { TallyForm, TallyFormsResponse } from '../models/tally-schemas';
import { FormConfig, FormVersionManager } from '../models';

export interface FormModificationArgs {
  /**
   * Natural language command describing the modification to make
   */
  command: string;
  
  /**
   * ID of the form to modify (if not specified, will try to parse from command)
   */
  formId: string; // Made mandatory for clarity
}

export interface FormModificationResult {
  /**
   * Whether the modification was successful, or if it needs clarification
   */
  status: 'success' | 'error' | 'clarification_needed';
  
  /**
   * The final form configuration (if successful)
   */
  finalFormConfig?: FormConfig;
  
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

  /**
   * Clarification prompt if the command was ambiguous
   */
  clarification?: {
    message: string;
    suggestions: string[];
  };
}

export class FormModificationTool implements Tool<FormModificationArgs, FormModificationResult> {
  public readonly name = 'form_modification_tool';
  public readonly description = 'Modifies existing Tally forms through natural language commands';

  private tallyApiService: TallyApiService;
  private commandParser: FormModificationParser;
  private formOperations: FormModificationOperations;
  private versionManagers: Map<string, FormVersionManager> = new Map();

  constructor(apiClientConfig: TallyApiClientConfig) {
    this.tallyApiService = new TallyApiService(apiClientConfig);
    this.commandParser = new FormModificationParser();
    this.formOperations = new FormModificationOperations();
  }

  /**
   * Execute the form modification based on natural language command
   */
  public async execute(args: FormModificationArgs): Promise<FormModificationResult> {
    try {
      let versionManager = this.versionManagers.get(args.formId);

      // Initialize version manager if it doesn't exist for this form
      if (!versionManager) {
        const formResponse = await this.tallyApiService.getForm(args.formId);
        if (!formResponse || (formResponse as any).error) {
           return this.createErrorResult(`Failed to fetch form: ${(formResponse as any)?.error || 'Unknown error'}`);
        }
        
        const initialFormConfig = this.formOperations.convertTallyFormToFormConfig(formResponse as TallyForm);
        versionManager = new FormVersionManager(initialFormConfig);
        this.versionManagers.set(args.formId, versionManager);
      }

      const parsedCommands = this.commandParser.parseMultipleCommands(args.command);
      
      const needsClarification = parsedCommands.some(cmd => this.commandParser.needsClarification(cmd));
      if (needsClarification) {
        const ambiguousCommand = parsedCommands.find(cmd => this.commandParser.needsClarification(cmd));
        return {
          status: 'clarification_needed',
          message: ambiguousCommand?.clarificationNeeded || 'Your command is ambiguous.',
          clarification: {
            message: ambiguousCommand?.clarificationNeeded || 'Your command is ambiguous. Please be more specific.',
            suggestions: this.commandParser.generateSuggestions(ambiguousCommand?.rawCommand || args.command)
          }
        };
      }

      let currentFormConfig = versionManager.getCurrentVersion()?.formConfig;
      if (!currentFormConfig) {
        return this.createErrorResult('Could not retrieve current form version.');
      }

      const allChanges: string[] = [];
      const allErrors: string[] = [];
      let overallSuccess = true;

      for (const command of parsedCommands) {
        const operationResult = this.formOperations.executeOperation(
          command,
          null, // Base form is not needed as we pass currentFormConfig
          currentFormConfig
        );

        if (operationResult.success && operationResult.modifiedFormConfig) {
          currentFormConfig = operationResult.modifiedFormConfig;
          versionManager.addVersion(currentFormConfig, operationResult.message);
          allChanges.push(...(operationResult.changes || []));
        } else {
          overallSuccess = false;
          allErrors.push(...(operationResult.errors || [operationResult.message]));
          break; // Stop processing on first error
        }
      }

      if (!overallSuccess) {
        return this.createErrorResult('One or more operations failed.', allErrors);
      }
      
      // Save the final configuration back to Tally
      try {
        if (currentFormConfig) {
          await this.tallyApiService.updateForm(args.formId, currentFormConfig);
          allChanges.push('Successfully saved changes to Tally.');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during save';
        allErrors.push(`Failed to save changes to Tally: ${errorMessage}`);
        return this.createErrorResult('Failed to save the updated form to Tally.', allErrors);
      }

      return {
        status: 'success',
        message: 'Form modification operations completed successfully.',
        changes: allChanges,
        finalFormConfig: currentFormConfig
      };

    } catch (error) {
      console.error('Error in form modification:', error);
      return this.createErrorResult('An unexpected error occurred.', [error instanceof Error ? error.message : 'Unknown error']);
    }
  }

  public getFormHistory(formId: string) {
    return this.versionManagers.get(formId)?.getHistory();
  }

  public async rollbackForm(formId: string, version: number): Promise<FormConfig | undefined> {
    const versionManager = this.versionManagers.get(formId);
    if (!versionManager) {
      return undefined;
    }
    const rolledBackConfig = versionManager.rollbackTo(version);
    
    // In a real scenario, you'd save this back to the API
    // if (rolledBackConfig) {
    //   await this.tallyApiService.updateForm(formId, rolledBackConfig);
    // }

    return rolledBackConfig;
  }

  private createErrorResult(message: string, errors?: string[]): FormModificationResult {
    return {
      status: 'error',
      message,
      errors: errors || [],
    };
  }
}