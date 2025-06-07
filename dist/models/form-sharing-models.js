"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkSharingOperationSchema = exports.FormSharingStatsSchema = exports.ShareLinkSchema = exports.EmbedCodeSettingsSchema = exports.FormPublicationSettingsSchema = exports.ShareLinkTypeSchema = exports.EmbedThemeSchema = exports.FormVisibilitySchema = exports.ShareLinkType = exports.EmbedTheme = exports.FormVisibility = void 0;
const zod_1 = require("zod");
var FormVisibility;
(function (FormVisibility) {
    FormVisibility["PRIVATE"] = "private";
    FormVisibility["ORGANIZATION"] = "organization";
    FormVisibility["PUBLIC"] = "public";
    FormVisibility["PASSWORD_PROTECTED"] = "password_protected";
    FormVisibility["LINK_ONLY"] = "link_only";
})(FormVisibility || (exports.FormVisibility = FormVisibility = {}));
var EmbedTheme;
(function (EmbedTheme) {
    EmbedTheme["LIGHT"] = "light";
    EmbedTheme["DARK"] = "dark";
    EmbedTheme["AUTO"] = "auto";
    EmbedTheme["CUSTOM"] = "custom";
})(EmbedTheme || (exports.EmbedTheme = EmbedTheme = {}));
var ShareLinkType;
(function (ShareLinkType) {
    ShareLinkType["STANDARD"] = "standard";
    ShareLinkType["EMBED"] = "embed";
    ShareLinkType["QR_CODE"] = "qr_code";
    ShareLinkType["SOCIAL"] = "social";
})(ShareLinkType || (exports.ShareLinkType = ShareLinkType = {}));
exports.FormVisibilitySchema = zod_1.z.nativeEnum(FormVisibility);
exports.EmbedThemeSchema = zod_1.z.nativeEnum(EmbedTheme);
exports.ShareLinkTypeSchema = zod_1.z.nativeEnum(ShareLinkType);
exports.FormPublicationSettingsSchema = zod_1.z.object({
    formId: zod_1.z.string(),
    visibility: exports.FormVisibilitySchema,
    isPublished: zod_1.z.boolean().default(false),
    publishedAt: zod_1.z.string().datetime().optional(),
    unpublishedAt: zod_1.z.string().datetime().optional(),
    passwordRequired: zod_1.z.boolean().default(false),
    password: zod_1.z.string().optional(),
    allowedDomains: zod_1.z.array(zod_1.z.string()).optional(),
    ipWhitelist: zod_1.z.array(zod_1.z.string()).optional(),
    publishDate: zod_1.z.string().datetime().optional(),
    unpublishDate: zod_1.z.string().datetime().optional(),
    notifyOnSubmission: zod_1.z.boolean().default(true),
    notificationEmails: zod_1.z.array(zod_1.z.string().email()),
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    customSlug: zod_1.z.string().optional(),
    trackAnalytics: zod_1.z.boolean().default(true),
    allowIndexing: zod_1.z.boolean().default(false),
    requireCaptcha: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.EmbedCodeSettingsSchema = zod_1.z.object({
    formId: zod_1.z.string(),
    theme: exports.EmbedThemeSchema.default(EmbedTheme.LIGHT),
    autoHeight: zod_1.z.boolean().default(true),
    width: zod_1.z.string().default('100%'),
    height: zod_1.z.string().optional(),
    backgroundColor: zod_1.z.string().optional(),
    borderRadius: zod_1.z.number().min(0).max(50).default(8),
    hideHeader: zod_1.z.boolean().default(false),
    hideFooter: zod_1.z.boolean().default(false),
    enableRedirect: zod_1.z.boolean().default(true),
    redirectUrl: zod_1.z.string().url().optional(),
    showLoadingSpinner: zod_1.z.boolean().default(true),
    animateOnLoad: zod_1.z.boolean().default(true),
    customCss: zod_1.z.string().optional(),
    allowedOrigins: zod_1.z.array(zod_1.z.string()).optional(),
    sandbox: zod_1.z.boolean().default(true)
});
exports.ShareLinkSchema = zod_1.z.object({
    id: zod_1.z.string(),
    formId: zod_1.z.string(),
    type: exports.ShareLinkTypeSchema,
    url: zod_1.z.string().url(),
    shortUrl: zod_1.z.string().url().optional(),
    isActive: zod_1.z.boolean().default(true),
    passwordProtected: zod_1.z.boolean().default(false),
    password: zod_1.z.string().optional(),
    maxUses: zod_1.z.number().positive().optional(),
    currentUses: zod_1.z.number().min(0).default(0),
    expiresAt: zod_1.z.string().datetime().optional(),
    trackClicks: zod_1.z.boolean().default(true),
    trackSubmissions: zod_1.z.boolean().default(true),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    lastAccessedAt: zod_1.z.string().datetime().optional()
});
exports.FormSharingStatsSchema = zod_1.z.object({
    formId: zod_1.z.string(),
    totalViews: zod_1.z.number().min(0).default(0),
    uniqueViews: zod_1.z.number().min(0).default(0),
    viewsToday: zod_1.z.number().min(0).default(0),
    viewsThisWeek: zod_1.z.number().min(0).default(0),
    viewsThisMonth: zod_1.z.number().min(0).default(0),
    totalSubmissions: zod_1.z.number().min(0).default(0),
    submissionsToday: zod_1.z.number().min(0).default(0),
    submissionsThisWeek: zod_1.z.number().min(0).default(0),
    submissionsThisMonth: zod_1.z.number().min(0).default(0),
    conversionRate: zod_1.z.number().min(0).max(100).default(0),
    averageTimeToComplete: zod_1.z.number().min(0).optional(),
    topReferrers: zod_1.z.array(zod_1.z.object({
        domain: zod_1.z.string(),
        visits: zod_1.z.number().min(0)
    })).default([]),
    topCountries: zod_1.z.array(zod_1.z.object({
        country: zod_1.z.string(),
        visits: zod_1.z.number().min(0)
    })).default([]),
    deviceStats: zod_1.z.object({
        desktop: zod_1.z.number().min(0).default(0),
        mobile: zod_1.z.number().min(0).default(0),
        tablet: zod_1.z.number().min(0).default(0)
    }).default({}),
    lastUpdated: zod_1.z.string().datetime()
});
exports.BulkSharingOperationSchema = zod_1.z.object({
    operationType: zod_1.z.enum(['publish', 'unpublish', 'update_settings', 'generate_links']),
    formIds: zod_1.z.array(zod_1.z.string()).min(1),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
    executeAt: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
    completedCount: zod_1.z.number().min(0).default(0),
    failedCount: zod_1.z.number().min(0).default(0),
    errors: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.string().datetime(),
    startedAt: zod_1.z.string().datetime().optional(),
    completedAt: zod_1.z.string().datetime().optional()
});
//# sourceMappingURL=form-sharing-models.js.map