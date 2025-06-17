import { FormSharingTool } from '../form-sharing-tool';
import { FormPublicationService } from '../../services/form-publication-service';
import { TallyApiClient } from '../../services/TallyApiClient';
import { FormVisibility, EmbedTheme, ShareLinkType } from '../../models/form-sharing-models';
jest.mock('../../services/form-publication-service');
jest.mock('../../services/TallyApiClient');
describe('FormSharingTool', () => {
    let formSharingTool;
    let mockPublicationService;
    let mockApiClient;
    const mockFormPublicationResult = {
        formId: 'form-123',
        visibility: FormVisibility.PUBLIC,
        isPublished: true,
        publishedAt: '2023-01-01T00:00:00Z',
        passwordRequired: false,
        notifyOnSubmission: true,
        notificationEmails: [],
        trackAnalytics: true,
        allowIndexing: false,
        requireCaptcha: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
    };
    const mockEmbedCodeResult = {
        html: '<iframe src="https://tally.so/embed/form-123" width="100%" height="500"></iframe>',
        javascript: '<script src="https://tally.so/js/embed.js" data-form="form-123"></script>',
        iframe: '<iframe src="https://tally.so/embed/form-123" width="100%" height="500" frameborder="0"></iframe>',
        settings: {
            formId: 'form-123',
            theme: EmbedTheme.LIGHT,
            autoHeight: true,
            width: '100%',
            height: '500px',
            borderRadius: 8,
            hideHeader: false,
            hideFooter: false,
            enableRedirect: true,
            showLoadingSpinner: true,
            animateOnLoad: true,
            sandbox: true
        }
    };
    const mockShareLinkResult = {
        id: 'link-123',
        url: 'https://tally.so/r/custom-slug',
        type: ShareLinkType.DIRECT,
        formId: 'form-123',
        isActive: true,
        passwordProtected: false,
        currentUses: 0,
        trackClicks: true,
        trackSubmissions: true,
        tags: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
    };
    const mockSharingStats = {
        formId: 'form-123',
        totalViews: 150,
        totalSubmissions: 25,
        conversionRate: 16.67,
        viewsByDate: {},
        submissionsByDate: {},
        shareLinksCount: 3,
        embedsCount: 2
    };
    const mockAnalyticsResult = {
        formId: 'form-123',
        period: 'week',
        metrics: {
            dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
            views: [10, 15, 20],
            submissions: [2, 3, 5],
            conversions: [20, 20, 25]
        },
        summary: {
            totalViews: 45,
            totalSubmissions: 10,
            averageConversion: 22.22
        }
    };
    const mockBulkOperationResult = {
        operationType: 'publish',
        formIds: ['form-1', 'form-2'],
        status: 'completed',
        completedCount: 2,
        failedCount: 0,
        errors: [],
        createdAt: '2023-01-01T00:00:00Z'
    };
    const mockValidationResult = {
        canPublish: true,
        formId: 'form-123',
        errors: [],
        warnings: [],
        checkedAt: '2023-01-01T00:00:00Z'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockApiClient = new TallyApiClient({});
        formSharingTool = new FormSharingTool(mockApiClient);
        mockPublicationService = formSharingTool.publicationService;
    });
    describe('constructor', () => {
        it('should create an instance with FormPublicationService', () => {
            expect(formSharingTool).toBeInstanceOf(FormSharingTool);
            expect(FormPublicationService).toHaveBeenCalledWith(mockApiClient);
        });
    });
    describe('publishForm', () => {
        it('should publish form successfully with minimal input', async () => {
            const input = { formId: 'form-123' };
            mockPublicationService.publishForm.mockResolvedValue(mockFormPublicationResult);
            const result = await formSharingTool.publishForm(input);
            expect(mockPublicationService.publishForm).toHaveBeenCalledWith('form-123', undefined, {});
            expect(result).toEqual({
                success: true,
                data: mockFormPublicationResult,
                message: 'Form form-123 published successfully with public visibility'
            });
        });
        it('should publish form with all optional parameters', async () => {
            const input = {
                formId: 'form-123',
                visibility: FormVisibility.PRIVATE,
                password: 'secret123',
                publishDate: '2023-01-01T00:00:00Z',
                unpublishDate: '2023-12-31T23:59:59Z',
                notificationEmails: ['admin@example.com', 'notify@example.com']
            };
            mockPublicationService.publishForm.mockResolvedValue({
                ...mockFormPublicationResult,
                visibility: FormVisibility.PRIVATE
            });
            const result = await formSharingTool.publishForm(input);
            expect(mockPublicationService.publishForm).toHaveBeenCalledWith('form-123', FormVisibility.PRIVATE, {
                password: 'secret123',
                publishDate: '2023-01-01T00:00:00Z',
                unpublishDate: '2023-12-31T23:59:59Z',
                notificationEmails: ['admin@example.com', 'notify@example.com']
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain('private visibility');
        });
        it('should handle publication errors', async () => {
            const input = { formId: 'form-123' };
            const error = new Error('Form not found');
            mockPublicationService.publishForm.mockRejectedValue(error);
            const result = await formSharingTool.publishForm(input);
            expect(result).toEqual({
                success: false,
                error: 'Form not found',
                message: 'Failed to publish form'
            });
        });
        it('should handle unknown errors', async () => {
            const input = { formId: 'form-123' };
            mockPublicationService.publishForm.mockRejectedValue('Unknown error');
            const result = await formSharingTool.publishForm(input);
            expect(result).toEqual({
                success: false,
                error: 'Unknown error occurred',
                message: 'Failed to publish form'
            });
        });
        it('should filter out undefined optional parameters', async () => {
            const input = {
                formId: 'form-123',
                visibility: FormVisibility.PUBLIC,
                password: undefined,
                publishDate: '2023-01-01T00:00:00Z',
                unpublishDate: undefined,
                notificationEmails: ['admin@example.com']
            };
            mockPublicationService.publishForm.mockResolvedValue(mockFormPublicationResult);
            await formSharingTool.publishForm(input);
            expect(mockPublicationService.publishForm).toHaveBeenCalledWith('form-123', FormVisibility.PUBLIC, {
                publishDate: '2023-01-01T00:00:00Z',
                notificationEmails: ['admin@example.com']
            });
        });
    });
    describe('unpublishForm', () => {
        it('should unpublish form successfully', async () => {
            const input = { formId: 'form-123' };
            const unpublishResult = { success: true, unpublishedAt: '2023-01-01T00:00:00Z' };
            mockPublicationService.unpublishForm.mockResolvedValue(unpublishResult);
            const result = await formSharingTool.unpublishForm(input);
            expect(mockPublicationService.unpublishForm).toHaveBeenCalledWith('form-123');
            expect(result).toEqual({
                success: true,
                data: unpublishResult,
                message: 'Form form-123 unpublished successfully'
            });
        });
        it('should handle unpublish errors', async () => {
            const input = { formId: 'form-123' };
            const error = new Error('Form not published');
            mockPublicationService.unpublishForm.mockRejectedValue(error);
            const result = await formSharingTool.unpublishForm(input);
            expect(result).toEqual({
                success: false,
                error: 'Form not published',
                message: 'Failed to unpublish form'
            });
        });
    });
    describe('getPublicationSettings', () => {
        it('should get publication settings successfully', async () => {
            const input = { formId: 'form-123' };
            const settings = { visibility: FormVisibility.PUBLIC, password: null };
            mockPublicationService.getPublicationSettings.mockResolvedValue(settings);
            const result = await formSharingTool.getPublicationSettings(input);
            expect(mockPublicationService.getPublicationSettings).toHaveBeenCalledWith('form-123');
            expect(result).toEqual({
                success: true,
                data: settings,
                message: 'Retrieved publication settings for form form-123'
            });
        });
        it('should handle get settings errors', async () => {
            const input = { formId: 'form-123' };
            const error = new Error('Settings not found');
            mockPublicationService.getPublicationSettings.mockRejectedValue(error);
            const result = await formSharingTool.getPublicationSettings(input);
            expect(result).toEqual({
                success: false,
                error: 'Settings not found',
                message: 'Failed to get publication settings'
            });
        });
    });
    describe('updatePublicationSettings', () => {
        it('should update publication settings successfully', async () => {
            const input = {
                formId: 'form-123',
                settings: {
                    visibility: FormVisibility.PRIVATE,
                    password: 'newpassword',
                    maxSubmissions: 100
                }
            };
            const updatedSettings = { ...input.settings, updatedAt: '2023-01-01T00:00:00Z' };
            mockPublicationService.updatePublicationSettings.mockResolvedValue(updatedSettings);
            const result = await formSharingTool.updatePublicationSettings(input);
            expect(mockPublicationService.updatePublicationSettings).toHaveBeenCalledWith('form-123', input.settings);
            expect(result).toEqual({
                success: true,
                data: updatedSettings,
                message: 'Updated publication settings for form form-123'
            });
        });
        it('should filter out undefined values from settings', async () => {
            const input = {
                formId: 'form-123',
                settings: {
                    visibility: FormVisibility.PRIVATE,
                    password: undefined,
                    maxSubmissions: 100,
                    notificationEmails: undefined
                }
            };
            const updatedSettings = { visibility: FormVisibility.PRIVATE, maxSubmissions: 100 };
            mockPublicationService.updatePublicationSettings.mockResolvedValue(updatedSettings);
            await formSharingTool.updatePublicationSettings(input);
            expect(mockPublicationService.updatePublicationSettings).toHaveBeenCalledWith('form-123', {
                visibility: FormVisibility.PRIVATE,
                maxSubmissions: 100
            });
        });
        it('should handle update settings errors', async () => {
            const input = { formId: 'form-123', settings: {} };
            const error = new Error('Update failed');
            mockPublicationService.updatePublicationSettings.mockRejectedValue(error);
            const result = await formSharingTool.updatePublicationSettings(input);
            expect(result).toEqual({
                success: false,
                error: 'Update failed',
                message: 'Failed to update publication settings'
            });
        });
    });
    describe('generateEmbedCode', () => {
        it('should generate embed code successfully with minimal input', async () => {
            const input = { formId: 'form-123' };
            mockPublicationService.generateEmbedCode.mockResolvedValue(mockEmbedCodeResult);
            const result = await formSharingTool.generateEmbedCode(input);
            expect(mockPublicationService.generateEmbedCode).toHaveBeenCalledWith('form-123', {});
            expect(result).toEqual({
                success: true,
                data: mockEmbedCodeResult,
                message: 'Generated embed code for form form-123',
                embedCode: {
                    html: mockEmbedCodeResult.html,
                    javascript: mockEmbedCodeResult.javascript,
                    iframe: mockEmbedCodeResult.iframe
                }
            });
        });
        it('should generate embed code with all options', async () => {
            const input = {
                formId: 'form-123',
                theme: EmbedTheme.DARK,
                autoHeight: false,
                width: '800px',
                height: '600px',
                hideHeader: true,
                hideFooter: false,
                backgroundColor: '#ffffff',
                borderRadius: 10,
                customCss: '.custom { color: red; }'
            };
            mockPublicationService.generateEmbedCode.mockResolvedValue(mockEmbedCodeResult);
            const result = await formSharingTool.generateEmbedCode(input);
            expect(mockPublicationService.generateEmbedCode).toHaveBeenCalledWith('form-123', {
                theme: EmbedTheme.DARK,
                autoHeight: false,
                width: '800px',
                height: '600px',
                hideHeader: true,
                hideFooter: false,
                backgroundColor: '#ffffff',
                borderRadius: 10,
                customCss: '.custom { color: red; }'
            });
            expect(result.success).toBe(true);
        });
        it('should handle embed code generation errors', async () => {
            const input = { formId: 'form-123' };
            const error = new Error('Embed generation failed');
            mockPublicationService.generateEmbedCode.mockRejectedValue(error);
            const result = await formSharingTool.generateEmbedCode(input);
            expect(result).toEqual({
                success: false,
                error: 'Embed generation failed',
                message: 'Failed to generate embed code'
            });
        });
    });
    describe('generateShareLink', () => {
        it('should generate share link successfully', async () => {
            const input = {
                formId: 'form-123',
                type: ShareLinkType.DIRECT,
                customSlug: 'my-form'
            };
            mockPublicationService.generateShareLink.mockResolvedValue(mockShareLinkResult);
            const result = await formSharingTool.generateShareLink(input);
            expect(mockPublicationService.generateShareLink).toHaveBeenCalledWith('form-123', {
                type: ShareLinkType.DIRECT,
                customSlug: 'my-form'
            });
            expect(result).toEqual({
                success: true,
                data: mockShareLinkResult,
                message: 'Generated DIRECT share link for form form-123',
                shareUrl: mockShareLinkResult.url
            });
        });
        it('should generate share link with security options', async () => {
            const input = {
                formId: 'form-123',
                type: ShareLinkType.SECURE,
                password: 'secret',
                expirationHours: 24,
                maxUses: 100,
                trackingEnabled: true
            };
            const secureShareLink = { ...mockShareLinkResult, type: ShareLinkType.SECURE };
            mockPublicationService.generateShareLink.mockResolvedValue(secureShareLink);
            const result = await formSharingTool.generateShareLink(input);
            expect(mockPublicationService.generateShareLink).toHaveBeenCalledWith('form-123', {
                type: ShareLinkType.SECURE,
                password: 'secret',
                expirationHours: 24,
                maxUses: 100,
                trackingEnabled: true
            });
            expect(result.message).toContain('SECURE share link');
        });
        it('should handle share link generation errors', async () => {
            const input = { formId: 'form-123', type: ShareLinkType.DIRECT };
            const error = new Error('Link generation failed');
            mockPublicationService.generateShareLink.mockRejectedValue(error);
            const result = await formSharingTool.generateShareLink(input);
            expect(result).toEqual({
                success: false,
                error: 'Link generation failed',
                message: 'Failed to generate share link'
            });
        });
    });
    describe('getShareLinks', () => {
        it('should get share links successfully', async () => {
            const input = { formId: 'form-123' };
            const shareLinks = [mockShareLinkResult, { ...mockShareLinkResult, id: 'link-456' }];
            mockPublicationService.getShareLinks.mockResolvedValue(shareLinks);
            const result = await formSharingTool.getShareLinks(input);
            expect(mockPublicationService.getShareLinks).toHaveBeenCalledWith('form-123');
            expect(result).toEqual({
                success: true,
                data: shareLinks,
                message: 'Retrieved 2 share links for form form-123',
                count: 2
            });
        });
        it('should handle get share links errors', async () => {
            const input = { formId: 'form-123' };
            const error = new Error('Failed to get links');
            mockPublicationService.getShareLinks.mockRejectedValue(error);
            const result = await formSharingTool.getShareLinks(input);
            expect(result).toEqual({
                success: false,
                error: 'Failed to get links',
                message: 'Failed to get share links'
            });
        });
    });
    describe('deactivateShareLink', () => {
        it('should deactivate share link successfully', async () => {
            const input = { linkId: 'link-123' };
            const deactivatedLink = { ...mockShareLinkResult, active: false };
            mockPublicationService.deactivateShareLink.mockResolvedValue(deactivatedLink);
            const result = await formSharingTool.deactivateShareLink(input);
            expect(mockPublicationService.deactivateShareLink).toHaveBeenCalledWith('link-123');
            expect(result).toEqual({
                success: true,
                data: deactivatedLink,
                message: 'Deactivated share link link-123'
            });
        });
        it('should handle deactivate share link errors', async () => {
            const input = { linkId: 'link-123' };
            const error = new Error('Link not found');
            mockPublicationService.deactivateShareLink.mockRejectedValue(error);
            const result = await formSharingTool.deactivateShareLink(input);
            expect(result).toEqual({
                success: false,
                error: 'Link not found',
                message: 'Failed to deactivate share link'
            });
        });
    });
    describe('getFormSharingStats', () => {
        it('should get sharing stats successfully', async () => {
            const input = { formId: 'form-123' };
            mockPublicationService.getFormSharingStats.mockResolvedValue(mockSharingStats);
            const result = await formSharingTool.getFormSharingStats(input);
            expect(mockPublicationService.getFormSharingStats).toHaveBeenCalledWith('form-123');
            expect(result).toEqual({
                success: true,
                data: mockSharingStats,
                message: 'Retrieved sharing statistics for form form-123',
                summary: {
                    totalViews: 150,
                    totalSubmissions: 25,
                    conversionRate: 16.67
                }
            });
        });
        it('should handle get sharing stats errors', async () => {
            const input = { formId: 'form-123' };
            const error = new Error('Stats not available');
            mockPublicationService.getFormSharingStats.mockRejectedValue(error);
            const result = await formSharingTool.getFormSharingStats(input);
            expect(result).toEqual({
                success: false,
                error: 'Stats not available',
                message: 'Failed to get sharing statistics'
            });
        });
    });
    describe('getFormAnalytics', () => {
        it('should get analytics with default period', async () => {
            const input = { formId: 'form-123' };
            mockPublicationService.getFormAnalytics.mockResolvedValue(mockAnalyticsResult);
            const result = await formSharingTool.getFormAnalytics(input);
            expect(mockPublicationService.getFormAnalytics).toHaveBeenCalledWith('form-123', 'week');
            expect(result).toEqual({
                success: true,
                data: mockAnalyticsResult,
                message: 'Retrieved week analytics for form form-123',
                period: 'week',
                dataPoints: 3
            });
        });
        it('should get analytics with custom period', async () => {
            const input = { formId: 'form-123', period: 'month' };
            const monthlyAnalytics = { ...mockAnalyticsResult, period: 'month' };
            mockPublicationService.getFormAnalytics.mockResolvedValue(monthlyAnalytics);
            const result = await formSharingTool.getFormAnalytics(input);
            expect(mockPublicationService.getFormAnalytics).toHaveBeenCalledWith('form-123', 'month');
            expect(result.period).toBe('month');
            expect(result.message).toContain('month analytics');
        });
        it('should handle get analytics errors', async () => {
            const input = { formId: 'form-123' };
            const error = new Error('Analytics not available');
            mockPublicationService.getFormAnalytics.mockRejectedValue(error);
            const result = await formSharingTool.getFormAnalytics(input);
            expect(result).toEqual({
                success: false,
                error: 'Analytics not available',
                message: 'Failed to get form analytics'
            });
        });
    });
    describe('performBulkOperation', () => {
        it('should perform bulk publish operation successfully', async () => {
            const input = {
                operationType: 'publish',
                formIds: ['form-1', 'form-2'],
                settings: { visibility: FormVisibility.PUBLIC }
            };
            mockPublicationService.performBulkOperation.mockResolvedValue(mockBulkOperationResult);
            const result = await formSharingTool.performBulkOperation(input);
            expect(mockPublicationService.performBulkOperation).toHaveBeenCalledWith({
                operationType: 'publish',
                formIds: ['form-1', 'form-2'],
                settings: { visibility: FormVisibility.PUBLIC },
                status: 'pending',
                completedCount: 0,
                failedCount: 0,
                errors: [],
                createdAt: expect.any(String)
            });
            expect(result).toEqual({
                success: true,
                data: mockBulkOperationResult,
                message: 'Bulk publish operation completed',
                summary: {
                    total: 2,
                    completed: 2,
                    failed: 0,
                    status: 'completed'
                }
            });
        });
        it('should perform bulk operation without settings', async () => {
            const input = {
                operationType: 'unpublish',
                formIds: ['form-1', 'form-2']
            };
            const unpublishResult = { ...mockBulkOperationResult, operationType: 'unpublish' };
            mockPublicationService.performBulkOperation.mockResolvedValue(unpublishResult);
            const result = await formSharingTool.performBulkOperation(input);
            expect(mockPublicationService.performBulkOperation).toHaveBeenCalledWith(expect.objectContaining({
                operationType: 'unpublish',
                formIds: ['form-1', 'form-2'],
                settings: undefined
            }));
            expect(result.message).toBe('Bulk unpublish operation completed');
        });
        it('should handle bulk operation errors', async () => {
            const input = {
                operationType: 'publish',
                formIds: ['form-1']
            };
            const error = new Error('Bulk operation failed');
            mockPublicationService.performBulkOperation.mockRejectedValue(error);
            const result = await formSharingTool.performBulkOperation(input);
            expect(result).toEqual({
                success: false,
                error: 'Bulk operation failed',
                message: 'Failed to perform bulk operation'
            });
        });
    });
    describe('validateFormForPublication', () => {
        it('should validate form successfully when form can be published', async () => {
            const input = { formId: 'form-123' };
            mockPublicationService.validateFormForPublication.mockResolvedValue(mockValidationResult);
            const result = await formSharingTool.validateFormForPublication(input);
            expect(mockPublicationService.validateFormForPublication).toHaveBeenCalledWith('form-123');
            expect(result).toEqual({
                success: true,
                data: mockValidationResult,
                message: 'Form form-123 is ready for publication',
                canPublish: true,
                issuesCount: 0
            });
        });
        it('should validate form with validation issues', async () => {
            const input = { formId: 'form-123' };
            const validationWithIssues = {
                ...mockValidationResult,
                canPublish: false,
                errors: ['No questions found'],
                warnings: ['Form title is empty']
            };
            mockPublicationService.validateFormForPublication.mockResolvedValue(validationWithIssues);
            const result = await formSharingTool.validateFormForPublication(input);
            expect(result).toEqual({
                success: true,
                data: validationWithIssues,
                message: 'Form form-123 has validation issues',
                canPublish: false,
                issuesCount: 2
            });
        });
        it('should handle validation errors', async () => {
            const input = { formId: 'form-123' };
            const error = new Error('Validation failed');
            mockPublicationService.validateFormForPublication.mockRejectedValue(error);
            const result = await formSharingTool.validateFormForPublication(input);
            expect(result).toEqual({
                success: false,
                error: 'Validation failed',
                message: 'Failed to validate form for publication'
            });
        });
    });
    describe('edge cases and error handling', () => {
        it('should handle empty form IDs array in bulk operation', async () => {
            const input = {
                operationType: 'publish',
                formIds: []
            };
            const result = await formSharingTool.performBulkOperation(input);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Array must contain at least 1 element(s)');
            expect(result.message).toBe('Failed to perform bulk operation');
        });
        it('should handle invalid email in notification emails', async () => {
            const input = {
                formId: 'form-123',
                notificationEmails: ['invalid-email']
            };
            const result = await formSharingTool.publishForm(input);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid email');
            expect(result.message).toBe('Failed to publish form');
        });
        it('should handle invalid datetime in publish date', async () => {
            const input = {
                formId: 'form-123',
                publishDate: 'invalid-date'
            };
            const result = await formSharingTool.publishForm(input);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid datetime');
            expect(result.message).toBe('Failed to publish form');
        });
    });
});
//# sourceMappingURL=form-sharing-tool.test.js.map