import { TallyApiClient, TallyApiClientConfig } from './TallyApiClient';
import { FormConfig } from '../models';
import { TallyForm, TallyFormSchema, TallyFormsResponse } from '../models/tally-schemas';

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
   * Retrieves a specific form by its ID from Tally.
   * @param formId The ID of the form to retrieve.
   * @returns The Tally form data.
   */
  public async getForm(formId: string): Promise<TallyForm> {
    return this.apiClient.getForm(formId);
  }

  /**
   * Retrieves a list of forms from Tally.
   * @param options Options for filtering and pagination.
   * @returns The list of forms response.
   */
  public async getForms(options: {
    page?: number;
    limit?: number;
    workspaceId?: string;
  } = {}): Promise<TallyFormsResponse> {
    return this.apiClient.getForms(options);
  }

  /**
   * Updates an existing form in Tally.
   * @param formId The ID of the form to update.
   * @param formConfig The updated configuration of the form.
   * @returns The updated Tally form.
   */
  public async updateForm(formId: string, formConfig: Partial<FormConfig>): Promise<TallyForm> {
    const endpoint = `/v1/forms/${formId}`;
    
    // Map the FormConfig to the payload expected by the Tally API
    const payload = this.mapToTallyUpdatePayload(formConfig);

    return this.apiClient.requestWithValidation('PUT', endpoint, TallyFormSchema, payload);
  }

  /**
   * Partially updates an existing form in Tally.
   * @param formId The ID of the form to update.
   * @param updates Partial updates to apply to the form.
   * @returns The updated Tally form.
   */
  public async patchForm(formId: string, updates: Record<string, any>): Promise<TallyForm> {
    const endpoint = `/v1/forms/${formId}`;
    
    return this.apiClient.requestWithValidation('PATCH', endpoint, TallyFormSchema, updates);
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

  /**
   * Maps partial FormConfig updates to the payload expected by the Tally API for updates.
   * @param formConfig The partial form configuration updates.
   * @returns The update payload for the Tally API.
   */
  private mapToTallyUpdatePayload(formConfig: Partial<FormConfig>): any {
    const payload: any = {};

    if (formConfig.title) {
      payload.name = formConfig.title;
    }

    if (formConfig.description) {
      payload.description = formConfig.description;
    }

    if (formConfig.questions) {
      payload.fields = formConfig.questions.map(q => {
        const field: any = {
          type: q.type,
          title: q.label,
          required: q.required,
          description: q.description,
        };

        // Add options only for question types that support them
        if ('options' in q && q.options) {
          field.options = q.options.map(opt => ({ 
            label: opt.text, 
            value: opt.value || opt.text 
          }));
        }

        return field;
      });
    }

    return payload;
  }
} 