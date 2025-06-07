import { FormPublicationSettings, EmbedCodeSettings, ShareLink, FormSharingStats, BulkSharingOperation, GeneratedEmbedCode, ShareLinkGenerationOptions, FormAnalyticsData, PublicationValidationResult, FormVisibility } from '../models/form-sharing-models';
import { TallyApiClient } from './TallyApiClient';
export declare class FormPublicationService {
    private apiClient;
    private baseUrl;
    constructor(apiClient: TallyApiClient, baseUrl?: string);
    getPublicationSettings(formId: string): Promise<FormPublicationSettings>;
    updatePublicationSettings(formId: string, settings: Partial<FormPublicationSettings>): Promise<FormPublicationSettings>;
    publishForm(formId: string, visibility?: FormVisibility, options?: {
        password?: string;
        publishDate?: string;
        unpublishDate?: string;
        notificationEmails?: string[];
    }): Promise<FormPublicationSettings>;
    unpublishForm(formId: string): Promise<FormPublicationSettings>;
    generateEmbedCode(formId: string, settings?: Partial<EmbedCodeSettings>): Promise<GeneratedEmbedCode>;
    private generateHtmlEmbed;
    private generateJavaScriptEmbed;
    private generateIframeEmbed;
    private buildEmbedParams;
    private generateEmbedStyles;
    generateShareLink(formId: string, options: ShareLinkGenerationOptions): Promise<ShareLink>;
    getShareLinks(formId: string): Promise<ShareLink[]>;
    updateShareLink(linkId: string, updates: Partial<ShareLink>): Promise<ShareLink>;
    deactivateShareLink(linkId: string): Promise<ShareLink>;
    getFormSharingStats(formId: string): Promise<FormSharingStats>;
    getFormAnalytics(formId: string, period?: 'day' | 'week' | 'month' | 'year'): Promise<FormAnalyticsData>;
    performBulkOperation(operation: BulkSharingOperation): Promise<BulkSharingOperation>;
    validateFormForPublication(formId: string): Promise<PublicationValidationResult>;
    private generateLinkId;
    private getDataPointsForPeriod;
    private generateDateRange;
}
//# sourceMappingURL=form-publication-service.d.ts.map