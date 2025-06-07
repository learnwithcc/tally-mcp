import { FormPublicationService } from '../form-publication-service';
import { TallyApiClient } from '../TallyApiClient';
import { 
  FormVisibility, 
  EmbedTheme, 
  ShareLinkType,
  FormPublicationSettings,
  EmbedCodeSettings,
  ShareLink
} from '../../models/form-sharing-models';

// Mock the TallyApiClient
jest.mock('../TallyApiClient');

describe('FormPublicationService', () => {
  let service: FormPublicationService;
  let mockApiClient: jest.Mocked<TallyApiClient>;

  beforeEach(() => {
    mockApiClient = new TallyApiClient({
      accessToken: 'test-token',
      baseURL: 'https://api.tally.so'
    }) as jest.Mocked<TallyApiClient>;
    
    service = new FormPublicationService(mockApiClient);
  });

  describe('getPublicationSettings', () => {
    it('should return default publication settings for a form', async () => {
      const formId = 'test-form-id';
      const result = await service.getPublicationSettings(formId);

      expect(result).toMatchObject({
        formId,
        visibility: FormVisibility.PRIVATE,
        isPublished: false,
        notificationEmails: [],
        trackAnalytics: true,
        allowIndexing: false,
        requireCaptcha: false
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('updatePublicationSettings', () => {
    it('should update publication settings for a form', async () => {
      const formId = 'test-form-id';
      const updates = {
        visibility: FormVisibility.PUBLIC,
        isPublished: true,
        notificationEmails: ['test@example.com']
      };

      const result = await service.updatePublicationSettings(formId, updates);

      expect(result).toMatchObject({
        formId,
        visibility: FormVisibility.PUBLIC,
        isPublished: true,
        notificationEmails: ['test@example.com']
      });
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('publishForm', () => {
    it('should publish a form with default public visibility', async () => {
      const formId = 'test-form-id';
      const result = await service.publishForm(formId);

      expect(result).toMatchObject({
        formId,
        visibility: FormVisibility.PUBLIC,
        isPublished: true,
        passwordRequired: false
      });
      expect(result.publishedAt).toBeDefined();
    });

    it('should publish a form with password protection', async () => {
      const formId = 'test-form-id';
      const password = 'secret123';
      
      const result = await service.publishForm(formId, FormVisibility.PASSWORD_PROTECTED, {
        password,
        notificationEmails: ['admin@example.com']
      });

      expect(result).toMatchObject({
        formId,
        visibility: FormVisibility.PASSWORD_PROTECTED,
        isPublished: true,
        passwordRequired: true,
        password,
        notificationEmails: ['admin@example.com']
      });
    });
  });

  describe('unpublishForm', () => {
    it('should unpublish a form', async () => {
      const formId = 'test-form-id';
      const result = await service.unpublishForm(formId);

      expect(result).toMatchObject({
        formId,
        isPublished: false
      });
      expect(result.unpublishedAt).toBeDefined();
    });
  });

  describe('generateEmbedCode', () => {
    it('should generate embed code with default settings', async () => {
      const formId = 'test-form-id';
      const result = await service.generateEmbedCode(formId);

      expect(result.settings).toMatchObject({
        formId,
        theme: EmbedTheme.LIGHT,
        autoHeight: true,
        width: '100%',
        borderRadius: 8
      });

      expect(result.html).toContain('iframe');
      expect(result.html).toContain(`https://tally.so/r/${formId}`);
      expect(result.javascript).toContain('iframe');
      expect(result.iframe).toContain('iframe');
    });

    it('should generate embed code with custom settings', async () => {
      const formId = 'test-form-id';
      const customSettings = {
        theme: EmbedTheme.DARK,
        width: '500px',
        height: '600px',
        hideHeader: true,
        backgroundColor: '#000000'
      };

      const result = await service.generateEmbedCode(formId, customSettings);

      expect(result.settings).toMatchObject({
        formId,
        theme: EmbedTheme.DARK,
        width: '500px',
        height: '600px',
        hideHeader: true,
        backgroundColor: '#000000'
      });

      expect(result.html).toContain('height="600px"');
      expect(result.html).toContain('hideHeader=1');
    });
  });

  describe('generateShareLink', () => {
    it('should generate a standard share link', async () => {
      const formId = 'test-form-id';
      const options = {
        type: ShareLinkType.STANDARD,
        trackingEnabled: true
      };

      const result = await service.generateShareLink(formId, options);

      expect(result).toMatchObject({
        formId,
        type: ShareLinkType.STANDARD,
        isActive: true,
        passwordProtected: false,
        currentUses: 0,
        trackClicks: true,
        trackSubmissions: true
      });
      expect(result.url).toContain(`https://tally.so/r/${formId}`);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should generate a password-protected share link with expiration', async () => {
      const formId = 'test-form-id';
      const options = {
        type: ShareLinkType.STANDARD,
        password: 'secret123',
        expirationHours: 24,
        maxUses: 100
      };

      const result = await service.generateShareLink(formId, options);

      expect(result).toMatchObject({
        formId,
        type: ShareLinkType.STANDARD,
        passwordProtected: true,
        password: 'secret123',
        maxUses: 100
      });
      expect(result.expiresAt).toBeDefined();
    });

    it('should generate a share link with custom slug', async () => {
      const formId = 'test-form-id';
      const options = {
        type: ShareLinkType.STANDARD,
        customSlug: 'my-custom-form'
      };

      const result = await service.generateShareLink(formId, options);

      expect(result.url).toBe('https://tally.so/s/my-custom-form');
    });
  });

  describe('getShareLinks', () => {
    it('should return empty array for forms with no share links', async () => {
      const formId = 'test-form-id';
      const result = await service.getShareLinks(formId);

      expect(result).toEqual([]);
    });
  });

  describe('updateShareLink', () => {
    it('should update a share link', async () => {
      const linkId = 'test-link-id';
      const updates = {
        isActive: false,
        title: 'Updated Link'
      };

      const result = await service.updateShareLink(linkId, updates);

      expect(result).toMatchObject({
        id: linkId,
        isActive: false,
        title: 'Updated Link'
      });
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('deactivateShareLink', () => {
    it('should deactivate a share link', async () => {
      const linkId = 'test-link-id';
      const result = await service.deactivateShareLink(linkId);

      expect(result).toMatchObject({
        id: linkId,
        isActive: false
      });
    });
  });

  describe('getFormSharingStats', () => {
    it('should return default sharing statistics', async () => {
      const formId = 'test-form-id';
      const result = await service.getFormSharingStats(formId);

      expect(result).toMatchObject({
        formId,
        totalViews: 0,
        uniqueViews: 0,
        totalSubmissions: 0,
        conversionRate: 0,
        topReferrers: [],
        topCountries: [],
        deviceStats: {
          desktop: 0,
          mobile: 0,
          tablet: 0
        }
      });
      expect(result.lastUpdated).toBeDefined();
    });
  });

  describe('getFormAnalytics', () => {
    it('should return analytics data for different periods', async () => {
      const formId = 'test-form-id';
      
      const weekResult = await service.getFormAnalytics(formId, 'week');
      expect(weekResult.period).toBe('week');
      expect(weekResult.metrics.dates).toHaveLength(7);

      const monthResult = await service.getFormAnalytics(formId, 'month');
      expect(monthResult.period).toBe('month');
      expect(monthResult.metrics.dates).toHaveLength(30);
    });
  });

  describe('performBulkOperation', () => {
    it('should perform bulk publish operation', async () => {
      const operation = {
        operationType: 'publish' as const,
        formIds: ['form1', 'form2', 'form3'],
        status: 'pending' as const,
        completedCount: 0,
        failedCount: 0,
        errors: [],
        createdAt: new Date().toISOString()
      };

      const result = await service.performBulkOperation(operation);

      expect(result.status).toBe('completed');
      expect(result.completedCount).toBe(3);
      expect(result.failedCount).toBe(0);
      expect(result.completedAt).toBeDefined();
    });

    it('should handle bulk operation failures', async () => {
      // Mock the publishForm method to throw an error
      jest.spyOn(service, 'publishForm').mockRejectedValue(new Error('API Error'));

      const operation = {
        operationType: 'publish' as const,
        formIds: ['form1', 'form2'],
        status: 'pending' as const,
        completedCount: 0,
        failedCount: 0,
        errors: [],
        createdAt: new Date().toISOString()
      };

      const result = await service.performBulkOperation(operation);

      expect(result.status).toBe('failed');
      expect(result.completedCount).toBe(0);
      expect(result.failedCount).toBe(2);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('validateFormForPublication', () => {
    it('should validate a form successfully', async () => {
      const formId = 'test-form-id';
      const mockForm = {
        id: formId,
        title: 'Test Form',
        blocks: [
          { type: 'INPUT_TEXT', id: '1' },
          { type: 'INPUT_EMAIL', id: '2' }
        ]
      };

      mockApiClient.getForm.mockResolvedValue(mockForm as any);

      const result = await service.validateFormForPublication(formId);

      expect(result.isValid).toBe(true);
      expect(result.canPublish).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockApiClient.getForm).toHaveBeenCalledWith(formId);
    });

    it('should return validation errors for invalid form', async () => {
      const formId = 'test-form-id';
      const mockForm = {
        id: formId,
        title: '',
        blocks: []
      };

      mockApiClient.getForm.mockResolvedValue(mockForm as any);

      const result = await service.validateFormForPublication(formId);

      expect(result.isValid).toBe(false);
      expect(result.canPublish).toBe(false);
      expect(result.errors).toContain('Form must have at least one question');
      expect(result.warnings).toContain('Form should have a title for better SEO');
    });

    it('should handle form not found', async () => {
      const formId = 'nonexistent-form';
      mockApiClient.getForm.mockRejectedValue(new Error('Form not found'));

      const result = await service.validateFormForPublication(formId);

      expect(result.isValid).toBe(false);
      expect(result.canPublish).toBe(false);
      expect(result.errors[0]).toContain('Validation failed');
    });

    it('should handle API errors gracefully', async () => {
      const formId = 'test-form-id';
      mockApiClient.getForm.mockRejectedValue(new Error('API Error'));

      const result = await service.validateFormForPublication(formId);

      expect(result.isValid).toBe(false);
      expect(result.canPublish).toBe(false);
      expect(result.errors[0]).toContain('Validation failed');
    });
  });
}); 