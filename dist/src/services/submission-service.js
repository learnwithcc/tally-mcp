import { TallyApiClient } from './TallyApiClient';
import { TallySubmissionsResponseSchema, } from '../models/tally-schemas';
export class SubmissionService {
    constructor(config = {}) {
        this.apiClient = new TallyApiClient(config);
    }
    async getFormSubmissions(formId, options = {}) {
        const endpoint = `/forms/${formId}/submissions`;
        const params = {
            page: options.page,
            limit: options.limit,
            filter: options.status,
            startDate: options.startDate,
            endDate: options.endDate,
            afterId: options.afterId,
        };
        return this.apiClient.requestWithValidation('GET', endpoint, TallySubmissionsResponseSchema, undefined, params);
    }
}
//# sourceMappingURL=submission-service.js.map