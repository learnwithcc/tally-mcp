import { TallyApiClient, TallyApiClientConfig } from './TallyApiClient';
import {
  SubmissionFilters,
  TallySubmissionsResponse,
  TallySubmissionsResponseSchema,
} from '../models/tally-schemas';

export class SubmissionService {
  private apiClient: TallyApiClient;

  constructor(config: TallyApiClientConfig = {}) {
    this.apiClient = new TallyApiClient(config);
  }

  /**
   * Retrieves submissions for a specific form from Tally.
   * @param formId The ID of the form to retrieve submissions for.
   * @param options Options for filtering and pagination.
   * @returns The submissions response from Tally.
   */
  public async getFormSubmissions(
    formId: string,
    options: SubmissionFilters & { page?: number; limit?: number } = {}
  ): Promise<TallySubmissionsResponse> {
    const endpoint = `/forms/${formId}/submissions`;

    const params: Record<string, any> = {
        page: options.page,
        limit: options.limit,
        filter: options.status,
        startDate: options.startDate,
        endDate: options.endDate,
        afterId: options.afterId,
    };

    return this.apiClient.requestWithValidation(
        'GET',
        endpoint,
        TallySubmissionsResponseSchema,
        undefined,
        params,
    );
  }
} 