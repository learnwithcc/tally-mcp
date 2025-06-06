import { TallyApiClient, TallyApiClientConfig } from './TallyApiClient';
import { FormConfig } from '../models';
import { TallyForm, TallyFormSchema } from '../models/tally-schemas';

export class TallyApiService {
  private apiClient: TallyApiClient;

  constructor(config: TallyApiClientConfig) {
    this.apiClient = new TallyApiClient(config);
  }

  /**
   * Creates a new form in Tally.
   * @param formConfig The configuration of the form to create.
   * @returns The created Tally form.
   */
  public async createForm(formConfig: FormConfig): Promise<TallyForm> {
    // The Tally API endpoint for creating forms will be defined later.
    // This is a placeholder for the actual API call.
    const endpoint = '/v1/forms';

    // The Tally API expects a certain payload structure.
    // We need to map our FormConfig to that structure.
    // This mapping will be implemented in a future task.
    const payload = this.mapToTallyPayload(formConfig);

    return this.apiClient.requestWithValidation('POST', endpoint, TallyFormSchema, payload);
  }

  /**
   * Maps our internal FormConfig to the payload expected by the Tally API.
   * This is a placeholder and will be implemented in detail later.
   * @param formConfig The internal form configuration.
   * @returns The payload for the Tally API.
   */
  private mapToTallyPayload(formConfig: FormConfig): any {
    // This is where the mapping logic will go.
    // For now, we'll return a simplified object.
    return {
      name: formConfig.title,
      fields: formConfig.questions.map(q => ({
        type: q.type,
        title: q.label,
      })),
    };
  }
} 