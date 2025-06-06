"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TallyApiService = void 0;
const TallyApiClient_1 = require("./TallyApiClient");
const models_1 = require("../models");
const tally_schemas_1 = require("../models/tally-schemas");
class TallyApiService {
    constructor(config) {
        this.apiClient = new TallyApiClient_1.TallyApiClient(config);
    }
    async createForm(formConfig) {
        const endpoint = '/v1/forms';
        const payload = this.mapToTallyPayload(formConfig);
        return this.apiClient.requestWithValidation('POST', endpoint, tally_schemas_1.TallyFormSchema, payload);
    }
    async getForm(formId) {
        return this.apiClient.getForm(formId);
    }
    async getForms(options = {}) {
        return this.apiClient.getForms(options);
    }
    async updateForm(formId, formConfig) {
        const endpoint = `/v1/forms/${formId}`;
        const payload = this.mapToTallyUpdatePayload(formConfig);
        return this.apiClient.requestWithValidation('PUT', endpoint, tally_schemas_1.TallyFormSchema, payload);
    }
    async patchForm(formId, updates) {
        const endpoint = `/v1/forms/${formId}`;
        return this.apiClient.requestWithValidation('PATCH', endpoint, tally_schemas_1.TallyFormSchema, updates);
    }
    mapToTallyPayload(formConfig) {
        return {
            name: formConfig.title,
            fields: formConfig.questions.map(q => ({
                type: q.type,
                title: q.label,
            })),
        };
    }
    mapToTallyUpdatePayload(formConfig) {
        const payload = {};
        if (formConfig.title) {
            payload.title = formConfig.title;
        }
        if (formConfig.description !== undefined) {
            payload.description = formConfig.description;
        }
        if (formConfig.settings) {
            payload.settings = {
                redirectOnCompletion: formConfig.settings.submissionBehavior === models_1.SubmissionBehavior.REDIRECT,
                redirectOnCompletionUrl: formConfig.settings.redirectUrl,
            };
        }
        if (formConfig.questions) {
            payload.questions = formConfig.questions.map(q => {
                const questionPayload = {
                    id: q.id,
                    type: q.type,
                    title: q.label,
                    description: q.description,
                    validations: [],
                };
                if (q.required) {
                    questionPayload.validations.push({ type: 'required' });
                }
                const settings = {};
                if (q.placeholder)
                    settings.placeholder = q.placeholder;
                if (q.minLength)
                    settings.minLength = q.minLength;
                if (q.maxLength)
                    settings.maxLength = q.maxLength;
                if (q.format)
                    settings.format = q.format;
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
exports.TallyApiService = TallyApiService;
//# sourceMappingURL=tally-api-service.js.map