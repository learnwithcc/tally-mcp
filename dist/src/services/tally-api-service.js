import { TallyApiClient } from './TallyApiClient';
import { SubmissionBehavior } from '../models';
import { TallyFormSchema, TallyFormCreatePayloadSchema, TallyFormUpdatePayloadSchema } from '../models/tally-schemas';
import { buildBlocksForForm } from '../utils/block-builder';
export class TallyApiService {
    constructor(config) {
        this.apiClient = new TallyApiClient(config);
    }
    async createForm(formConfig) {
        const endpoint = '/forms';
        const payload = this.mapToTallyPayload(formConfig);
        const validatedPayload = TallyFormCreatePayloadSchema.parse(payload);
        return this.apiClient.requestWithValidation('POST', endpoint, TallyFormSchema, validatedPayload);
    }
    async getForm(formId) {
        return this.apiClient.getForm(formId);
    }
    async getForms(options = {}) {
        return this.apiClient.getForms(options);
    }
    async updateForm(formId, formConfig) {
        const endpoint = `/forms/${formId}`;
        const payload = this.mapToTallyUpdatePayload(formConfig);
        const validatedPayload = TallyFormUpdatePayloadSchema.parse(payload);
        return this.apiClient.requestWithValidation('PUT', endpoint, TallyFormSchema, validatedPayload);
    }
    async patchForm(formId, updates) {
        const endpoint = `/forms/${formId}`;
        return this.apiClient.requestWithValidation('PATCH', endpoint, TallyFormSchema, updates);
    }
    mapToTallyPayload(formConfig) {
        const blocks = buildBlocksForForm(formConfig);
        return {
            status: 'PUBLISHED',
            name: formConfig.title,
            blocks,
        };
    }
    mapToTallyUpdatePayload(formConfig) {
        const payload = {};
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