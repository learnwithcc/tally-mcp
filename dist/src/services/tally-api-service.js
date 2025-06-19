import { TallyApiClient } from './TallyApiClient';
import { TallyFormSchema, TallyFormCreatePayloadSchema } from '../models/tally-schemas';
import { buildBlocksForForm } from '../utils/block-builder';
import { TallyFormUpdatePayloadSchema } from '../models/tally-schemas';
import { SubmissionBehavior } from '../models';
export class TallyApiService {
    constructor(config) {
        this.apiClient = new TallyApiClient(config);
    }
    async createForm(formConfig) {
        const endpoint = '/forms';
        const payload = this.mapFormConfigToPayload(formConfig);
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
    mapFormConfigToPayload(formConfig) {
        const blocks = buildBlocksForForm(formConfig);
        const payload = {
            status: 'PUBLISHED',
            name: formConfig.title,
            blocks: blocks,
        };
        if (process.env.DEBUG_TALLY_PAYLOAD === '1') {
            console.log('[TallyApiService] createForm payload:', JSON.stringify(payload, null, 2));
        }
        return payload;
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