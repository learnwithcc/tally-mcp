import { FormVisibility, EmbedTheme, ShareLinkType, FormPublicationSettingsSchema, EmbedCodeSettingsSchema, ShareLinkSchema, FormSharingStatsSchema, BulkSharingOperationSchema } from '../models/form-sharing-models';
export class FormPublicationService {
    constructor(apiClient, baseUrl = 'https://tally.so') {
        this.apiClient = apiClient;
        this.baseUrl = baseUrl;
    }
    async getPublicationSettings(formId) {
        try {
            const defaultSettings = {
                formId,
                visibility: FormVisibility.PRIVATE,
                isPublished: false,
                passwordRequired: false,
                notifyOnSubmission: true,
                notificationEmails: [],
                trackAnalytics: true,
                allowIndexing: false,
                requireCaptcha: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            return FormPublicationSettingsSchema.parse(defaultSettings);
        }
        catch (error) {
            throw new Error(`Failed to get publication settings for form ${formId}: ${error}`);
        }
    }
    async updatePublicationSettings(formId, settings) {
        try {
            const currentSettings = await this.getPublicationSettings(formId);
            const updatedSettings = {
                ...currentSettings,
                ...settings,
                formId,
                updatedAt: new Date().toISOString()
            };
            return FormPublicationSettingsSchema.parse(updatedSettings);
        }
        catch (error) {
            throw new Error(`Failed to update publication settings for form ${formId}: ${error}`);
        }
    }
    async publishForm(formId, visibility = FormVisibility.PUBLIC, options) {
        try {
            const settings = {
                visibility,
                isPublished: true,
                publishedAt: new Date().toISOString(),
                passwordRequired: !!options?.password,
                password: options?.password,
                publishDate: options?.publishDate,
                unpublishDate: options?.unpublishDate,
                notificationEmails: options?.notificationEmails || []
            };
            return await this.updatePublicationSettings(formId, settings);
        }
        catch (error) {
            throw new Error(`Failed to publish form ${formId}: ${error}`);
        }
    }
    async unpublishForm(formId) {
        try {
            const settings = {
                isPublished: false,
                unpublishedAt: new Date().toISOString()
            };
            return await this.updatePublicationSettings(formId, settings);
        }
        catch (error) {
            throw new Error(`Failed to unpublish form ${formId}: ${error}`);
        }
    }
    async generateEmbedCode(formId, settings) {
        try {
            const defaultSettings = {
                formId,
                theme: EmbedTheme.LIGHT,
                autoHeight: true,
                width: '100%',
                borderRadius: 8,
                hideHeader: false,
                hideFooter: false,
                enableRedirect: true,
                showLoadingSpinner: true,
                animateOnLoad: true,
                sandbox: true
            };
            const embedSettings = EmbedCodeSettingsSchema.parse({
                ...defaultSettings,
                ...settings
            });
            const embedUrl = `${this.baseUrl}/embed/${formId}`;
            const html = this.generateHtmlEmbed(embedUrl, embedSettings);
            const javascript = this.generateJavaScriptEmbed(embedUrl, embedSettings);
            const iframe = this.generateIframeEmbed(embedUrl, embedSettings);
            return {
                html,
                javascript,
                iframe,
                settings: embedSettings
            };
        }
        catch (error) {
            throw new Error(`Failed to generate embed code for form ${formId}: ${error}`);
        }
    }
    generateHtmlEmbed(url, settings) {
        const style = this.generateEmbedStyles(settings);
        return `<div class="tally-embed" style="${style}">
  <iframe 
    src="${url}${this.buildEmbedParams(settings)}"
    width="${settings.width}"
    ${settings.height ? `height="${settings.height}"` : ''}
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    title="Form"
    ${settings.sandbox ? 'sandbox="allow-scripts allow-forms allow-same-origin"' : ''}
    ${settings.allowedOrigins ? `allow="${settings.allowedOrigins.join(';')}"` : ''}
  ></iframe>
</div>`;
    }
    generateJavaScriptEmbed(url, settings) {
        return `<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${url}${this.buildEmbedParams(settings)}';
  iframe.width = '${settings.width}';
  ${settings.height ? `iframe.height = '${settings.height}';` : ''}
  iframe.frameBorder = '0';
  iframe.marginHeight = '0';
  iframe.marginWidth = '0';
  iframe.title = 'Form';
  ${settings.sandbox ? `iframe.sandbox = 'allow-scripts allow-forms allow-same-origin';` : ''}
  
  var container = document.getElementById('tally-form-${settings.formId}');
  if (container) {
    container.appendChild(iframe);
  }
})();
</script>
<div id="tally-form-${settings.formId}" style="${this.generateEmbedStyles(settings)}"></div>`;
    }
    generateIframeEmbed(url, settings) {
        return `<iframe 
  src="${url}${this.buildEmbedParams(settings)}"
  width="${settings.width}"
  ${settings.height ? `height="${settings.height}"` : ''}
  frameborder="0"
  marginheight="0"
  marginwidth="0"
  title="Form"
  style="${this.generateEmbedStyles(settings)}"
  ${settings.sandbox ? 'sandbox="allow-scripts allow-forms allow-same-origin"' : ''}
></iframe>`;
    }
    buildEmbedParams(settings) {
        const params = new URLSearchParams();
        if (settings.theme !== EmbedTheme.LIGHT)
            params.set('theme', settings.theme);
        if (settings.autoHeight)
            params.set('autoHeight', '1');
        if (settings.hideHeader)
            params.set('hideHeader', '1');
        if (settings.hideFooter)
            params.set('hideFooter', '1');
        if (!settings.enableRedirect)
            params.set('redirect', '0');
        if (settings.redirectUrl)
            params.set('redirectUrl', settings.redirectUrl);
        if (!settings.showLoadingSpinner)
            params.set('spinner', '0');
        if (!settings.animateOnLoad)
            params.set('animate', '0');
        return params.toString() ? `?${params.toString()}` : '';
    }
    generateEmbedStyles(settings) {
        const styles = [];
        if (settings.backgroundColor) {
            styles.push(`background-color: ${settings.backgroundColor}`);
        }
        if (settings.borderRadius) {
            styles.push(`border-radius: ${settings.borderRadius}px`);
        }
        styles.push('border: none');
        styles.push('overflow: hidden');
        return styles.join('; ');
    }
    async generateShareLink(formId, options) {
        try {
            const linkId = this.generateLinkId();
            const baseUrl = `${this.baseUrl}/r/${formId}`;
            let url = baseUrl;
            if (options.customSlug) {
                url = `${this.baseUrl}/s/${options.customSlug}`;
            }
            const shareLink = {
                id: linkId,
                formId,
                type: options.type,
                url,
                isActive: true,
                passwordProtected: !!options.password,
                password: options.password,
                maxUses: options.maxUses,
                currentUses: 0,
                expiresAt: options.expirationHours
                    ? new Date(Date.now() + options.expirationHours * 60 * 60 * 1000).toISOString()
                    : undefined,
                trackClicks: options.trackingEnabled ?? true,
                trackSubmissions: options.trackingEnabled ?? true,
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            return ShareLinkSchema.parse(shareLink);
        }
        catch (error) {
            throw new Error(`Failed to generate share link for form ${formId}: ${error}`);
        }
    }
    async getShareLinks(formId) {
        try {
            return [];
        }
        catch (error) {
            throw new Error(`Failed to get share links for form ${formId}: ${error}`);
        }
    }
    async updateShareLink(linkId, updates) {
        try {
            const existingLink = {
                id: linkId,
                formId: 'mock-form-id',
                type: ShareLinkType.STANDARD,
                url: 'https://tally.so/r/mock-form-id',
                isActive: true,
                passwordProtected: false,
                currentUses: 0,
                trackClicks: true,
                trackSubmissions: true,
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const updatedLink = {
                ...existingLink,
                ...updates,
                id: linkId,
                updatedAt: new Date().toISOString()
            };
            return ShareLinkSchema.parse(updatedLink);
        }
        catch (error) {
            throw new Error(`Failed to update share link ${linkId}: ${error}`);
        }
    }
    async deactivateShareLink(linkId) {
        return this.updateShareLink(linkId, { isActive: false });
    }
    async getFormSharingStats(formId) {
        try {
            const stats = {
                formId,
                totalViews: 0,
                uniqueViews: 0,
                viewsToday: 0,
                viewsThisWeek: 0,
                viewsThisMonth: 0,
                totalSubmissions: 0,
                submissionsToday: 0,
                submissionsThisWeek: 0,
                submissionsThisMonth: 0,
                conversionRate: 0,
                topReferrers: [],
                topCountries: [],
                deviceStats: {
                    desktop: 0,
                    mobile: 0,
                    tablet: 0
                },
                lastUpdated: new Date().toISOString()
            };
            return FormSharingStatsSchema.parse(stats);
        }
        catch (error) {
            throw new Error(`Failed to get sharing stats for form ${formId}: ${error}`);
        }
    }
    async getFormAnalytics(formId, period = 'week') {
        try {
            const stats = await this.getFormSharingStats(formId);
            const dataPoints = this.getDataPointsForPeriod(period);
            const dates = this.generateDateRange(period, dataPoints);
            return {
                formId,
                period,
                metrics: {
                    views: new Array(dataPoints).fill(0),
                    submissions: new Array(dataPoints).fill(0),
                    conversionRates: new Array(dataPoints).fill(0),
                    dates
                },
                summary: stats
            };
        }
        catch (error) {
            throw new Error(`Failed to get analytics for form ${formId}: ${error}`);
        }
    }
    async performBulkOperation(operation) {
        try {
            const validatedOperation = BulkSharingOperationSchema.parse({
                ...operation,
                status: 'in_progress',
                startedAt: new Date().toISOString()
            });
            for (const formId of validatedOperation.formIds) {
                try {
                    switch (validatedOperation.operationType) {
                        case 'publish':
                            await this.publishForm(formId);
                            break;
                        case 'unpublish':
                            await this.unpublishForm(formId);
                            break;
                        case 'update_settings':
                            if (validatedOperation.settings) {
                                await this.updatePublicationSettings(formId, validatedOperation.settings);
                            }
                            break;
                        case 'generate_links':
                            await this.generateShareLink(formId, {
                                type: ShareLinkType.STANDARD,
                                trackingEnabled: true
                            });
                            break;
                    }
                    validatedOperation.completedCount++;
                }
                catch (error) {
                    validatedOperation.failedCount++;
                    validatedOperation.errors.push(`Form ${formId}: ${error}`);
                }
            }
            validatedOperation.status = validatedOperation.failedCount > 0 ? 'failed' : 'completed';
            validatedOperation.completedAt = new Date().toISOString();
            return validatedOperation;
        }
        catch (error) {
            throw new Error(`Failed to perform bulk operation: ${error}`);
        }
    }
    async validateFormForPublication(formId) {
        try {
            const errors = [];
            const warnings = [];
            const form = await this.apiClient.getForm(formId);
            if (!form) {
                errors.push('Form not found');
            }
            else {
                const formBlocks = form.blocks;
                if (!formBlocks || formBlocks.length === 0) {
                    errors.push('Form must have at least one question');
                }
                if (!form.title || form.title.trim() === '') {
                    warnings.push('Form should have a title for better SEO');
                }
                const hasRequiredFields = formBlocks?.some((block) => block.type === 'INPUT_TEXT' ||
                    block.type === 'INPUT_EMAIL' ||
                    block.type === 'MULTIPLE_CHOICE');
                if (!hasRequiredFields) {
                    warnings.push('Consider adding required fields to improve data quality');
                }
            }
            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                canPublish: errors.length === 0
            };
        }
        catch (error) {
            return {
                isValid: false,
                errors: [`Validation failed: ${error}`],
                warnings: [],
                canPublish: false
            };
        }
    }
    generateLinkId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    getDataPointsForPeriod(period) {
        switch (period) {
            case 'day': return 24;
            case 'week': return 7;
            case 'month': return 30;
            case 'year': return 12;
            default: return 7;
        }
    }
    generateDateRange(period, points) {
        const dates = [];
        const now = new Date();
        for (let i = points - 1; i >= 0; i--) {
            const date = new Date(now);
            switch (period) {
                case 'day':
                    date.setHours(date.getHours() - i);
                    dates.push(date.toISOString().substring(11, 16));
                    break;
                case 'week':
                    date.setDate(date.getDate() - i);
                    dates.push(date.toISOString().substring(5, 10));
                    break;
                case 'month':
                    date.setDate(date.getDate() - i);
                    dates.push(date.toISOString().substring(5, 10));
                    break;
                case 'year':
                    date.setMonth(date.getMonth() - i);
                    dates.push(date.toISOString().substring(0, 7));
                    break;
                default:
                    dates.push(date.toISOString().substring(0, 10));
            }
        }
        return dates;
    }
}
//# sourceMappingURL=form-publication-service.js.map