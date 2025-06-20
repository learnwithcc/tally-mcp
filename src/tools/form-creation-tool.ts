import { Tool } from './tool';
import { NlpService, TallyApiService, TemplateService } from '../services';
import { FormConfig } from '../models/form-config';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { EnrichedFieldConfiguration } from '../types';
import { buildBlocksForFormWithMapping, generateEnrichedFieldConfigurations } from '../utils';

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

    // Generate enriched field configurations using enhanced BlockBuilder
    const blockResult = buildBlocksForFormWithMapping(formConfig);
    const enrichedFieldConfigurations = generateEnrichedFieldConfigurations(formConfig, blockResult.fieldBlockMapping);

    return {
      formUrl,
      formId: createdTallyForm.id,
      formConfig,
      generatedFieldIds: blockResult.fieldIds,
      enrichedFieldConfigurations,
    };
  }
} 