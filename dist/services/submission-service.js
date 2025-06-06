"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionService = void 0;
const TallyApiClient_1 = require("./TallyApiClient");
const tally_schemas_1 = require("../models/tally-schemas");
class SubmissionService {
    constructor(config = {}) {
        this.apiClient = new TallyApiClient_1.TallyApiClient(config);
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
        return this.apiClient.requestWithValidation('GET', endpoint, tally_schemas_1.TallySubmissionsResponseSchema, undefined, params);
    }
}
exports.SubmissionService = SubmissionService;
//# sourceMappingURL=submission-service.js.map