"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkOperationInputSchema = exports.GetFormAnalyticsInputSchema = exports.GenerateShareLinkInputSchema = exports.GenerateEmbedCodeInputSchema = exports.UpdatePublicationSettingsInputSchema = exports.PublishFormInputSchema = exports.FormSharingTool = void 0;
const zod_1 = require("zod");
const form_publication_service_1 = require("../services/form-publication-service");
const form_sharing_models_1 = require("../models/form-sharing-models");
const PublishFormInputSchema = zod_1.z.object({
    formId: zod_1.z.string().describe('The ID of the form to publish'),
    visibility: zod_1.z.nativeEnum(form_sharing_models_1.FormVisibility).optional().describe('Form visibility setting'),
    password: zod_1.z.string().optional().describe('Password for password-protected forms'),
    publishDate: zod_1.z.string().datetime().optional().describe('Scheduled publish date'),
    unpublishDate: zod_1.z.string().datetime().optional().describe('Scheduled unpublish date'),
    notificationEmails: zod_1.z.array(zod_1.z.string().email()).optional().describe('Email addresses to notify on submission')
});
exports.PublishFormInputSchema = PublishFormInputSchema;
const UpdatePublicationSettingsInputSchema = zod_1.z.object({
    formId: zod_1.z.string().describe('The ID of the form to update'),
    settings: form_sharing_models_1.FormPublicationSettingsSchema.partial().describe('Publication settings to update')
});
exports.UpdatePublicationSettingsInputSchema = UpdatePublicationSettingsInputSchema;
const GenerateEmbedCodeInputSchema = zod_1.z.object({
    formId: zod_1.z.string().describe('The ID of the form to generate embed code for'),
    theme: zod_1.z.nativeEnum(form_sharing_models_1.EmbedTheme).optional().describe('Theme for the embedded form'),
    autoHeight: zod_1.z.boolean().optional().describe('Whether to auto-adjust height'),
    width: zod_1.z.string().optional().describe('Width of the embedded form'),
    height: zod_1.z.string().optional().describe('Height of the embedded form'),
    hideHeader: zod_1.z.boolean().optional().describe('Whether to hide the form header'),
    hideFooter: zod_1.z.boolean().optional().describe('Whether to hide the form footer'),
    backgroundColor: zod_1.z.string().optional().describe('Background color for the embed'),
    borderRadius: zod_1.z.number().optional().describe('Border radius in pixels'),
    customCss: zod_1.z.string().optional().describe('Custom CSS to apply')
});
exports.GenerateEmbedCodeInputSchema = GenerateEmbedCodeInputSchema;
const GenerateShareLinkInputSchema = zod_1.z.object({
    formId: zod_1.z.string().describe('The ID of the form to create a share link for'),
    type: zod_1.z.nativeEnum(form_sharing_models_1.ShareLinkType).describe('Type of share link to generate'),
    customSlug: zod_1.z.string().optional().describe('Custom slug for the share link'),
    password: zod_1.z.string().optional().describe('Password protection for the link'),
    expirationHours: zod_1.z.number().positive().optional().describe('Hours until the link expires'),
    maxUses: zod_1.z.number().positive().optional().describe('Maximum number of uses for the link'),
    trackingEnabled: zod_1.z.boolean().optional().describe('Whether to enable tracking for this link')
});
exports.GenerateShareLinkInputSchema = GenerateShareLinkInputSchema;
const GetFormAnalyticsInputSchema = zod_1.z.object({
    formId: zod_1.z.string().describe('The ID of the form to get analytics for'),
    period: zod_1.z.enum(['day', 'week', 'month', 'year']).optional().describe('Time period for analytics data')
});
exports.GetFormAnalyticsInputSchema = GetFormAnalyticsInputSchema;
const BulkOperationInputSchema = zod_1.z.object({
    operationType: zod_1.z.enum(['publish', 'unpublish', 'update_settings', 'generate_links']).describe('Type of bulk operation'),
    formIds: zod_1.z.array(zod_1.z.string()).min(1).describe('Array of form IDs to operate on'),
    settings: zod_1.z.record(zod_1.z.any()).optional().describe('Settings to apply (for update_settings operation)')
});
exports.BulkOperationInputSchema = BulkOperationInputSchema;
class FormSharingTool {
    constructor(apiClient) {
        this.publicationService = new form_publication_service_1.FormPublicationService(apiClient);
    }
    async publishForm(input) {
        try {
            const { formId, visibility, password, publishDate, unpublishDate, notificationEmails } = PublishFormInputSchema.parse(input);
            const options = {};
            if (password !== undefined)
                options.password = password;
            if (publishDate !== undefined)
                options.publishDate = publishDate;
            if (unpublishDate !== undefined)
                options.unpublishDate = unpublishDate;
            if (notificationEmails !== undefined)
                options.notificationEmails = notificationEmails;
            const result = await this.publicationService.publishForm(formId, visibility, options);
            return {
                success: true,
                data: result,
                message: `Form ${formId} published successfully with ${result.visibility} visibility`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to publish form'
            };
        }
    }
    async unpublishForm(input) {
        try {
            const result = await this.publicationService.unpublishForm(input.formId);
            return {
                success: true,
                data: result,
                message: `Form ${input.formId} unpublished successfully`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to unpublish form'
            };
        }
    }
    async getPublicationSettings(input) {
        try {
            const result = await this.publicationService.getPublicationSettings(input.formId);
            return {
                success: true,
                data: result,
                message: `Retrieved publication settings for form ${input.formId}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to get publication settings'
            };
        }
    }
    async updatePublicationSettings(input) {
        try {
            const { formId, settings } = UpdatePublicationSettingsInputSchema.parse(input);
            const filteredSettings = Object.fromEntries(Object.entries(settings).filter(([_, value]) => value !== undefined));
            const result = await this.publicationService.updatePublicationSettings(formId, filteredSettings);
            return {
                success: true,
                data: result,
                message: `Updated publication settings for form ${formId}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to update publication settings'
            };
        }
    }
    async generateEmbedCode(input) {
        try {
            const { formId, ...embedSettings } = GenerateEmbedCodeInputSchema.parse(input);
            const filteredEmbedSettings = Object.fromEntries(Object.entries(embedSettings).filter(([_, value]) => value !== undefined));
            const result = await this.publicationService.generateEmbedCode(formId, filteredEmbedSettings);
            return {
                success: true,
                data: result,
                message: `Generated embed code for form ${formId}`,
                embedCode: {
                    html: result.html,
                    javascript: result.javascript,
                    iframe: result.iframe
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to generate embed code'
            };
        }
    }
    async generateShareLink(input) {
        try {
            const { formId, ...options } = GenerateShareLinkInputSchema.parse(input);
            const result = await this.publicationService.generateShareLink(formId, options);
            return {
                success: true,
                data: result,
                message: `Generated ${result.type} share link for form ${formId}`,
                shareUrl: result.url
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to generate share link'
            };
        }
    }
    async getShareLinks(input) {
        try {
            const result = await this.publicationService.getShareLinks(input.formId);
            return {
                success: true,
                data: result,
                message: `Retrieved ${result.length} share links for form ${input.formId}`,
                count: result.length
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to get share links'
            };
        }
    }
    async deactivateShareLink(input) {
        try {
            const result = await this.publicationService.deactivateShareLink(input.linkId);
            return {
                success: true,
                data: result,
                message: `Deactivated share link ${input.linkId}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to deactivate share link'
            };
        }
    }
    async getFormSharingStats(input) {
        try {
            const result = await this.publicationService.getFormSharingStats(input.formId);
            return {
                success: true,
                data: result,
                message: `Retrieved sharing statistics for form ${input.formId}`,
                summary: {
                    totalViews: result.totalViews,
                    totalSubmissions: result.totalSubmissions,
                    conversionRate: result.conversionRate
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to get sharing statistics'
            };
        }
    }
    async getFormAnalytics(input) {
        try {
            const { formId, period = 'week' } = GetFormAnalyticsInputSchema.parse(input);
            const result = await this.publicationService.getFormAnalytics(formId, period);
            return {
                success: true,
                data: result,
                message: `Retrieved ${period} analytics for form ${formId}`,
                period,
                dataPoints: result.metrics.dates.length
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to get form analytics'
            };
        }
    }
    async performBulkOperation(input) {
        try {
            const { operationType, formIds, settings } = BulkOperationInputSchema.parse(input);
            const operation = {
                operationType,
                formIds,
                settings,
                status: 'pending',
                completedCount: 0,
                failedCount: 0,
                errors: [],
                createdAt: new Date().toISOString()
            };
            const result = await this.publicationService.performBulkOperation(operation);
            return {
                success: true,
                data: result,
                message: `Bulk ${operationType} operation completed`,
                summary: {
                    total: formIds.length,
                    completed: result.completedCount,
                    failed: result.failedCount,
                    status: result.status
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to perform bulk operation'
            };
        }
    }
    async validateFormForPublication(input) {
        try {
            const result = await this.publicationService.validateFormForPublication(input.formId);
            return {
                success: true,
                data: result,
                message: result.canPublish
                    ? `Form ${input.formId} is ready for publication`
                    : `Form ${input.formId} has validation issues`,
                canPublish: result.canPublish,
                issuesCount: result.errors.length + result.warnings.length
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: 'Failed to validate form for publication'
            };
        }
    }
}
exports.FormSharingTool = FormSharingTool;
//# sourceMappingURL=form-sharing-tool.js.map