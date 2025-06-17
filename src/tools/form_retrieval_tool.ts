import { Tool } from './tool';
import { TallyApiService } from '../services';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { TallyFormsResponse } from '../models/tally-schemas';

export interface FormRetrievalArgs {
  page?: number;
  limit?: number;
  workspaceId?: string;
}

export class FormRetrievalTool implements Tool<FormRetrievalArgs, TallyFormsResponse> {
  public readonly name = 'list_forms';
  public readonly description = 'Lists Tally forms.';

  private tallyApiService: TallyApiService;

  constructor(apiClientConfig: TallyApiClientConfig) {
    this.tallyApiService = new TallyApiService(apiClientConfig);
  }

  public async execute(args: FormRetrievalArgs): Promise<TallyFormsResponse> {
    console.log(`Executing form retrieval tool with args: ${JSON.stringify(args)}`);
    return this.tallyApiService.getForms(args);
  }
} 