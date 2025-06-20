import { Tool } from './tool';
import { NlpService, TallyApiService, TemplateService } from '../services';
import { FormConfig } from '../models/form-config';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { EnrichedFieldConfiguration } from '../types';

export interface FormCreationArgs {
  /**
   * Provide a fully-formed FormConfig to be sent directly to the Tally API.
   * When this is set the tool **skips** NLP and template generation logic.
   */
  formConfig?: FormConfig;

  /**
   * Natural-language prompt that will be converted to a FormConfig via the NLP service.
   * Ignored if `formConfig` is supplied.
   */
  naturalLanguagePrompt?: string;

  /**
   * ID of a saved template to instantiate. Ignored if `formConfig` is supplied.
   */
  templateId?: string;

  /**
   * Optional explicit title to set / override on the resulting FormConfig.
   */
  formTitle?: string;
}

export interface FormCreationResult {
  formUrl: string | undefined;
  formId: string;
  formConfig: FormConfig;
  
  /**
   * Array of generated field IDs created during form creation
   * Maps to the questions in formConfig by array index
   */
  generatedFieldIds?: string[];
  
  /**
   * Detailed field configuration objects with enriched properties
   * including validation rules, options, and type-specific settings
   */
  enrichedFieldConfigurations?: EnrichedFieldConfiguration[];
}

export class FormCreationTool implements Tool<FormCreationArgs, FormCreationResult> {
  public readonly name = 'form_creation_tool';
  public readonly description = 'Creates a Tally form from a natural language description or a template.';

  private nlpService: NlpService;
  private tallyApiService: TallyApiService;
  private templateService: TemplateService;

  constructor(apiClientConfig: TallyApiClientConfig) {
    this.nlpService = new NlpService();
    this.tallyApiService = new TallyApiService(apiClientConfig);
    this.templateService = new TemplateService();
  }

  public async execute(args: FormCreationArgs): Promise<FormCreationResult> {
    console.log(`Executing form creation tool with args: ${JSON.stringify(args)}`);

    let formConfig: FormConfig | undefined;

    // 1. Highest priority: direct FormConfig
    if (args.formConfig) {
      formConfig = { ...args.formConfig };
      if (args.formTitle) {
        formConfig.title = args.formTitle;
      }
    }

    // 2. Template instantiation (if no direct config)
    if (!formConfig && args.templateId) {
      formConfig = this.templateService.instantiateTemplate(args.templateId, args.formTitle);
      if (!formConfig) {
        throw new Error(`Template with ID '${args.templateId}' not found.`);
      }
    }

    // 3. Natural-language prompt (if neither of the above)
    if (!formConfig && args.naturalLanguagePrompt) {
      formConfig = this.nlpService.generateFormConfig(args.naturalLanguagePrompt);
      if (args.formTitle) {
        formConfig.title = args.formTitle;
      }
    }

    if (!formConfig) {
      throw new Error('One of formConfig, naturalLanguagePrompt, or templateId must be provided.');
    }

    let createdTallyForm;
    try {
      createdTallyForm = await this.tallyApiService.createForm(formConfig);
    } catch (err: any) {
      console.error('[FormCreationTool] createForm error', err?.response?.data || err?.message || err);
      throw err;
    }

    console.log('[FormCreationTool] Created form response:', JSON.stringify(createdTallyForm, null, 2));

    // Try to capture any possible share link fields
    let formUrl: string | undefined =
      (createdTallyForm as any).url ||
      (createdTallyForm as any).shareUrl ||
      (createdTallyForm as any).share_url ||
      (createdTallyForm as any).publicUrl;

    if (!formUrl && createdTallyForm.id) {
      formUrl = `https://tally.so/forms/${createdTallyForm.id}/edit`;
    }

    // Generate enriched field configurations and field IDs
    const generatedFieldIds = this.extractFieldIds(formConfig);
    const enrichedFieldConfigurations = this.generateEnrichedFieldConfigurations(formConfig, generatedFieldIds);

    return {
      formUrl,
      formId: createdTallyForm.id,
      formConfig,
      generatedFieldIds,
      enrichedFieldConfigurations,
    };
  }

  /**
   * Extract field IDs from the form configuration
   */
  private extractFieldIds(formConfig: FormConfig): string[] {
    if (!formConfig.questions) {
      return [];
    }
    
    return formConfig.questions.map(question => question.id || '').filter(id => id.length > 0);
  }

  /**
   * Generate enriched field configurations from form config
   */
  private generateEnrichedFieldConfigurations(formConfig: FormConfig, fieldIds: string[]): EnrichedFieldConfiguration[] {
    if (!formConfig.questions) {
      return [];
    }

    return formConfig.questions.map((question, index) => {
      const fieldId = fieldIds[index] || question.id || '';
      
      // Create base configuration
      const enrichedConfig: EnrichedFieldConfiguration = {
        id: fieldId,
        type: question.type,
        label: question.label,
        description: question.description,
        required: question.required || false,
        placeholder: question.placeholder,
        order: index + 1,
        metadata: {
          originalIndex: index,
          createdAt: new Date().toISOString(),
          version: formConfig.metadata?.version || 1
        }
      };

      // Add validation rules if present
      if (question.validation) {
        enrichedConfig.validationRules = {
          rules: Array.isArray(question.validation.rules) 
            ? question.validation.rules.map(rule => ({
                ...rule,
                errorMessage: rule.errorMessage,
                enabled: rule.enabled !== false
              }))
            : []
        };
      }

      // Add options for choice-based questions
      if ('options' in question && question.options) {
        enrichedConfig.options = question.options.map((option: any, optIndex: number) => ({
          id: option.id || `${fieldId}_option_${optIndex}`,
          label: option.label,
          value: option.value || option.label
        }));
      }

      // Add conditional logic if present
      if ('conditionalLogic' in question && question.conditionalLogic) {
        const logic = question.conditionalLogic as any;
        enrichedConfig.conditionalLogic = {
          showIf: logic.showIf,
          hideIf: logic.hideIf,
          requireIf: logic.requireIf
        };
      }

      // Add type-specific properties
      const typeSpecific = this.extractTypeSpecificProperties(question as any);
      if (typeSpecific) {
        enrichedConfig.typeSpecificProperties = typeSpecific;
      }

      return enrichedConfig;
    });
  }

  /**
   * Extract type-specific properties from a question configuration
   */
  private extractTypeSpecificProperties(question: any): { [key: string]: any } | undefined {
    const typeSpecific: { [key: string]: any } = {};
    
    // Extract type-specific properties based on question type
    switch (question.type) {
      case 'number':
        if (question.min !== undefined) typeSpecific.min = question.min;
        if (question.max !== undefined) typeSpecific.max = question.max;
        if (question.step !== undefined) typeSpecific.step = question.step;
        if (question.numberCurrency !== undefined) typeSpecific.currency = question.numberCurrency;
        break;
      case 'text':
      case 'textarea':
        if (question.minLength !== undefined) typeSpecific.minLength = question.minLength;
        if (question.maxLength !== undefined) typeSpecific.maxLength = question.maxLength;
        if (question.textRows !== undefined) typeSpecific.rows = question.textRows;
        break;
      case 'rating':
        if (question.ratingMax !== undefined) typeSpecific.maxRating = question.ratingMax;
        if (question.ratingStyle !== undefined) typeSpecific.style = question.ratingStyle;
        break;
      case 'date':
        if (question.dateFormat !== undefined) typeSpecific.format = question.dateFormat;
        if (question.minDate !== undefined) typeSpecific.minDate = question.minDate;
        if (question.maxDate !== undefined) typeSpecific.maxDate = question.maxDate;
        break;
      case 'time':
        if (question.timeFormat !== undefined) typeSpecific.format = question.timeFormat;
        break;
      case 'file':
        if (question.fileTypes !== undefined) typeSpecific.allowedTypes = question.fileTypes;
        if (question.maxFileSize !== undefined) typeSpecific.maxSize = question.maxFileSize;
        if (question.maxFiles !== undefined) typeSpecific.maxFiles = question.maxFiles;
        break;
      case 'matrix':
        if (question.matrixRows !== undefined) typeSpecific.rows = question.matrixRows;
        if (question.matrixColumns !== undefined) typeSpecific.columns = question.matrixColumns;
        if (question.matrixResponseType !== undefined) typeSpecific.responseType = question.matrixResponseType;
        break;
      case 'payment':
        if (question.paymentMethods !== undefined) typeSpecific.methods = question.paymentMethods;
        if (question.paymentAmount !== undefined) typeSpecific.amount = question.paymentAmount;
        if (question.paymentCurrency !== undefined) typeSpecific.currency = question.paymentCurrency;
        break;
    }
    
    return Object.keys(typeSpecific).length > 0 ? typeSpecific : undefined;
  }
} 