import { z } from 'zod';

// FORM VISIBILITY AND SHARING TYPES

export enum FormVisibility {
  PRIVATE = 'private',
  ORGANIZATION = 'organization',
  PUBLIC = 'public',
  PASSWORD_PROTECTED = 'password_protected',
  LINK_ONLY = 'link_only'
}

export enum EmbedTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
  CUSTOM = 'custom'
}

export enum ShareLinkType {
  STANDARD = 'standard',
  EMBED = 'embed',
  QR_CODE = 'qr_code',
  SOCIAL = 'social',
  DIRECT = 'direct',
  SECURE = 'secure'
}

// ZOD SCHEMAS

export const FormVisibilitySchema = z.nativeEnum(FormVisibility);
export const EmbedThemeSchema = z.nativeEnum(EmbedTheme);
export const ShareLinkTypeSchema = z.nativeEnum(ShareLinkType);

export const FormPublicationSettingsSchema = z.object({
  formId: z.string(),
  visibility: FormVisibilitySchema,
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  unpublishedAt: z.string().datetime().optional(),
  
  // Access Control
  passwordRequired: z.boolean().default(false),
  password: z.string().optional(),
  allowedDomains: z.array(z.string()).optional(),
  ipWhitelist: z.array(z.string()).optional(),
  
  // Scheduling
  publishDate: z.string().datetime().optional(),
  unpublishDate: z.string().datetime().optional(),
  
  // Notifications
  notifyOnSubmission: z.boolean().default(true),
  notificationEmails: z.array(z.string().email()),
  
  // SEO and Metadata
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  customSlug: z.string().optional(),
  
  // Advanced Settings
  trackAnalytics: z.boolean().default(true),
  allowIndexing: z.boolean().default(false),
  requireCaptcha: z.boolean().default(false),
  maxSubmissions: z.number().positive().optional(),
  
  // Created/Updated timestamps
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
  
  // Behavior Settings
  hideHeader: z.boolean().default(false),
  hideFooter: z.boolean().default(false),
  enableRedirect: z.boolean().default(true),
  redirectUrl: z.string().url().optional(),
  
  // Loading and Animation
  showLoadingSpinner: z.boolean().default(true),
  animateOnLoad: z.boolean().default(true),
  
  // Custom CSS
  customCss: z.string().optional(),
  
  // Security
  allowedOrigins: z.array(z.string()).optional(),
  sandbox: z.boolean().default(true)
});

export const ShareLinkSchema = z.object({
  id: z.string(),
  formId: z.string(),
  type: ShareLinkTypeSchema,
  url: z.string().url(),
  shortUrl: z.string().url().optional(),
  
  // Access Control
  isActive: z.boolean().default(true),
  passwordProtected: z.boolean().default(false),
  password: z.string().optional(),
  
  // Usage Limits
  maxUses: z.number().positive().optional(),
  currentUses: z.number().min(0).default(0),
  
  // Expiration
  expiresAt: z.string().datetime().optional(),
  
  // Tracking
  trackClicks: z.boolean().default(true),
  trackSubmissions: z.boolean().default(true),
  
  // Metadata
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastAccessedAt: z.string().datetime().optional()
});

export const FormSharingStatsSchema = z.object({
  formId: z.string(),
  
  // View Statistics
  totalViews: z.number().min(0).default(0),
  uniqueViews: z.number().min(0).default(0),
  viewsToday: z.number().min(0).default(0),
  viewsThisWeek: z.number().min(0).default(0),
  viewsThisMonth: z.number().min(0).default(0),
  
  // Submission Statistics
  totalSubmissions: z.number().min(0).default(0),
  submissionsToday: z.number().min(0).default(0),
  submissionsThisWeek: z.number().min(0).default(0),
  submissionsThisMonth: z.number().min(0).default(0),
  
  // Conversion Metrics
  conversionRate: z.number().min(0).max(100).default(0),
  averageTimeToComplete: z.number().min(0).optional(), // in seconds
  
  // Traffic Sources
  topReferrers: z.array(z.object({
    domain: z.string(),
    visits: z.number().min(0)
  })).default([]),
  
  // Geographic Data
  topCountries: z.array(z.object({
    country: z.string(),
    visits: z.number().min(0)
  })).default([]),
  
  // Device/Browser Stats
  deviceStats: z.object({
    desktop: z.number().min(0).default(0),
    mobile: z.number().min(0).default(0),
    tablet: z.number().min(0).default(0)
  }).default({}),
  
  // Timestamps
  lastUpdated: z.string().datetime()
});

export const BulkSharingOperationSchema = z.object({
  operationType: z.enum(['publish', 'unpublish', 'update_settings', 'generate_links']),
  formIds: z.array(z.string()).min(1),
  settings: z.record(z.any()).optional(),
  
  // Scheduling
  executeAt: z.string().datetime().optional(),
  
  // Progress Tracking
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  completedCount: z.number().min(0).default(0),
  failedCount: z.number().min(0).default(0),
  errors: z.array(z.string()).default([]),
  
  // Timestamps
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional()
});

// TYPESCRIPT INTERFACES

export type FormPublicationSettings = z.infer<typeof FormPublicationSettingsSchema>;
export type EmbedCodeSettings = z.infer<typeof EmbedCodeSettingsSchema>;
export type ShareLink = z.infer<typeof ShareLinkSchema>;
export type FormSharingStats = z.infer<typeof FormSharingStatsSchema>;
export type BulkSharingOperation = z.infer<typeof BulkSharingOperationSchema>;

// HELPER INTERFACES

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