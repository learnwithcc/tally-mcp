import { z } from 'zod';
import { FormPublicationService } from '../services/form-publication-service';
import { TallyApiClient } from '../services/TallyApiClient';
import { 
  FormVisibility, 
  EmbedTheme, 
  ShareLinkType,
  FormPublicationSettingsSchema,

  ShareLinkGenerationOptions
} from '../models/form-sharing-models';

// Input schemas for MCP tools
const PublishFormInputSchema = z.object({
  formId: z.string().describe('The ID of the form to publish'),
  visibility: z.nativeEnum(FormVisibility).optional().describe('Form visibility setting'),
  password: z.string().optional().describe('Password for password-protected forms'),
  publishDate: z.string().datetime().optional().describe('Scheduled publish date'),
  unpublishDate: z.string().datetime().optional().describe('Scheduled unpublish date'),
  notificationEmails: z.array(z.string().email()).optional().describe('Email addresses to notify on submission')
});

const UpdatePublicationSettingsInputSchema = z.object({
  formId: z.string().describe('The ID of the form to update'),
  settings: FormPublicationSettingsSchema.partial().describe('Publication settings to update')
});

const GenerateEmbedCodeInputSchema = z.object({
  formId: z.string().describe('The ID of the form to generate embed code for'),
  theme: z.nativeEnum(EmbedTheme).optional().describe('Theme for the embedded form'),
  autoHeight: z.boolean().optional().describe('Whether to auto-adjust height'),
  width: z.string().optional().describe('Width of the embedded form'),
  height: z.string().optional().describe('Height of the embedded form'),
  hideHeader: z.boolean().optional().describe('Whether to hide the form header'),
  hideFooter: z.boolean().optional().describe('Whether to hide the form footer'),
  backgroundColor: z.string().optional().describe('Background color for the embed'),
  borderRadius: z.number().optional().describe('Border radius in pixels'),
  customCss: z.string().optional().describe('Custom CSS to apply')
});

const GenerateShareLinkInputSchema = z.object({
  formId: z.string().describe('The ID of the form to create a share link for'),
  type: z.nativeEnum(ShareLinkType).describe('Type of share link to generate'),
  customSlug: z.string().optional().describe('Custom slug for the share link'),
  password: z.string().optional().describe('Password protection for the link'),
  expirationHours: z.number().positive().optional().describe('Hours until the link expires'),
  maxUses: z.number().positive().optional().describe('Maximum number of uses for the link'),
  trackingEnabled: z.boolean().optional().describe('Whether to enable tracking for this link')
});

const GetFormAnalyticsInputSchema = z.object({
  formId: z.string().describe('The ID of the form to get analytics for'),
  period: z.enum(['day', 'week', 'month', 'year']).optional().describe('Time period for analytics data')
});

const BulkOperationInputSchema = z.object({
  operationType: z.enum(['publish', 'unpublish', 'update_settings', 'generate_links']).describe('Type of bulk operation'),
  formIds: z.array(z.string()).min(1).describe('Array of form IDs to operate on'),
  settings: z.record(z.any()).optional().describe('Settings to apply (for update_settings operation)')
});

export class FormSharingTool {
  private publicationService: FormPublicationService;

  constructor(apiClient: TallyApiClient) {
    this.publicationService = new FormPublicationService(apiClient);
  }

  /**
   * Publish a form with specified settings
   */
  async publishForm(input: z.infer<typeof PublishFormInputSchema>) {
    try {
      const { formId, visibility, password, publishDate, unpublishDate, notificationEmails } = 
        PublishFormInputSchema.parse(input);

      const options: {
        password?: string;
        publishDate?: string;
        unpublishDate?: string;
        notificationEmails?: string[];
      } = {};
      
      if (password !== undefined) options.password = password;
      if (publishDate !== undefined) options.publishDate = publishDate;
      if (unpublishDate !== undefined) options.unpublishDate = unpublishDate;
      if (notificationEmails !== undefined) options.notificationEmails = notificationEmails;

      const result = await this.publicationService.publishForm(formId, visibility, options);

      return {
        success: true,
        data: result,
        message: `Form ${formId} published successfully with ${result.visibility} visibility`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to publish form'
      };
    }
  }

  /**
   * Unpublish a form
   */
  async unpublishForm(input: { formId: string }) {
    try {
      const result = await this.publicationService.unpublishForm(input.formId);

      return {
        success: true,
        data: result,
        message: `Form ${input.formId} unpublished successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to unpublish form'
      };
    }
  }

  /**
   * Get publication settings for a form
   */
  async getPublicationSettings(input: { formId: string }) {
    try {
      const result = await this.publicationService.getPublicationSettings(input.formId);

      return {
        success: true,
        data: result,
        message: `Retrieved publication settings for form ${input.formId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get publication settings'
      };
    }
  }

  /**
   * Update publication settings for a form
   */
  async updatePublicationSettings(input: z.infer<typeof UpdatePublicationSettingsInputSchema>) {
    try {
      const { formId, settings } = UpdatePublicationSettingsInputSchema.parse(input);

      // Filter out undefined values from settings
      const filteredSettings = Object.fromEntries(
        Object.entries(settings).filter(([_, value]) => value !== undefined)
      );

      const result = await this.publicationService.updatePublicationSettings(formId, filteredSettings);

      return {
        success: true,
        data: result,
        message: `Updated publication settings for form ${formId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to update publication settings'
      };
    }
  }

  /**
   * Generate embed code for a form
   */
  async generateEmbedCode(input: z.infer<typeof GenerateEmbedCodeInputSchema>) {
    try {
      const { formId, ...embedSettings } = GenerateEmbedCodeInputSchema.parse(input);

      // Filter out undefined values from embedSettings
      const filteredEmbedSettings = Object.fromEntries(
        Object.entries(embedSettings).filter(([_, value]) => value !== undefined)
      );

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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to generate embed code'
      };
    }
  }

  /**
   * Generate a shareable link for a form
   */
  async generateShareLink(input: z.infer<typeof GenerateShareLinkInputSchema>) {
    try {
      const { formId, type, ...otherOptions } = GenerateShareLinkInputSchema.parse(input);

      // Filter out undefined values from otherOptions
      const filteredOptions = Object.fromEntries(
        Object.entries(otherOptions).filter(([_, value]) => value !== undefined)
      );

      const options: ShareLinkGenerationOptions = {
        type,
        ...filteredOptions
      };

      const result = await this.publicationService.generateShareLink(formId, options);

      return {
        success: true,
        data: result,
        message: `Generated ${result.type.toUpperCase()} share link for form ${formId}`,
        shareUrl: result.url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to generate share link'
      };
    }
  }

  /**
   * Get all share links for a form
   */
  async getShareLinks(input: { formId: string }) {
    try {
      const result = await this.publicationService.getShareLinks(input.formId);

      return {
        success: true,
        data: result,
        message: `Retrieved ${result.length} share links for form ${input.formId}`,
        count: result.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get share links'
      };
    }
  }

  /**
   * Deactivate a share link
   */
  async deactivateShareLink(input: { linkId: string }) {
    try {
      const result = await this.publicationService.deactivateShareLink(input.linkId);

      return {
        success: true,
        data: result,
        message: `Deactivated share link ${input.linkId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to deactivate share link'
      };
    }
  }

  /**
   * Get sharing statistics for a form
   */
  async getFormSharingStats(input: { formId: string }) {
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get sharing statistics'
      };
    }
  }

  /**
   * Get detailed analytics for a form
   */
  async getFormAnalytics(input: z.infer<typeof GetFormAnalyticsInputSchema>) {
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get form analytics'
      };
    }
  }

  /**
   * Perform bulk operations on multiple forms
   */
  async performBulkOperation(input: z.infer<typeof BulkOperationInputSchema>) {
    try {
      const { operationType, formIds, settings } = BulkOperationInputSchema.parse(input);

      const operation = {
        operationType,
        formIds,
        settings,
        status: 'pending' as const,
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to perform bulk operation'
      };
    }
  }

  /**
   * Validate if a form can be published
   */
  async validateFormForPublication(input: { formId: string }) {
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to validate form for publication'
      };
    }
  }
}

// Export the input schemas for use in MCP server registration
export {
  PublishFormInputSchema,
  UpdatePublicationSettingsInputSchema,
  GenerateEmbedCodeInputSchema,
  GenerateShareLinkInputSchema,
  GetFormAnalyticsInputSchema,
  BulkOperationInputSchema
}; 