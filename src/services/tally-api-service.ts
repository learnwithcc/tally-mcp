import { TallyApiClient, TallyApiClientConfig } from './TallyApiClient';
import { FormConfig, SubmissionBehavior } from '../models';
import { 
  TallyForm, 
  TallyFormSchema, 
  TallyFormsResponse,
  TallyFormCreatePayloadSchema,
  TallyFormUpdatePayloadSchema,
  validateTallyResponse
} from '../models/tally-schemas';
import { buildBlocksForForm } from '../utils/block-builder';

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
    // The Tally API endpoint for creating forms
    const endpoint = '/forms';

    // Map our FormConfig to the payload expected by the Tally API
    const payload = this.mapToTallyPayload(formConfig);

    // Validate the payload before sending to ensure it meets Tally API requirements
    const validatedPayload = TallyFormCreatePayloadSchema.parse(payload);

    return this.apiClient.requestWithValidation('POST', endpoint, TallyFormSchema, validatedPayload);
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
    const endpoint = `/forms/${formId}`;
    
    // Map the FormConfig to the payload expected by the Tally API
    const payload = this.mapToTallyUpdatePayload(formConfig);

    // Validate the payload before sending to ensure it meets Tally API requirements
    const validatedPayload = TallyFormUpdatePayloadSchema.parse(payload);

    return this.apiClient.requestWithValidation('PUT', endpoint, TallyFormSchema, validatedPayload);
  }

  /**
   * Partially updates an existing form in Tally.
   * @param formId The ID of the form to update.
   * @param updates Partial updates to apply to the form.
   * @returns The updated Tally form.
   */
  public async patchForm(formId: string, updates: Record<string, any>): Promise<TallyForm> {
    const endpoint = `/forms/${formId}`;
    
    return this.apiClient.requestWithValidation('PATCH', endpoint, TallyFormSchema, updates);
  }

  /**
   * Maps our internal FormConfig to the payload expected by the Tally API.
   * This is a placeholder and will be implemented in detail later.
   * @param formConfig The internal form configuration.
   * @returns The payload for the Tally API.
   */
  private mapToTallyPayload(formConfig: FormConfig): any {
    // Build Tally-compatible blocks using our utility
    const blocks = buildBlocksForForm(formConfig);

    return {
      status: 'PUBLISHED',
      name: formConfig.title,
      blocks,
    };
  }

  /**
   * Maps partial FormConfig updates to the payload expected by the Tally API for updates.
   * @param formConfig The partial form configuration updates.
   * @returns The update payload for the Tally API.
   */
  private mapToTallyUpdatePayload(formConfig: Partial<FormConfig>): any {
    const payload: any = {};

    if (formConfig.title !== undefined) {
      payload.name = formConfig.title;
    }

    if (formConfig.description !== undefined) {
      payload.description = formConfig.description;
    }
    
    if (formConfig.settings) {
      payload.settings = {
        redirectOnCompletion: formConfig.settings.submissionBehavior === SubmissionBehavior.REDIRECT,
        redirectOnCompletionUrl: formConfig.settings.redirectUrl,
      };
    }

    if (formConfig.questions) {
      payload.questions = formConfig.questions.map(q => {
        const questionPayload: any = {
          id: q.id,
          type: q.type,
          title: q.label,
          description: q.description,
          validations: [],
        };

        if (q.required) {
          questionPayload.validations.push({ type: 'required' });
        }

        const settings: any = {};
        if (q.placeholder) settings.placeholder = q.placeholder;
        // Add other question-specific settings from our model to Tally's expected format
        if ((q as any).minLength) settings.minLength = (q as any).minLength;
        if ((q as any).maxLength) settings.maxLength = (q as any).maxLength;
        if ((q as any).format) settings.format = (q as any).format;

        // Add options for choice-based questions
        if ('options' in q && q.options) {
          settings.options = q.options.map(opt => ({
            id: opt.id,
            text: opt.text,
          }));
        }
        
        questionPayload.settings = settings;
        return questionPayload;
      });
    }

    return payload;
  }
} 