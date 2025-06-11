import { z } from 'zod';
export var FormVisibility;
(function (FormVisibility) {
    FormVisibility["PRIVATE"] = "private";
    FormVisibility["ORGANIZATION"] = "organization";
    FormVisibility["PUBLIC"] = "public";
    FormVisibility["PASSWORD_PROTECTED"] = "password_protected";
    FormVisibility["LINK_ONLY"] = "link_only";
})(FormVisibility || (FormVisibility = {}));
export var EmbedTheme;
(function (EmbedTheme) {
    EmbedTheme["LIGHT"] = "light";
    EmbedTheme["DARK"] = "dark";
    EmbedTheme["AUTO"] = "auto";
    EmbedTheme["CUSTOM"] = "custom";
})(EmbedTheme || (EmbedTheme = {}));
export var ShareLinkType;
(function (ShareLinkType) {
    ShareLinkType["STANDARD"] = "standard";
    ShareLinkType["EMBED"] = "embed";
    ShareLinkType["QR_CODE"] = "qr_code";
    ShareLinkType["SOCIAL"] = "social";
})(ShareLinkType || (ShareLinkType = {}));
export const FormVisibilitySchema = z.nativeEnum(FormVisibility);
export const EmbedThemeSchema = z.nativeEnum(EmbedTheme);
export const ShareLinkTypeSchema = z.nativeEnum(ShareLinkType);
export const FormPublicationSettingsSchema = z.object({
    formId: z.string(),
    visibility: FormVisibilitySchema,
    isPublished: z.boolean().default(false),
    publishedAt: z.string().datetime().optional(),
    unpublishedAt: z.string().datetime().optional(),
    passwordRequired: z.boolean().default(false),
    password: z.string().optional(),
    allowedDomains: z.array(z.string()).optional(),
    ipWhitelist: z.array(z.string()).optional(),
    publishDate: z.string().datetime().optional(),
    unpublishDate: z.string().datetime().optional(),
    notifyOnSubmission: z.boolean().default(true),
    notificationEmails: z.array(z.string().email()),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    customSlug: z.string().optional(),
    trackAnalytics: z.boolean().default(true),
    allowIndexing: z.boolean().default(false),
    requireCaptcha: z.boolean().default(false),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
export const EmbedCodeSettingsSchema = z.object({
    formId: z.string(),
    theme: EmbedThemeSchema.default(EmbedTheme.LIGHT),
    autoHeight: z.boolean().default(true),
    width: z.string().default('100%'),
    height: z.string().optional(),
    backgroundColor: z.string().optional(),
    borderRadius: z.number().min(0).max(50).default(8),
    hideHeader: z.boolean().default(false),
    hideFooter: z.boolean().default(false),
    enableRedirect: z.boolean().default(true),
    redirectUrl: z.string().url().optional(),
    showLoadingSpinner: z.boolean().default(true),
    animateOnLoad: z.boolean().default(true),
    customCss: z.string().optional(),
    allowedOrigins: z.array(z.string()).optional(),
    sandbox: z.boolean().default(true)
});
export const ShareLinkSchema = z.object({
    id: z.string(),
    formId: z.string(),
    type: ShareLinkTypeSchema,
    url: z.string().url(),
    shortUrl: z.string().url().optional(),
    isActive: z.boolean().default(true),
    passwordProtected: z.boolean().default(false),
    password: z.string().optional(),
    maxUses: z.number().positive().optional(),
    currentUses: z.number().min(0).default(0),
    expiresAt: z.string().datetime().optional(),
    trackClicks: z.boolean().default(true),
    trackSubmissions: z.boolean().default(true),
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    lastAccessedAt: z.string().datetime().optional()
});
export const FormSharingStatsSchema = z.object({
    formId: z.string(),
    totalViews: z.number().min(0).default(0),
    uniqueViews: z.number().min(0).default(0),
    viewsToday: z.number().min(0).default(0),
    viewsThisWeek: z.number().min(0).default(0),
    viewsThisMonth: z.number().min(0).default(0),
    totalSubmissions: z.number().min(0).default(0),
    submissionsToday: z.number().min(0).default(0),
    submissionsThisWeek: z.number().min(0).default(0),
    submissionsThisMonth: z.number().min(0).default(0),
    conversionRate: z.number().min(0).max(100).default(0),
    averageTimeToComplete: z.number().min(0).optional(),
    topReferrers: z.array(z.object({
        domain: z.string(),
        visits: z.number().min(0)
    })).default([]),
    topCountries: z.array(z.object({
        country: z.string(),
        visits: z.number().min(0)
    })).default([]),
    deviceStats: z.object({
        desktop: z.number().min(0).default(0),
        mobile: z.number().min(0).default(0),
        tablet: z.number().min(0).default(0)
    }).default({}),
    lastUpdated: z.string().datetime()
});
export const BulkSharingOperationSchema = z.object({
    operationType: z.enum(['publish', 'unpublish', 'update_settings', 'generate_links']),
    formIds: z.array(z.string()).min(1),
    settings: z.record(z.any()).optional(),
    executeAt: z.string().datetime().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
    completedCount: z.number().min(0).default(0),
    failedCount: z.number().min(0).default(0),
    errors: z.array(z.string()).default([]),
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional()
});
//# sourceMappingURL=form-sharing-models.js.map