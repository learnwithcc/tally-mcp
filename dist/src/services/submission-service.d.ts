import { TallyApiClientConfig } from './TallyApiClient';
import { SubmissionFilters, TallySubmissionsResponse } from '../models/tally-schemas';
export declare class SubmissionService {
    private apiClient;
    constructor(config?: TallyApiClientConfig);
    getFormSubmissions(formId: string, options?: SubmissionFilters & {
        page?: number;
        limit?: number;
    }): Promise<TallySubmissionsResponse>;
}
//# sourceMappingURL=submission-service.d.ts.map