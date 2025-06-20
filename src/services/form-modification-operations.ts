import { randomUUID } from 'crypto';
import { 
  FormConfig, 
  QuestionConfig, 
  QuestionType, 
  QuestionOption,
  ConditionalLogic,
  validateLogicReferences,
  getReferencedQuestionIds,
  SubmissionBehavior,
  MatrixResponseType,
} from '../models';
import { TallyForm } from '../models/tally-schemas';
import { 
  ParsedModificationCommand, 
  ModificationOperation, 
  ModificationParameters 
} from './form-modification-parser';

/**
 * Result of a form modification operation
 */
export interface ModificationOperationResult {
  success: boolean;
  modifiedFormConfig?: FormConfig;
  message: string;
  changes: string[];
  errors?: string[];
}

/**
 * Options for field lookup operations
 */
export interface FieldLookupOptions {
  formConfig: FormConfig;
  fieldNumber?: number;
  fieldId?: string;
  fieldLabel?: string;
}

/**
 * Validates dependencies within a form configuration.
 */
class DependencyValidator {
  /**
   * Checks if removing a field would break any conditional logic.
   * @param formConfig The current form configuration.
   * @param fieldIdToRemove The ID of the field to be removed.
   * @returns An array of error messages. Empty if no dependencies are broken.
   */
  public static validateFieldRemoval(formConfig: FormConfig, fieldIdToRemove: string): string[] {
    const errors: string[] = [];
    const allLogic: { logic: ConditionalLogic; ownerLabel: string }[] = [];

    // Collect all conditional logic from all questions
    formConfig.questions.forEach(q => {
      if (q.logic && q.id !== fieldIdToRemove) {
        allLogic.push({ logic: q.logic, ownerLabel: q.label });
      }
    });

    for (const { logic, ownerLabel } of allLogic) {
      const referencedIds = getReferencedQuestionIds(logic);
      if (referencedIds.includes(fieldIdToRemove)) {
        errors.push(
          `Removing this field will break conditional logic in question: "${ownerLabel}".`
        );
      }
    }

    return errors;
  }

  /**
   * Performs a comprehensive validation of all conditional logic in the form.
   * @param formConfig The form configuration to validate.
   * @returns An array of error messages. Empty if all logic is valid.
   */
  public static validateAllLogic(formConfig: FormConfig): string[] {
    const errors: string[] = [];
    const existingQuestionIds = formConfig.questions.map(q => q.id as string).filter(id => id);

    formConfig.questions.forEach(q => {
      if (q.logic) {
        const result = validateLogicReferences(q.logic, existingQuestionIds);
        if (!result.isValid) {
          errors.push(
            `Conditional logic for question "${q.label}" references non-existent question(s): ${result.missingQuestions.join(', ')}.`
          );
        }
      }
    });

    return errors;
  }
}


/**
 * Service for executing form modification operations
 */
export class FormModificationOperations {
  
  /**
   * Execute a parsed modification command on a form
   */
  public executeOperation(
    command: ParsedModificationCommand, 
    baseForm: TallyForm | null,
    currentFormConfig?: FormConfig
  ): ModificationOperationResult {
    try {
      // Convert TallyForm to FormConfig if not provided
      const formConfig = currentFormConfig || (baseForm ? this.convertTallyFormToFormConfig(baseForm) : undefined);

      if (!formConfig) {
        return {
          success: false,
          message: 'An error occurred while executing the modification operation',
          changes: [],
          errors: ['No form config provided or derivable.']
        }
      }
      
      let result: ModificationOperationResult;

      switch (command.operation) {
        case ModificationOperation.ADD_FIELD:
          result = this.addField(formConfig, command.parameters);
          break;
        case ModificationOperation.REMOVE_FIELD:
          result = this.removeField(formConfig, command.parameters);
          break;
        case ModificationOperation.MAKE_REQUIRED:
          result = this.makeFieldRequired(formConfig, command.parameters, true);
          break;
        case ModificationOperation.MAKE_OPTIONAL:
          result = this.makeFieldRequired(formConfig, command.parameters, false);
          break;
        case ModificationOperation.UPDATE_TITLE:
          result = this.updateFormTitle(formConfig, command.parameters);
          break;
        case ModificationOperation.UPDATE_DESCRIPTION:
          result = this.updateFormDescription(formConfig, command.parameters);
          break;
        case ModificationOperation.REORDER_FIELD:
          result = this.reorderField(formConfig, command.parameters);
          break;
        case ModificationOperation.ADD_OPTION:
          result = this.addOption(formConfig, command.parameters);
          break;
        case ModificationOperation.MODIFY_FIELD:
          result = this.modifyField(formConfig, command.parameters);
          break;
        default:
          result = {
            success: false,
            message: `Operation ${command.operation} is not yet implemented`,
            changes: [],
            errors: [`Unsupported operation: ${command.operation}`]
          };
      }

      // If modification was successful, update version and timestamp
      if (result.success && result.modifiedFormConfig) {
        const originalVersion = formConfig.metadata?.version || 1;
        
        if (!result.modifiedFormConfig.metadata) {
          result.modifiedFormConfig.metadata = {};
        }
        result.modifiedFormConfig.metadata.version = originalVersion + 1;
        result.modifiedFormConfig.metadata.updatedAt = new Date().toISOString();

        // Add version info to changes
        result.changes.push(`Form version incremented to ${result.modifiedFormConfig.metadata.version}`);
      }

      return result;

    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while executing the modification operation',
        changes: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Add a new field to the form
   */
  private addField(formConfig: FormConfig, params: ModificationParameters): ModificationOperationResult {
    if (!params.fieldType) {
      return {
        success: false,
        message: 'Field type is required for adding a field',
        changes: [],
        errors: ['Missing field type']
      };
    }

    const newFieldId = this.generateNextFieldId(formConfig);
    const fieldLabel = params.fieldLabel || this.generateDefaultFieldLabel(params.fieldType || QuestionType.TEXT);
    
    // Create properly configured question based on type
    const newField = this.createQuestionConfig(
      params.fieldType as QuestionType,
      newFieldId,
      fieldLabel || 'Untitled Field',
      params
    );

    const updatedFormConfig: FormConfig = {
      ...formConfig,
      questions: [...formConfig.questions, newField]
    };

    return {
      success: true,
      modifiedFormConfig: updatedFormConfig,
      message: `Successfully added ${fieldLabel} field`,
      changes: [
        `Added new field: ${fieldLabel}`,
        `Field type: ${params.fieldType}`,
        `Field ID: ${newFieldId}`,
        `Position: ${updatedFormConfig.questions.length}`
      ]
    };
  }

  /**
   * Remove a field from the form
   */
  private removeField(formConfig: FormConfig, params: ModificationParameters): ModificationOperationResult {
    const lookupOptions: FieldLookupOptions = { formConfig };
    if (params.fieldId) lookupOptions.fieldId = params.fieldId;
    if (params.fieldLabel) lookupOptions.fieldLabel = params.fieldLabel;
    if (params.fieldNumber) lookupOptions.fieldNumber = params.fieldNumber;
    const field = this.findField(lookupOptions);
    
    if (!field.found || typeof field.index !== 'number') {
      return {
        success: false,
        message: field.error || 'Field not found',
        changes: [],
        errors: [field.error || 'Field not found']
      };
    }

    const fieldIndex = field.index;
    const removedField = formConfig.questions[fieldIndex];
    if (!removedField?.id) {
      return {
        success: false,
        message: `Field at index ${fieldIndex} is invalid or missing an ID.`,
        changes: [],
        errors: [`Invalid field at index ${fieldIndex}`],
      };
    }
    const fieldIdToRemove = removedField.id;

    // Dependency Validation
    const validationErrors = DependencyValidator.validateFieldRemoval(formConfig, fieldIdToRemove);
    if (validationErrors.length > 0) {
      return {
        success: false,
        message: 'Cannot remove field due to broken dependencies.',
        changes: [],
        errors: validationErrors,
      };
    }

    const updatedQuestions = formConfig.questions.filter((_, index) => index !== fieldIndex);

    const updatedFormConfig: FormConfig = {
      ...formConfig,
      questions: updatedQuestions
    };

    // Post-removal validation
    const postRemovalErrors = DependencyValidator.validateAllLogic(updatedFormConfig);
    if (postRemovalErrors.length > 0) {
      return {
        success: false,
        message: 'An unexpected validation error occurred after field removal.',
        changes: [],
        errors: postRemovalErrors,
      };
    }

    return {
      success: true,
      modifiedFormConfig: updatedFormConfig,
      message: `Successfully removed field "${removedField.label}"`,
      changes: [
        `Removed field: ${removedField.label}`,
        `Field type: ${removedField.type}`,
        `Previous position: ${fieldIndex + 1}`,
        `Remaining fields: ${updatedQuestions.length}`
      ]
    };
  }

  /**
   * Update field required status
   */
  private makeFieldRequired(
    formConfig: FormConfig, 
    params: ModificationParameters, 
    required: boolean
  ): ModificationOperationResult {
    const lookupOptions: FieldLookupOptions = { formConfig };
    if (params.fieldId) lookupOptions.fieldId = params.fieldId;
    if (params.fieldLabel) lookupOptions.fieldLabel = params.fieldLabel;
    if (params.fieldNumber) lookupOptions.fieldNumber = params.fieldNumber;
    const field = this.findField(lookupOptions);
    
    if (!field.found || typeof field.index !== 'number') {
      return {
        success: false,
        message: field.error || 'Field not found',
        changes: [],
        errors: [field.error || 'Field not found']
      };
    }

    const fieldIndex = field.index;
    const updatedQuestions = [...formConfig.questions];
    const targetQuestion = updatedQuestions[fieldIndex];

    if (!targetQuestion) {
      return {
        success: false,
        message: 'Field not found at the specified index.',
        changes: [],
        errors: [`Invalid index ${fieldIndex}`]
      }
    }

    updatedQuestions[fieldIndex] = {
      ...targetQuestion,
      required
    };
    
    const updatedFormConfig: FormConfig = {
      ...formConfig,
      questions: updatedQuestions
    };

    return {
      success: true,
      modifiedFormConfig: updatedFormConfig,
      message: `Successfully set "required" to ${required} for field "${targetQuestion.label}"`,
      changes: [
        `Field: ${targetQuestion.label}`,
        `Property: required`,
        `New value: ${required}`,
        `Set required: ${required}`
      ]
    };
  }

  /**
   * Update the form title
   */
  private updateFormTitle(formConfig: FormConfig, params: ModificationParameters): ModificationOperationResult {
    if (!params.newValue) {
      return {
        success: false,
        message: 'New title value is required',
        changes: [],
        errors: ['Missing new title']
      };
    }
    
    const updatedFormConfig: FormConfig = {
      ...formConfig,
      title: params.newValue
    };

    return {
      success: true,
      modifiedFormConfig: updatedFormConfig,
      message: `Successfully updated form title to "${params.newValue}"`,
      changes: [
        `Updated form title`,
        `Previous title: ${formConfig.title}`,
        `New title: ${params.newValue}`,
        `Changed title to: "${params.newValue}"`
      ]
    };
  }

  /**
   * Update the form description
   */
  private updateFormDescription(formConfig: FormConfig, params: ModificationParameters): ModificationOperationResult {
    const newDescription = params.newValue || '';
    
    const updatedFormConfig: FormConfig = {
      ...formConfig,
      description: newDescription
    };

    return {
      success: true,
      modifiedFormConfig: updatedFormConfig,
      message: 'Successfully updated form description',
      changes: [
        `Updated form description`,
        `Previous description: ${formConfig.description || ''}`,
        `New description: ${newDescription}`,
        `Changed description to: "${newDescription}"`
      ]
    };
  }

  /**
   * Reorder a field in the form
   */
  private reorderField(formConfig: FormConfig, params: ModificationParameters): ModificationOperationResult {
    const { sourcePosition, targetPosition, fieldId, fieldLabel } = params;

    if (sourcePosition === undefined && fieldId === undefined && fieldLabel === undefined) {
      return {
        success: false,
        message: 'Source field identifier (position, ID, or label) is required for reordering',
        changes: [],
        errors: ['Missing source field identifier']
      };
    }

    if (targetPosition === undefined) {
      return {
        success: false,
        message: 'Target position is required for reordering',
        changes: [],
        errors: ['Missing target position']
      };
    }

    const lookupOptions: FieldLookupOptions = { formConfig };
    if (fieldId) lookupOptions.fieldId = fieldId;
    if (fieldLabel) lookupOptions.fieldLabel = fieldLabel;
    
    const sourceIndex = sourcePosition !== undefined 
      ? sourcePosition - 1 
      : this.findField(lookupOptions).index;

    if (sourceIndex === undefined || sourceIndex < 0 || sourceIndex >= formConfig.questions.length) {
      return {
        success: false,
        message: 'Source field not found or out of range',
        changes: [],
        errors: ['Invalid source field for reorder']
      };
    }

    const targetIndex = targetPosition - 1;
    if (targetIndex < 0 || targetIndex >= formConfig.questions.length) {
      return {
        success: false,
        message: 'Target position is out of range',
        changes: [],
        errors: ['Invalid target position for reorder']
      };
    }
    
    const updatedQuestions = [...formConfig.questions];
    const [movedField] = updatedQuestions.splice(sourceIndex, 1);
    
    if (!movedField) {
      return {
        success: false,
        message: 'Could not extract field to be moved.',
        changes: [],
        errors: ['Splice operation failed to return the field.'],
      };
    }

    updatedQuestions.splice(targetIndex, 0, movedField);

    const updatedFormConfig: FormConfig = {
      ...formConfig,
      questions: updatedQuestions
    };

    return {
      success: true,
      modifiedFormConfig: updatedFormConfig,
      message: `Successfully moved field "${movedField.label}" to position ${targetPosition}`,
      changes: [
        `Moved field: ${movedField.label}`,
        `Previous position: ${sourcePosition}`,
        `New position: ${targetPosition}`,
        `From position: ${sourcePosition}`,
        `To position: ${targetPosition}`
      ]
    };
  }

  /**
   * Add an option to a choice-type field
   */
  private addOption(formConfig: FormConfig, params: ModificationParameters): ModificationOperationResult {
    const { optionText, fieldId, fieldLabel, fieldNumber } = params;
    if (!optionText) {
      return {
        success: false,
        message: 'Option text is required',
        changes: [],
        errors: ['Missing new option']
      };
    }

    const lookupOptions: FieldLookupOptions = { formConfig };
    if (fieldId) lookupOptions.fieldId = fieldId;
    if (fieldLabel) lookupOptions.fieldLabel = fieldLabel;
    if (fieldNumber) lookupOptions.fieldNumber = fieldNumber;
    const field = this.findField(lookupOptions);
    if (!field.found || field.index === undefined) {
      return {
        success: false,
        message: field.error || 'Field not found',
        changes: [],
        errors: [field.error || 'Field not found']
      };
    }

    const fieldIndex = field.index;
    const targetField = formConfig.questions[fieldIndex];

    if (!targetField) {
      return {
        success: false,
        message: 'Target field is undefined.',
        changes: [],
        errors: ['Field not found at the specified index.'],
      };
    }

    if (!this.isChoiceField(targetField.type)) {
      return {
        success: false,
        message: `Cannot add options to field type ${targetField.type}`,
        changes: [],
        errors: [`Invalid field type for adding options: ${targetField.type}`]
      };
    }

    const updatedQuestions = [...formConfig.questions];
    const updatedField = { ...updatedQuestions[fieldIndex] } as any;

    if (!updatedField.options) {
      updatedField.options = [];
    }

    const newQuestionOption: QuestionOption = {
      text: optionText,
      value: optionText.toLowerCase().replace(/\s+/g, '_')
    };

    updatedField.options.push(newQuestionOption);
    updatedQuestions[fieldIndex] = updatedField;

    const updatedFormConfig: FormConfig = {
      ...formConfig,
      questions: updatedQuestions
    };

    return {
      success: true,
      modifiedFormConfig: updatedFormConfig,
      message: `Successfully added option "${optionText}" to field "${targetField.label}"`,
      changes: [
        `Field: ${targetField.label}`,
        `Added option: ${optionText}`,
        `Total options: ${updatedField.options.length}`
      ]
    };
  }

  /**
   * Modify properties of an existing field
   */
  private modifyField(formConfig: FormConfig, params: ModificationParameters): ModificationOperationResult {
    const lookupOptions: FieldLookupOptions = { formConfig };
    if (params.fieldId) lookupOptions.fieldId = params.fieldId;
    if (params.fieldNumber) lookupOptions.fieldNumber = params.fieldNumber;
    // Don't use fieldLabel for lookup in modify operations - it's the new value
    
    const field = this.findField(lookupOptions);
    
    if (!field.found || field.index === undefined) {
      return {
        success: false,
        message: field.error || 'Field not found for modification',
        changes: [],
        errors: [field.error || 'Field not found']
      };
    }

    const fieldIndex = field.index;
    const updatedQuestions = [...formConfig.questions];
    const currentField = updatedQuestions[fieldIndex];

    if (!currentField) {
      return {
        success: false,
        message: `Field at index ${fieldIndex} not found.`,
        changes: [],
        errors: [`Invalid field index ${fieldIndex}`],
      };
    }

    const changes: string[] = [];
    const updatedField = { ...currentField };

    // Handle fieldLabel as the new label value (not for lookup)
    if (params.fieldLabel) {
      changes.push(`Updated label from "${currentField.label}" to "${params.fieldLabel}"`);
      updatedField.label = params.fieldLabel;
    }
    if (params.newValue) {
      changes.push(`Updated label from "${currentField.label}" to "${params.newValue}"`);
      updatedField.label = params.newValue;
    }
    if (params.description !== undefined) {
      changes.push(`Description updated from "${currentField.description || ''}" to "${params.description}"`);
      updatedField.description = params.description;
    }
    if (params.placeholder !== undefined) {
      changes.push(`Placeholder updated from "${currentField.placeholder || ''}" to "${params.placeholder}"`);
      updatedField.placeholder = params.placeholder;
    }
    if (params.required !== undefined) {
      changes.push(`Required updated from ${currentField.required} to ${params.required}`);
      updatedField.required = params.required;
    }

    if (changes.length === 0) {
      return {
        success: false,
        message: 'No modifications specified',
        changes: [],
        errors: ['No modification parameters specified']
      };
    }

    updatedQuestions[fieldIndex] = updatedField;

    const updatedFormConfig: FormConfig = {
      ...formConfig,
      questions: updatedQuestions
    };

    return {
      success: true,
      modifiedFormConfig: updatedFormConfig,
      message: `Successfully modified field "${updatedField.label}"`,
      changes
    };
  }

  /**
   * Find a field in the form by number, ID, or label
   */
  private findField(options: FieldLookupOptions): { found: boolean; index?: number; error?: string } {
    const { formConfig, fieldNumber, fieldId, fieldLabel } = options;
    
    if (fieldNumber !== undefined) {
      const index = fieldNumber - 1;
      if (index < 0 || index >= formConfig.questions.length) {
        return { found: false, error: `Field number ${fieldNumber} is out of range` };
      }
      return { found: true, index };
    }
    
    if (fieldId) {
      const index = formConfig.questions.findIndex(q => q.id === fieldId);
      if (index === -1) {
        return { found: false, error: `Field with ID "${fieldId}" not found` };
      }
      return { found: true, index };
    }
    
    if (fieldLabel) {
      const lowercasedLabel = fieldLabel.toLowerCase();
      const index = formConfig.questions.findIndex(q => q.label.toLowerCase().includes(lowercasedLabel));
      if (index === -1) {
        return { found: false, error: `Field with label "${fieldLabel}" not found` };
      }
      return { found: true, index };
    }

    return { found: false, error: 'No field identifier provided (number, ID, or label)' };
  }

  /**
   * Generate a unique field ID using UUID
   * This ensures stable, unique identifiers across all form fields
   */
  private generateNextFieldId(formConfig: FormConfig): string {
    const existingIds = new Set(formConfig.questions.map(q => q.id).filter(id => id));
    
    // Generate a new UUID and ensure it's unique (extremely unlikely collision)
    let newId = randomUUID();
    while (existingIds.has(newId)) {
      newId = randomUUID();
    }
    
    return newId;
  }

  /**
   * Generate a default label for a new field
   */
  private generateDefaultFieldLabel(fieldType: QuestionType | string): string {
    const labelMap: Record<string, string> = {
      [QuestionType.TEXT]: 'Text Field',
      [QuestionType.EMAIL]: 'Email Address',
      [QuestionType.NUMBER]: 'Number Field',
      [QuestionType.CHOICE]: 'Choice Field',
      [QuestionType.RATING]: 'Rating Field',
      [QuestionType.FILE]: 'File Upload',
      [QuestionType.DATE]: 'Date Field',
      [QuestionType.TIME]: 'Time Field',
      [QuestionType.TEXTAREA]: 'Text Area',
      [QuestionType.DROPDOWN]: 'Dropdown Field',
      [QuestionType.CHECKBOXES]: 'Checkboxes Field',
      [QuestionType.LINEAR_SCALE]: 'Linear Scale',
      [QuestionType.MULTIPLE_CHOICE]: 'Multiple Choice',
      [QuestionType.PHONE]: 'Phone Number',
      [QuestionType.URL]: 'URL Field',
      [QuestionType.SIGNATURE]: 'Signature Field',
      [QuestionType.PAYMENT]: 'Payment Field',
      [QuestionType.MATRIX]: 'Matrix Field',
    };

    return labelMap[fieldType as QuestionType] || `${fieldType.toString().replace(/_/g, ' ')} Field`;
  }

  /**
   * Check if a field type supports options
   */
  private isChoiceField(fieldType: QuestionType | string): boolean {
    return [
      QuestionType.MULTIPLE_CHOICE,
      QuestionType.DROPDOWN,
      QuestionType.CHECKBOXES,
      QuestionType.MATRIX
    ].includes(fieldType as QuestionType);
  }

  /**
   * Create a properly configured question based on its type
   */
  private createQuestionConfig(
    fieldType: QuestionType,
    fieldId: string,
    fieldLabel: string,
    params: ModificationParameters
  ): QuestionConfig {
    const baseConfig = {
      id: fieldId,
      label: fieldLabel,
      required: false,
      description: params.description,
      placeholder: params.placeholder
    };

    switch (fieldType) {
      case QuestionType.RATING:
        return this.createRatingQuestionConfig(baseConfig, params);
      
      case QuestionType.DATE:
        return this.createDateQuestionConfig(baseConfig, params);
      
      case QuestionType.NUMBER:
        return this.createNumberQuestionConfig(baseConfig, params);
      
      case QuestionType.LINEAR_SCALE:
        return this.createLinearScaleQuestionConfig(baseConfig, params);
      
      case QuestionType.CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.DROPDOWN:
      case QuestionType.CHECKBOXES:
        return this.createChoiceQuestionConfig(fieldType, baseConfig, params);
      
      case QuestionType.TIME:
        return this.createTimeQuestionConfig(baseConfig, params);
      
      case QuestionType.FILE:
        return this.createFileQuestionConfig(baseConfig, params);
      
      case QuestionType.SIGNATURE:
        return this.createSignatureQuestionConfig(baseConfig, params);
      
      case QuestionType.PAYMENT:
        return this.createPaymentQuestionConfig(baseConfig, params);
      
      case QuestionType.MATRIX:
        return this.createMatrixQuestionConfig(baseConfig, params);
      
      default:
        // For other types, return basic configuration
        return {
          ...baseConfig,
          type: fieldType
        };
    }
  }

  /**
   * Create a rating question configuration
   */
  private createRatingQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.RATING,
      minRating: 1,
      maxRating: 5,
      style: 'stars' as any, // Default to stars
      showNumbers: false,
      lowLabel: 'Poor',
      highLabel: 'Excellent'
    };
  }

  /**
   * Create a date question configuration
   */
  private createDateQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.DATE,
      dateFormat: 'MM/DD/YYYY',
      includeTime: false
    };
  }

  /**
   * Create a number question configuration
   */
  private createNumberQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.NUMBER,
      step: 1,
      decimalPlaces: 0,
      useThousandSeparator: false
    };
  }

  /**
   * Create a linear scale question configuration
   */
  private createLinearScaleQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.LINEAR_SCALE,
      minValue: 1,
      maxValue: 10,
      step: 1,
      showNumbers: true,
      lowLabel: 'Not likely',
      highLabel: 'Very likely'
    };
  }

  /**
   * Create a choice question configuration (multiple choice, dropdown, checkboxes)
   */
  private createChoiceQuestionConfig(
    fieldType: QuestionType,
    baseConfig: any,
    params: ModificationParameters
  ): QuestionConfig {
    const defaultOptions = params.options ? 
      params.options.map((option: string) => ({
        text: option,
        value: option.toLowerCase().replace(/\s+/g, '_')
      })) : [
        { text: 'Option 1', value: 'option_1' },
        { text: 'Option 2', value: 'option_2' },
        { text: 'Option 3', value: 'option_3' }
      ];

    const config = {
      ...baseConfig,
      type: fieldType,
      options: defaultOptions,
      allowOther: false
    };

    // Add type-specific properties
    if (fieldType === QuestionType.CHECKBOXES) {
      return {
        ...config,
        minSelections: 0,
        maxSelections: undefined, // No limit
        layout: 'vertical' as any
      };
    }

    if (fieldType === QuestionType.DROPDOWN) {
      return {
        ...config,
        searchable: false,
        dropdownPlaceholder: 'Select an option...'
      };
    }

    if (fieldType === QuestionType.MULTIPLE_CHOICE) {
      return {
        ...config,
        randomizeOptions: false,
        layout: 'vertical' as any
      };
    }

    return config;
  }

  /**
   * Create a time question configuration
   */
  private createTimeQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.TIME,
      format: '12' as any, // 12-hour format
      minuteStep: 15
    };
  }

  /**
   * Create a file question configuration
   */
  private createFileQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.FILE,
      allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx'],
      maxFileSize: 10, // 10MB
      maxFiles: 1,
      multiple: false,
      uploadText: 'Click to upload or drag and drop'
    };
  }

  /**
   * Create a signature question configuration
   */
  private createSignatureQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.SIGNATURE,
      canvasWidth: 400,
      canvasHeight: 200,
      penColor: '#000000',
      backgroundColor: '#ffffff'
    };
  }

  /**
   * Create a payment question configuration
   */
  private createPaymentQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.PAYMENT,
      currency: 'USD',
      fixedAmount: true,
      amount: 1000, // $10.00 in cents
      paymentDescription: 'Payment',
      acceptedMethods: ['card' as any]
    };
  }

  /**
   * Create a matrix question configuration
   */
  private createMatrixQuestionConfig(
    baseConfig: any,
    _params: ModificationParameters
  ): QuestionConfig {
    return {
      ...baseConfig,
      type: QuestionType.MATRIX,
      rows: [
        { id: 'row_1', text: 'Row 1', value: 'row_1' },
        { id: 'row_2', text: 'Row 2', value: 'row_2' },
        { id: 'row_3', text: 'Row 3', value: 'row_3' }
      ],
      columns: [
        { id: 'col_1', text: 'Column 1', value: 'col_1' },
        { id: 'col_2', text: 'Column 2', value: 'col_2' },
        { id: 'col_3', text: 'Column 3', value: 'col_3' }
      ],
      defaultResponseType: MatrixResponseType.SINGLE_SELECT,
      allowMultiplePerRow: false,
      requireAllRows: false,
      randomizeRows: false,
      randomizeColumns: false,
      mobileLayout: 'stacked' as any,
      showHeadersOnMobile: true
    };
  }

  /**
   * Convert a TallyForm API response to a FormConfig object with comprehensive field details
   */
  public convertTallyFormToFormConfig(tallyForm: TallyForm & { questions?: any[], settings?: any }): FormConfig {
    return {
      title: tallyForm.title || 'Untitled Form',
      description: tallyForm.description || undefined,
      questions: (tallyForm.questions || []).map((field: any) => {
        // Base question configuration
        const baseConfig: any = {
          id: field.id || field.uuid,
          type: field.type as QuestionType,
          label: field.label || field.title || 'Untitled Question',
          description: field.description,
          required: field.required || field.validations?.some((r: any) => r.type === 'required') || false,
          placeholder: field.placeholder,
          order: field.order,
        };

        // Map validation rules if present
        if (field.validation || field.validations) {
          baseConfig.validation = this.mapValidationRules(field.validation || field.validations);
        }

        // Map conditional logic if present
        if (field.logic) {
          baseConfig.logic = field.logic;
        }

        // Type-specific configurations
        const typeSpecificConfig = this.mapTypeSpecificProperties(field);

        return {
          ...baseConfig,
          ...typeSpecificConfig
        };
      }),
      settings: {
        submissionBehavior: tallyForm.settings?.redirectOnCompletion 
          ? SubmissionBehavior.REDIRECT 
          : SubmissionBehavior.MESSAGE,
        redirectUrl: tallyForm.settings?.redirectOnCompletionUrl || undefined,
        showProgressBar: tallyForm.settings?.showProgressBar,
        allowDrafts: tallyForm.settings?.allowDrafts,
        showQuestionNumbers: tallyForm.settings?.showQuestionNumbers,
        shuffleQuestions: tallyForm.settings?.shuffleQuestions,
        maxSubmissions: tallyForm.settings?.maxSubmissions,
        requireAuth: tallyForm.settings?.requireAuth,
        collectEmail: tallyForm.settings?.collectEmail,
        closeDate: tallyForm.settings?.closeDate,
        openDate: tallyForm.settings?.openDate,
        submissionMessage: tallyForm.settings?.submissionMessage,
        sendConfirmationEmail: tallyForm.settings?.sendConfirmationEmail,
        allowMultipleSubmissions: tallyForm.settings?.allowMultipleSubmissions
      },
      metadata: {
        createdAt: tallyForm.createdAt,
        updatedAt: tallyForm.updatedAt,
        version: 1, // Initial version
        isPublished: tallyForm.isPublished,
        ...(tallyForm.metadata?.tags && { tags: tallyForm.metadata.tags }),
        ...(tallyForm.metadata?.category && { category: tallyForm.metadata.category }),
        ...(tallyForm.metadata?.workspaceId && { workspaceId: tallyForm.metadata.workspaceId })
      }
    };
  }

  /**
   * Map validation rules from API response format to FormConfig format
   */
  private mapValidationRules(validations: any): any {
    if (!validations) return undefined;
    
    if (Array.isArray(validations)) {
      return {
        rules: validations.map((rule: any) => ({
          type: rule.type,
          errorMessage: rule.errorMessage,
          enabled: rule.enabled,
          ...rule // Include all other properties
        }))
      };
    }
    
    return validations;
  }

  /**
   * Map type-specific properties from API field to FormConfig question
   */
  private mapTypeSpecificProperties(field: any): any {
    const config: any = {};

    // Choice-based field properties
    if (field.options) {
      config.options = field.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text || opt.label,
        value: opt.value,
        isDefault: opt.isDefault,
        imageUrl: opt.imageUrl,
        metadata: opt.metadata
      }));
    }
    if (field.allowOther !== undefined) config.allowOther = field.allowOther;
    if (field.randomizeOptions !== undefined) config.randomizeOptions = field.randomizeOptions;
    if (field.layout) config.layout = field.layout;

    // Text field properties
    if (field.minLength !== undefined) config.minLength = field.minLength;
    if (field.maxLength !== undefined) config.maxLength = field.maxLength;
    if (field.format) config.format = field.format;
    if (field.textRows !== undefined) config.rows = field.textRows; // Map back to rows for FormConfig
    if (field.autoResize !== undefined) config.autoResize = field.autoResize;

    // Number field properties
    if (field.min !== undefined) config.min = field.min;
    if (field.max !== undefined) config.max = field.max;
    if (field.step !== undefined) config.step = field.step;
    if (field.decimalPlaces !== undefined) config.decimalPlaces = field.decimalPlaces;
    if (field.useThousandSeparator !== undefined) config.useThousandSeparator = field.useThousandSeparator;
    if (field.numberCurrency) config.currency = field.numberCurrency; // Map back to currency for FormConfig

    // Date/Time field properties
    if (field.minDate) config.minDate = field.minDate;
    if (field.maxDate) config.maxDate = field.maxDate;
    if (field.dateFormat) config.dateFormat = field.dateFormat;
    if (field.includeTime !== undefined) config.includeTime = field.includeTime;
    if (field.defaultDate) config.defaultDate = field.defaultDate;
    if (field.timeFormat) config.format = field.timeFormat; // Time format goes to format field
    if (field.minuteStep !== undefined) config.minuteStep = field.minuteStep;
    if (field.defaultTime) config.defaultTime = field.defaultTime;

    // Rating field properties
    if (field.minRating !== undefined) config.minRating = field.minRating;
    if (field.maxRating !== undefined) config.maxRating = field.maxRating;
    if (field.ratingLabels) config.ratingLabels = field.ratingLabels;
    if (field.ratingStyle) config.style = field.ratingStyle;
    if (field.showNumbers !== undefined) config.showNumbers = field.showNumbers;
    if (field.lowLabel) config.lowLabel = field.lowLabel;
    if (field.highLabel) config.highLabel = field.highLabel;

    // Linear scale properties
    if (field.minValue !== undefined) config.minValue = field.minValue;
    if (field.maxValue !== undefined) config.maxValue = field.maxValue;

    // File upload properties
    if (field.allowedTypes) config.allowedTypes = field.allowedTypes;
    if (field.maxFileSize !== undefined) config.maxFileSize = field.maxFileSize;
    if (field.maxFiles !== undefined) config.maxFiles = field.maxFiles;
    if (field.multiple !== undefined) config.multiple = field.multiple;
    if (field.uploadText) config.uploadText = field.uploadText;
    if (field.enableDragDrop !== undefined) config.enableDragDrop = field.enableDragDrop;
    if (field.dragDropHint) config.dragDropHint = field.dragDropHint;
    if (field.showProgress !== undefined) config.showProgress = field.showProgress;
    if (field.showPreview !== undefined) config.showPreview = field.showPreview;
    if (field.fileRestrictions) config.fileRestrictions = field.fileRestrictions;
    if (field.sizeConstraints) config.sizeConstraints = field.sizeConstraints;

    // Dropdown properties
    if (field.searchable !== undefined) config.searchable = field.searchable;
    if (field.dropdownPlaceholder) config.dropdownPlaceholder = field.dropdownPlaceholder;
    if (field.multiSelect !== undefined) config.multiSelect = field.multiSelect;
    if (field.maxSelections !== undefined) config.maxSelections = field.maxSelections;
    if (field.minSelections !== undefined) config.minSelections = field.minSelections;
    if (field.imageOptions !== undefined) config.imageOptions = field.imageOptions;
    if (field.searchConfig) config.searchConfig = field.searchConfig;

    // Checkbox properties
    if (field.selectionConstraints) config.selectionConstraints = field.selectionConstraints;
    if (field.searchOptions) config.searchOptions = field.searchOptions;

    // Email field properties
    if (field.validateFormat !== undefined) config.validateFormat = field.validateFormat;
    if (field.suggestDomains !== undefined) config.suggestDomains = field.suggestDomains;

    // Phone field properties
    if (field.phoneFormat) config.format = field.phoneFormat;
    if (field.customPattern) config.customPattern = field.customPattern;
    if (field.autoFormat !== undefined) config.autoFormat = field.autoFormat;

    // URL field properties
    if (field.allowedSchemes) config.allowedSchemes = field.allowedSchemes;

    // Signature field properties
    if (field.canvasWidth !== undefined) config.canvasWidth = field.canvasWidth;
    if (field.canvasHeight !== undefined) config.canvasHeight = field.canvasHeight;
    if (field.penColor) config.penColor = field.penColor;
    if (field.backgroundColor) config.backgroundColor = field.backgroundColor;

    // Matrix field properties
    if (field.rows && Array.isArray(field.rows)) config.rows = field.rows; // Matrix rows, not text rows
    if (field.columns) config.columns = field.columns;
    if (field.defaultResponseType) config.defaultResponseType = field.defaultResponseType;
    if (field.allowMultiplePerRow !== undefined) config.allowMultiplePerRow = field.allowMultiplePerRow;
    if (field.requireAllRows !== undefined) config.requireAllRows = field.requireAllRows;
    if (field.randomizeRows !== undefined) config.randomizeRows = field.randomizeRows;
    if (field.randomizeColumns !== undefined) config.randomizeColumns = field.randomizeColumns;
    if (field.mobileLayout) config.mobileLayout = field.mobileLayout;
    if (field.showHeadersOnMobile !== undefined) config.showHeadersOnMobile = field.showHeadersOnMobile;
    if (field.defaultCellValidation) config.defaultCellValidation = field.defaultCellValidation;
    if (field.customClasses) config.customClasses = field.customClasses;

    // Payment field properties
    if (field.amount !== undefined) config.amount = field.amount;
    if (field.currency) config.currency = field.currency; // Payment currency
    if (field.fixedAmount !== undefined) config.fixedAmount = field.fixedAmount;
    if (field.minAmount !== undefined) config.minAmount = field.minAmount;
    if (field.maxAmount !== undefined) config.maxAmount = field.maxAmount;
    if (field.paymentDescription) config.paymentDescription = field.paymentDescription;
    if (field.acceptedMethods) config.acceptedMethods = field.acceptedMethods;

    // Custom properties
    if (field.customProperties) config.customProperties = field.customProperties;
    if (field.metadata) config.metadata = field.metadata;

    return config;
  }

  /**
   * Validate the form configuration
   */
  public validateFormConfig(formConfig: FormConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!formConfig.title) {
      errors.push('Form title is required.');
    }
    if (!formConfig.questions || formConfig.questions.length === 0) {
      errors.push('Form must have at least one question.');
    }
    
    // Check for duplicate field IDs
    const fieldIds = formConfig.questions.map(q => q.id).filter(id => id);
    const duplicateIds = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateIds)];
      errors.push(`Duplicate field IDs found: ${uniqueDuplicates.join(', ')}`);
    }
    
    // Check for empty field labels
    const emptyLabelCount = formConfig.questions.filter(q => !q.label || q.label.trim() === '').length;
    if (emptyLabelCount > 0) {
      errors.push(`${emptyLabelCount} field(s) have empty labels`);
    }
    
    // Check for choice fields without options
    const choiceFieldsWithoutOptions = formConfig.questions.filter(q => 
      this.isChoiceField(q.type) && (!(q as any).options || (q as any).options.length === 0)
    ).length;
    if (choiceFieldsWithoutOptions > 0) {
      errors.push(`${choiceFieldsWithoutOptions} choice field(s) have no options`);
    }
    
    // Add more validation rules as needed...
    const logicErrors = DependencyValidator.validateAllLogic(formConfig);
    errors.push(...logicErrors);

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
