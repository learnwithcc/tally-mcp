import { FormConfig } from '../models/form-config';
import { Tool } from './tool';
import { NlpService, TallyApiService, TemplateService } from '../services';
import { TallyApiClientConfig } from '../services/TallyApiClient';

export interface FormCreationArgs {
  naturalLanguagePrompt?: string;
  templateId?: string;
  formTitle?: string;
}

export interface FormCreationResult {
  formUrl: string | undefined;
  formConfig: FormConfig;
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

    if (args.templateId) {
      formConfig = this.templateService.instantiateTemplate(args.templateId, args.formTitle);
      if (!formConfig) {
        throw new Error(`Template with ID '${args.templateId}' not found.`);
      }
    } else if (args.naturalLanguagePrompt) {
      formConfig = this.nlpService.generateFormConfig(args.naturalLanguagePrompt);
      if (args.formTitle) {
        formConfig.title = args.formTitle;
      }
    } else {
      throw new Error('Either naturalLanguagePrompt or templateId must be provided.');
    }

    const createdTallyForm = await this.tallyApiService.createForm(formConfig);

    return {
      formUrl: createdTallyForm.url,
      formConfig,
    };
  }
} 