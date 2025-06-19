import { z } from 'zod';
export declare enum FormVisibility {
    PRIVATE = "private",
    ORGANIZATION = "organization",
    PUBLIC = "public",
    PASSWORD_PROTECTED = "password_protected",
    LINK_ONLY = "link_only"
}
export declare enum EmbedTheme {
    LIGHT = "light",
    DARK = "dark",
    AUTO = "auto",
    CUSTOM = "custom"
}
export declare enum ShareLinkType {
    STANDARD = "standard",
    EMBED = "embed",
    QR_CODE = "qr_code",
    SOCIAL = "social",
    DIRECT = "direct",
    SECURE = "secure"
}
export declare const FormVisibilitySchema: z.ZodNativeEnum<typeof FormVisibility>;
export declare const EmbedThemeSchema: z.ZodNativeEnum<typeof EmbedTheme>;
export declare const ShareLinkTypeSchema: z.ZodNativeEnum<typeof ShareLinkType>;
export declare const FormPublicationSettingsSchema: z.ZodObject<{
    formId: z.ZodString;
    visibility: z.ZodNativeEnum<typeof FormVisibility>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
    publishedAt: z.ZodOptional<z.ZodString>;
    unpublishedAt: z.ZodOptional<z.ZodString>;
    passwordRequired: z.ZodDefault<z.ZodBoolean>;
    password: z.ZodOptional<z.ZodString>;
    allowedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ipWhitelist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    publishDate: z.ZodOptional<z.ZodString>;
    unpublishDate: z.ZodOptional<z.ZodString>;
    notifyOnSubmission: z.ZodDefault<z.ZodBoolean>;
    notificationEmails: z.ZodArray<z.ZodString, "many">;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDescription: z.ZodOptional<z.ZodString>;
    customSlug: z.ZodOptional<z.ZodString>;
    trackAnalytics: z.ZodDefault<z.ZodBoolean>;
    allowIndexing: z.ZodDefault<z.ZodBoolean>;
    requireCaptcha: z.ZodDefault<z.ZodBoolean>;
    maxSubmissions: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
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
}, {
    formId: string;
    createdAt: string;
    updatedAt: string;
    visibility: FormVisibility;
    notificationEmails: string[];
    isPublished?: boolean | undefined;
    allowedDomains?: string[] | undefined;
    maxSubmissions?: number | undefined;
    ipWhitelist?: string[] | undefined;
    publishedAt?: string | undefined;
    unpublishedAt?: string | undefined;
    passwordRequired?: boolean | undefined;
    password?: string | undefined;
    publishDate?: string | undefined;
    unpublishDate?: string | undefined;
    notifyOnSubmission?: boolean | undefined;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    customSlug?: string | undefined;
    trackAnalytics?: boolean | undefined;
    allowIndexing?: boolean | undefined;
    requireCaptcha?: boolean | undefined;
}>;
export declare const EmbedCodeSettingsSchema: z.ZodObject<{
    formId: z.ZodString;
    theme: z.ZodDefault<z.ZodNativeEnum<typeof EmbedTheme>>;
    autoHeight: z.ZodDefault<z.ZodBoolean>;
    width: z.ZodDefault<z.ZodString>;
    height: z.ZodOptional<z.ZodString>;
    backgroundColor: z.ZodOptional<z.ZodString>;
    borderRadius: z.ZodDefault<z.ZodNumber>;
    hideHeader: z.ZodDefault<z.ZodBoolean>;
    hideFooter: z.ZodDefault<z.ZodBoolean>;
    enableRedirect: z.ZodDefault<z.ZodBoolean>;
    redirectUrl: z.ZodOptional<z.ZodString>;
    showLoadingSpinner: z.ZodDefault<z.ZodBoolean>;
    animateOnLoad: z.ZodDefault<z.ZodBoolean>;
    customCss: z.ZodOptional<z.ZodString>;
    allowedOrigins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sandbox: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    formId: string;
    borderRadius: number;
    theme: EmbedTheme;
    autoHeight: boolean;
    width: string;
    hideHeader: boolean;
    hideFooter: boolean;
    enableRedirect: boolean;
    showLoadingSpinner: boolean;
    animateOnLoad: boolean;
    sandbox: boolean;
    backgroundColor?: string | undefined;
    customCss?: string | undefined;
    redirectUrl?: string | undefined;
    height?: string | undefined;
    allowedOrigins?: string[] | undefined;
}, {
    formId: string;
    backgroundColor?: string | undefined;
    borderRadius?: number | undefined;
    theme?: EmbedTheme | undefined;
    customCss?: string | undefined;
    redirectUrl?: string | undefined;
    autoHeight?: boolean | undefined;
    width?: string | undefined;
    height?: string | undefined;
    hideHeader?: boolean | undefined;
    hideFooter?: boolean | undefined;
    enableRedirect?: boolean | undefined;
    showLoadingSpinner?: boolean | undefined;
    animateOnLoad?: boolean | undefined;
    allowedOrigins?: string[] | undefined;
    sandbox?: boolean | undefined;
}>;
export declare const ShareLinkSchema: z.ZodObject<{
    id: z.ZodString;
    formId: z.ZodString;
    type: z.ZodNativeEnum<typeof ShareLinkType>;
    url: z.ZodString;
    shortUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    passwordProtected: z.ZodDefault<z.ZodBoolean>;
    password: z.ZodOptional<z.ZodString>;
    maxUses: z.ZodOptional<z.ZodNumber>;
    currentUses: z.ZodDefault<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    trackClicks: z.ZodDefault<z.ZodBoolean>;
    trackSubmissions: z.ZodDefault<z.ZodBoolean>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    lastAccessedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
}, {
    type: ShareLinkType;
    id: string;
    url: string;
    formId: string;
    createdAt: string;
    updatedAt: string;
    title?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    expiresAt?: string | undefined;
    isActive?: boolean | undefined;
    password?: string | undefined;
    shortUrl?: string | undefined;
    passwordProtected?: boolean | undefined;
    maxUses?: number | undefined;
    currentUses?: number | undefined;
    trackClicks?: boolean | undefined;
    trackSubmissions?: boolean | undefined;
    lastAccessedAt?: string | undefined;
}>;
export declare const FormSharingStatsSchema: z.ZodObject<{
    formId: z.ZodString;
    totalViews: z.ZodDefault<z.ZodNumber>;
    uniqueViews: z.ZodDefault<z.ZodNumber>;
    viewsToday: z.ZodDefault<z.ZodNumber>;
    viewsThisWeek: z.ZodDefault<z.ZodNumber>;
    viewsThisMonth: z.ZodDefault<z.ZodNumber>;
    totalSubmissions: z.ZodDefault<z.ZodNumber>;
    submissionsToday: z.ZodDefault<z.ZodNumber>;
    submissionsThisWeek: z.ZodDefault<z.ZodNumber>;
    submissionsThisMonth: z.ZodDefault<z.ZodNumber>;
    conversionRate: z.ZodDefault<z.ZodNumber>;
    averageTimeToComplete: z.ZodOptional<z.ZodNumber>;
    topReferrers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        domain: z.ZodString;
        visits: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        domain: string;
        visits: number;
    }, {
        domain: string;
        visits: number;
    }>, "many">>;
    topCountries: z.ZodDefault<z.ZodArray<z.ZodObject<{
        country: z.ZodString;
        visits: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        country: string;
        visits: number;
    }, {
        country: string;
        visits: number;
    }>, "many">>;
    deviceStats: z.ZodDefault<z.ZodObject<{
        desktop: z.ZodDefault<z.ZodNumber>;
        mobile: z.ZodDefault<z.ZodNumber>;
        tablet: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        desktop: number;
        mobile: number;
        tablet: number;
    }, {
        desktop?: number | undefined;
        mobile?: number | undefined;
        tablet?: number | undefined;
    }>>;
    lastUpdated: z.ZodString;
}, "strip", z.ZodTypeAny, {
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
}, {
    formId: string;
    lastUpdated: string;
    totalViews?: number | undefined;
    uniqueViews?: number | undefined;
    viewsToday?: number | undefined;
    viewsThisWeek?: number | undefined;
    viewsThisMonth?: number | undefined;
    totalSubmissions?: number | undefined;
    submissionsToday?: number | undefined;
    submissionsThisWeek?: number | undefined;
    submissionsThisMonth?: number | undefined;
    conversionRate?: number | undefined;
    averageTimeToComplete?: number | undefined;
    topReferrers?: {
        domain: string;
        visits: number;
    }[] | undefined;
    topCountries?: {
        country: string;
        visits: number;
    }[] | undefined;
    deviceStats?: {
        desktop?: number | undefined;
        mobile?: number | undefined;
        tablet?: number | undefined;
    } | undefined;
}>;
export declare const BulkSharingOperationSchema: z.ZodObject<{
    operationType: z.ZodEnum<["publish", "unpublish", "update_settings", "generate_links"]>;
    formIds: z.ZodArray<z.ZodString, "many">;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    executeAt: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["pending", "in_progress", "completed", "failed"]>>;
    completedCount: z.ZodDefault<z.ZodNumber>;
    failedCount: z.ZodDefault<z.ZodNumber>;
    errors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
}, {
    createdAt: string;
    formIds: string[];
    operationType: "update_settings" | "publish" | "unpublish" | "generate_links";
    status?: "completed" | "pending" | "in_progress" | "failed" | undefined;
    settings?: Record<string, any> | undefined;
    failedCount?: number | undefined;
    errors?: string[] | undefined;
    executeAt?: string | undefined;
    completedCount?: number | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
}>;
export type FormPublicationSettings = z.infer<typeof FormPublicationSettingsSchema>;
export type EmbedCodeSettings = z.infer<typeof EmbedCodeSettingsSchema>;
export type ShareLink = z.infer<typeof ShareLinkSchema>;
export type FormSharingStats = z.infer<typeof FormSharingStatsSchema>;
export type BulkSharingOperation = z.infer<typeof BulkSharingOperationSchema>;
export interface GeneratedEmbedCode {
    html: string;
    javascript: string;
    iframe: string;
    settings: EmbedCodeSettings;
}
export interface ShareLinkGenerationOptions {
    type: ShareLinkType;
    customSlug?: string;
    password?: string;
    expirationHours?: number;
    maxUses?: number;
    trackingEnabled?: boolean;
}
export interface FormAnalyticsData {
    formId: string;
    period: 'day' | 'week' | 'month' | 'year';
    metrics: {
        views: number[];
        submissions: number[];
        conversionRates: number[];
        dates: string[];
    };
    summary: FormSharingStats;
}
export interface PublicationValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    canPublish: boolean;
}
//# sourceMappingURL=form-sharing-models.d.ts.map