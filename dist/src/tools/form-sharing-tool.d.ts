import { z } from 'zod';
import { TallyApiClient } from '../services/TallyApiClient';
import { FormVisibility, EmbedTheme, ShareLinkType } from '../models/form-sharing-models';
declare const PublishFormInputSchema: z.ZodObject<{
    formId: z.ZodString;
    visibility: z.ZodOptional<z.ZodNativeEnum<typeof FormVisibility>>;
    password: z.ZodOptional<z.ZodString>;
    publishDate: z.ZodOptional<z.ZodString>;
    unpublishDate: z.ZodOptional<z.ZodString>;
    notificationEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    formId: string;
    visibility?: FormVisibility | undefined;
    password?: string | undefined;
    publishDate?: string | undefined;
    unpublishDate?: string | undefined;
    notificationEmails?: string[] | undefined;
}, {
    formId: string;
    visibility?: FormVisibility | undefined;
    password?: string | undefined;
    publishDate?: string | undefined;
    unpublishDate?: string | undefined;
    notificationEmails?: string[] | undefined;
}>;
declare const UpdatePublicationSettingsInputSchema: z.ZodObject<{
    formId: z.ZodString;
    settings: z.ZodObject<{
        formId: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodNativeEnum<typeof FormVisibility>>;
        isPublished: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        publishedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        unpublishedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        passwordRequired: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        password: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        allowedDomains: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        ipWhitelist: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        publishDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        unpublishDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        notifyOnSubmission: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        notificationEmails: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        metaTitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        metaDescription: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        customSlug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        trackAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        allowIndexing: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        requireCaptcha: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        maxSubmissions: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        formId?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        isPublished?: boolean | undefined;
        allowedDomains?: string[] | undefined;
        maxSubmissions?: number | undefined;
        ipWhitelist?: string[] | undefined;
        visibility?: FormVisibility | undefined;
        publishedAt?: string | undefined;
        unpublishedAt?: string | undefined;
        passwordRequired?: boolean | undefined;
        password?: string | undefined;
        publishDate?: string | undefined;
        unpublishDate?: string | undefined;
        notifyOnSubmission?: boolean | undefined;
        notificationEmails?: string[] | undefined;
        metaTitle?: string | undefined;
        metaDescription?: string | undefined;
        customSlug?: string | undefined;
        trackAnalytics?: boolean | undefined;
        allowIndexing?: boolean | undefined;
        requireCaptcha?: boolean | undefined;
    }, {
        formId?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        isPublished?: boolean | undefined;
        allowedDomains?: string[] | undefined;
        maxSubmissions?: number | undefined;
        ipWhitelist?: string[] | undefined;
        visibility?: FormVisibility | undefined;
        publishedAt?: string | undefined;
        unpublishedAt?: string | undefined;
        passwordRequired?: boolean | undefined;
        password?: string | undefined;
        publishDate?: string | undefined;
        unpublishDate?: string | undefined;
        notifyOnSubmission?: boolean | undefined;
        notificationEmails?: string[] | undefined;
        metaTitle?: string | undefined;
        metaDescription?: string | undefined;
        customSlug?: string | undefined;
        trackAnalytics?: boolean | undefined;
        allowIndexing?: boolean | undefined;
        requireCaptcha?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    formId: string;
    settings: {
        formId?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        isPublished?: boolean | undefined;
        allowedDomains?: string[] | undefined;
        maxSubmissions?: number | undefined;
        ipWhitelist?: string[] | undefined;
        visibility?: FormVisibility | undefined;
        publishedAt?: string | undefined;
        unpublishedAt?: string | undefined;
        passwordRequired?: boolean | undefined;
        password?: string | undefined;
        publishDate?: string | undefined;
        unpublishDate?: string | undefined;
        notifyOnSubmission?: boolean | undefined;
        notificationEmails?: string[] | undefined;
        metaTitle?: string | undefined;
        metaDescription?: string | undefined;
        customSlug?: string | undefined;
        trackAnalytics?: boolean | undefined;
        allowIndexing?: boolean | undefined;
        requireCaptcha?: boolean | undefined;
    };
}, {
    formId: string;
    settings: {
        formId?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        isPublished?: boolean | undefined;
        allowedDomains?: string[] | undefined;
        maxSubmissions?: number | undefined;
        ipWhitelist?: string[] | undefined;
        visibility?: FormVisibility | undefined;
        publishedAt?: string | undefined;
        unpublishedAt?: string | undefined;
        passwordRequired?: boolean | undefined;
        password?: string | undefined;
        publishDate?: string | undefined;
        unpublishDate?: string | undefined;
        notifyOnSubmission?: boolean | undefined;
        notificationEmails?: string[] | undefined;
        metaTitle?: string | undefined;
        metaDescription?: string | undefined;
        customSlug?: string | undefined;
        trackAnalytics?: boolean | undefined;
        allowIndexing?: boolean | undefined;
        requireCaptcha?: boolean | undefined;
    };
}>;
declare const GenerateEmbedCodeInputSchema: z.ZodObject<{
    formId: z.ZodString;
    theme: z.ZodOptional<z.ZodNativeEnum<typeof EmbedTheme>>;
    autoHeight: z.ZodOptional<z.ZodBoolean>;
    width: z.ZodOptional<z.ZodString>;
    height: z.ZodOptional<z.ZodString>;
    hideHeader: z.ZodOptional<z.ZodBoolean>;
    hideFooter: z.ZodOptional<z.ZodBoolean>;
    backgroundColor: z.ZodOptional<z.ZodString>;
    borderRadius: z.ZodOptional<z.ZodNumber>;
    customCss: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    formId: string;
    backgroundColor?: string | undefined;
    borderRadius?: number | undefined;
    theme?: EmbedTheme | undefined;
    customCss?: string | undefined;
    autoHeight?: boolean | undefined;
    width?: string | undefined;
    height?: string | undefined;
    hideHeader?: boolean | undefined;
    hideFooter?: boolean | undefined;
}, {
    formId: string;
    backgroundColor?: string | undefined;
    borderRadius?: number | undefined;
    theme?: EmbedTheme | undefined;
    customCss?: string | undefined;
    autoHeight?: boolean | undefined;
    width?: string | undefined;
    height?: string | undefined;
    hideHeader?: boolean | undefined;
    hideFooter?: boolean | undefined;
}>;
declare const GenerateShareLinkInputSchema: z.ZodObject<{
    formId: z.ZodString;
    type: z.ZodNativeEnum<typeof ShareLinkType>;
    customSlug: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    expirationHours: z.ZodOptional<z.ZodNumber>;
    maxUses: z.ZodOptional<z.ZodNumber>;
    trackingEnabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: ShareLinkType;
    formId: string;
    password?: string | undefined;
    customSlug?: string | undefined;
    maxUses?: number | undefined;
    expirationHours?: number | undefined;
    trackingEnabled?: boolean | undefined;
}, {
    type: ShareLinkType;
    formId: string;
    password?: string | undefined;
    customSlug?: string | undefined;
    maxUses?: number | undefined;
    expirationHours?: number | undefined;
    trackingEnabled?: boolean | undefined;
}>;
declare const GetFormAnalyticsInputSchema: z.ZodObject<{
    formId: z.ZodString;
    period: z.ZodOptional<z.ZodEnum<["day", "week", "month", "year"]>>;
}, "strip", z.ZodTypeAny, {
    formId: string;
    period?: "day" | "week" | "month" | "year" | undefined;
}, {
    formId: string;
    period?: "day" | "week" | "month" | "year" | undefined;
}>;
declare const BulkOperationInputSchema: z.ZodObject<{
    operationType: z.ZodEnum<["publish", "unpublish", "update_settings", "generate_links"]>;
    formIds: z.ZodArray<z.ZodString, "many">;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    formIds: string[];
    operationType: "update_settings" | "publish" | "unpublish" | "generate_links";
    settings?: Record<string, any> | undefined;
}, {
    formIds: string[];
    operationType: "update_settings" | "publish" | "unpublish" | "generate_links";
    settings?: Record<string, any> | undefined;
}>;
export declare class FormSharingTool {
    private publicationService;
    constructor(apiClient: TallyApiClient);
    publishForm(input: z.infer<typeof PublishFormInputSchema>): Promise<{
        success: boolean;
        data: {
            formId: string;
            createdAt: string;
            updatedAt: string;
            isPublished: boolean;
            visibility: FormVisibility;
            passwordRequired: boolean;
            notifyOnSubmission: boolean;
            notificationEmails: string[];
            trackAnalytics: boolean;
            allowIndexing: boolean;
            requireCaptcha: boolean;
            allowedDomains?: string[] | undefined;
            maxSubmissions?: number | undefined;
            ipWhitelist?: string[] | undefined;
            publishedAt?: string | undefined;
            unpublishedAt?: string | undefined;
            password?: string | undefined;
            publishDate?: string | undefined;
            unpublishDate?: string | undefined;
            metaTitle?: string | undefined;
            metaDescription?: string | undefined;
            customSlug?: string | undefined;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
    }>;
    unpublishForm(input: {
        formId: string;
    }): Promise<{
        success: boolean;
        data: {
            formId: string;
            createdAt: string;
            updatedAt: string;
            isPublished: boolean;
            visibility: FormVisibility;
            passwordRequired: boolean;
            notifyOnSubmission: boolean;
            notificationEmails: string[];
            trackAnalytics: boolean;
            allowIndexing: boolean;
            requireCaptcha: boolean;
            allowedDomains?: string[] | undefined;
            maxSubmissions?: number | undefined;
            ipWhitelist?: string[] | undefined;
            publishedAt?: string | undefined;
            unpublishedAt?: string | undefined;
            password?: string | undefined;
            publishDate?: string | undefined;
            unpublishDate?: string | undefined;
            metaTitle?: string | undefined;
            metaDescription?: string | undefined;
            customSlug?: string | undefined;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
    }>;
    getPublicationSettings(input: {
        formId: string;
    }): Promise<{
        success: boolean;
        data: {
            formId: string;
            createdAt: string;
            updatedAt: string;
            isPublished: boolean;
            visibility: FormVisibility;
            passwordRequired: boolean;
            notifyOnSubmission: boolean;
            notificationEmails: string[];
            trackAnalytics: boolean;
            allowIndexing: boolean;
            requireCaptcha: boolean;
            allowedDomains?: string[] | undefined;
            maxSubmissions?: number | undefined;
            ipWhitelist?: string[] | undefined;
            publishedAt?: string | undefined;
            unpublishedAt?: string | undefined;
            password?: string | undefined;
            publishDate?: string | undefined;
            unpublishDate?: string | undefined;
            metaTitle?: string | undefined;
            metaDescription?: string | undefined;
            customSlug?: string | undefined;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
    }>;
    updatePublicationSettings(input: z.infer<typeof UpdatePublicationSettingsInputSchema>): Promise<{
        success: boolean;
        data: {
            formId: string;
            createdAt: string;
            updatedAt: string;
            isPublished: boolean;
            visibility: FormVisibility;
            passwordRequired: boolean;
            notifyOnSubmission: boolean;
            notificationEmails: string[];
            trackAnalytics: boolean;
            allowIndexing: boolean;
            requireCaptcha: boolean;
            allowedDomains?: string[] | undefined;
            maxSubmissions?: number | undefined;
            ipWhitelist?: string[] | undefined;
            publishedAt?: string | undefined;
            unpublishedAt?: string | undefined;
            password?: string | undefined;
            publishDate?: string | undefined;
            unpublishDate?: string | undefined;
            metaTitle?: string | undefined;
            metaDescription?: string | undefined;
            customSlug?: string | undefined;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
    }>;
    generateEmbedCode(input: z.infer<typeof GenerateEmbedCodeInputSchema>): Promise<{
        success: boolean;
        data: import("../models/form-sharing-models").GeneratedEmbedCode;
        message: string;
        embedCode: {
            html: string;
            javascript: string;
            iframe: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
        embedCode?: undefined;
    }>;
    generateShareLink(input: z.infer<typeof GenerateShareLinkInputSchema>): Promise<{
        success: boolean;
        data: {
            type: ShareLinkType;
            id: string;
            url: string;
            formId: string;
            createdAt: string;
            updatedAt: string;
            tags: string[];
            isActive: boolean;
            passwordProtected: boolean;
            currentUses: number;
            trackClicks: boolean;
            trackSubmissions: boolean;
            title?: string | undefined;
            description?: string | undefined;
            expiresAt?: string | undefined;
            password?: string | undefined;
            shortUrl?: string | undefined;
            maxUses?: number | undefined;
            lastAccessedAt?: string | undefined;
        };
        message: string;
        shareUrl: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
        shareUrl?: undefined;
    }>;
    getShareLinks(input: {
        formId: string;
    }): Promise<{
        success: boolean;
        data: {
            type: ShareLinkType;
            id: string;
            url: string;
            formId: string;
            createdAt: string;
            updatedAt: string;
            tags: string[];
            isActive: boolean;
            passwordProtected: boolean;
            currentUses: number;
            trackClicks: boolean;
            trackSubmissions: boolean;
            title?: string | undefined;
            description?: string | undefined;
            expiresAt?: string | undefined;
            password?: string | undefined;
            shortUrl?: string | undefined;
            maxUses?: number | undefined;
            lastAccessedAt?: string | undefined;
        }[];
        message: string;
        count: number;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
        count?: undefined;
    }>;
    deactivateShareLink(input: {
        linkId: string;
    }): Promise<{
        success: boolean;
        data: {
            type: ShareLinkType;
            id: string;
            url: string;
            formId: string;
            createdAt: string;
            updatedAt: string;
            tags: string[];
            isActive: boolean;
            passwordProtected: boolean;
            currentUses: number;
            trackClicks: boolean;
            trackSubmissions: boolean;
            title?: string | undefined;
            description?: string | undefined;
            expiresAt?: string | undefined;
            password?: string | undefined;
            shortUrl?: string | undefined;
            maxUses?: number | undefined;
            lastAccessedAt?: string | undefined;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
    }>;
    getFormSharingStats(input: {
        formId: string;
    }): Promise<{
        success: boolean;
        data: {
            formId: string;
            totalViews: number;
            uniqueViews: number;
            viewsToday: number;
            viewsThisWeek: number;
            viewsThisMonth: number;
            totalSubmissions: number;
            submissionsToday: number;
            submissionsThisWeek: number;
            submissionsThisMonth: number;
            conversionRate: number;
            topReferrers: {
                domain: string;
                visits: number;
            }[];
            topCountries: {
                country: string;
                visits: number;
            }[];
            deviceStats: {
                desktop: number;
                mobile: number;
                tablet: number;
            };
            lastUpdated: string;
            averageTimeToComplete?: number | undefined;
        };
        message: string;
        summary: {
            totalViews: number;
            totalSubmissions: number;
            conversionRate: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
        summary?: undefined;
    }>;
    getFormAnalytics(input: z.infer<typeof GetFormAnalyticsInputSchema>): Promise<{
        success: boolean;
        data: import("../models/form-sharing-models").FormAnalyticsData;
        message: string;
        period: "day" | "week" | "month" | "year";
        dataPoints: number;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
        period?: undefined;
        dataPoints?: undefined;
    }>;
    performBulkOperation(input: z.infer<typeof BulkOperationInputSchema>): Promise<{
        success: boolean;
        data: {
            status: "completed" | "pending" | "in_progress" | "failed";
            createdAt: string;
            formIds: string[];
            failedCount: number;
            errors: string[];
            operationType: "update_settings" | "publish" | "unpublish" | "generate_links";
            completedCount: number;
            settings?: Record<string, any> | undefined;
            executeAt?: string | undefined;
            startedAt?: string | undefined;
            completedAt?: string | undefined;
        };
        message: string;
        summary: {
            total: number;
            completed: number;
            failed: number;
            status: "completed" | "pending" | "in_progress" | "failed";
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
        summary?: undefined;
    }>;
    validateFormForPublication(input: {
        formId: string;
    }): Promise<{
        success: boolean;
        data: import("../models/form-sharing-models").PublicationValidationResult;
        message: string;
        canPublish: boolean;
        issuesCount: number;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: string;
        data?: undefined;
        canPublish?: undefined;
        issuesCount?: undefined;
    }>;
}
export { PublishFormInputSchema, UpdatePublicationSettingsInputSchema, GenerateEmbedCodeInputSchema, GenerateShareLinkInputSchema, GetFormAnalyticsInputSchema, BulkOperationInputSchema };
//# sourceMappingURL=form-sharing-tool.d.ts.map