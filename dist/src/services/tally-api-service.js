import { TallyApiClient } from './TallyApiClient';
import { SubmissionBehavior } from '../models';
import { TallyFormSchema } from '../models/tally-schemas';
export class TallyApiService {
    constructor(config) {
        this.apiClient = new TallyApiClient(config);
    }
    async createForm(formConfig) {
        const endpoint = '/v1/forms';
        const payload = this.mapToTallyPayload(formConfig);
        return this.apiClient.requestWithValidation('POST', endpoint, TallyFormSchema, payload);
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
        return this.apiClient.requestWithValidation('PUT', endpoint, TallyFormSchema, payload);
    }
    async patchForm(formId, updates) {
        const endpoint = `/v1/forms/${formId}`;
        return this.apiClient.requestWithValidation('PATCH', endpoint, TallyFormSchema, updates);
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
                redirectOnCompletion: formConfig.settings.submissionBehavior === SubmissionBehavior.REDIRECT,
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
//# sourceMappingURL=tally-api-service.js.map