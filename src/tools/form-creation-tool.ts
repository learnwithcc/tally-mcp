import { FormConfig, SubmissionBehavior, FormTheme } from '../models/form-config';
import { Tool } from './tool';
import { NlpService, TallyApiService } from '../services';
import { TallyApiClientConfig } from '../services/TallyApiClient';

export interface FormCreationArgs {
  naturalLanguagePrompt: string;
}

export interface FormCreationResult {
  formUrl: string | undefined;
  formConfig: FormConfig;
}

export class FormCreationTool implements Tool<FormCreationArgs, FormCreationResult> {
  public readonly name = 'form_creation_tool';
  public readonly description = 'Creates a Tally form from a natural language description.';

  private nlpService: NlpService;
  private tallyApiService: TallyApiService;

  constructor(apiClientConfig: TallyApiClientConfig) {
    this.nlpService = new NlpService();
    this.tallyApiService = new TallyApiService(apiClientConfig);
  }

  public async execute(args: FormCreationArgs): Promise<FormCreationResult> {
    console.log(`Executing form creation tool with prompt: ${args.naturalLanguagePrompt}`);

    // 1. Use NlpService to generate a FormConfig from the prompt
    const formConfig = this.nlpService.generateFormConfig(args.naturalLanguagePrompt);

    // 2. Use TallyApiService to create the form
    const createdTallyForm = await this.tallyApiService.createForm(formConfig);

    // 3. Return the URL of the created form and the final config
    return {
      formUrl: createdTallyForm.url,
      formConfig: formConfig, // Or map from createdTallyForm if needed
    };
  }
} 