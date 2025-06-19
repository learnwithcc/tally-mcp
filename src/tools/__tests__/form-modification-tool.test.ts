import { FormModificationTool } from '../form-modification-tool';
import { TallyApiService } from '../../services';
import { TallyForm } from '../../models/tally-schemas';

// Mock the TallyApiService
jest.mock('../../services/tally-api-service');

describe('FormModificationTool', () => {
  let formModificationTool: FormModificationTool;
  let mockTallyApiService: jest.Mocked<TallyApiService>;

  const mockForm: TallyForm = {
    id: 'test-form-id',
    title: 'Test Form',
    description: 'A test form for modification',
    isPublished: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    submissionsCount: 5,
    status: 'published',
    url: 'https://tally.so/forms/test-form-id',
    embedUrl: 'https://tally.so/embed/test-form-id'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create the tool instance
    formModificationTool = new FormModificationTool({
      baseURL: 'https://api.tally.so',
      accessToken: 'test-token'
    });

    // Get the mocked service instance
    mockTallyApiService = (formModificationTool as any).tallyApiService;
  });

  describe('constructor', () => {
    it('should create an instance with correct name and description', () => {
      expect(formModificationTool.name).toBe('form_modification_tool');
      expect(formModificationTool.description).toBe('Modifies existing Tally forms through natural language commands');
    });

    it('should initialize with TallyApiService', () => {
      expect(mockTallyApiService).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should return error when formId is not provided', async () => {
      const result = await formModificationTool.execute({
        command: 'add a phone field'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Form ID is required');
      expect(result.errors).toContain('Missing form ID');
    });

    it('should return error when form is not found', async () => {
      mockTallyApiService.getForm.mockRejectedValue(new Error('Form not found'));

      const result = await formModificationTool.execute({
        command: 'add a phone field',
        formId: 'non-existent-form'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Form with ID non-existent-form not found');
      expect(result.errors).toContain('Form non-existent-form does not exist');
      expect(mockTallyApiService.getForm).toHaveBeenCalledWith('non-existent-form');
    });

    it('should successfully retrieve form when it exists', async () => {
      mockTallyApiService.getForm.mockResolvedValue(mockForm);

      const result = await formModificationTool.execute({
        command: 'add a phone field',
        formId: 'test-form-id'
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully retrieved form "Test Form"');
      expect(result.modifiedForm).toEqual(mockForm);
      expect(result.changes).toContain('Retrieved form: Test Form');
      expect(mockTallyApiService.getForm).toHaveBeenCalledWith('test-form-id');
    });

    it('should handle API errors gracefully', async () => {
      const apiError = new Error('API connection failed');
      mockTallyApiService.getForm.mockRejectedValue(apiError);

      const result = await formModificationTool.execute({
        command: 'add a phone field',
        formId: 'test-form-id'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Form with ID test-form-id not found');
      expect(result.errors).toContain('Form test-form-id does not exist');
    });
  });

  describe('getForm', () => {
    it('should return form when API call succeeds', async () => {
      mockTallyApiService.getForm.mockResolvedValue(mockForm);

      const result = await formModificationTool.getForm('test-form-id');

      expect(result).toEqual(mockForm);
      expect(mockTallyApiService.getForm).toHaveBeenCalledWith('test-form-id');
    });

    it('should return null when API call fails', async () => {
      mockTallyApiService.getForm.mockRejectedValue(new Error('API error'));

      const result = await formModificationTool.getForm('test-form-id');

      expect(result).toBeNull();
      expect(mockTallyApiService.getForm).toHaveBeenCalledWith('test-form-id');
    });
  });

  describe('getForms', () => {
    const mockFormsResponse = {
      forms: [mockForm],
      page: 1,
      limit: 10,
      hasMore: false
    };

    it('should return forms list when API call succeeds', async () => {
      mockTallyApiService.getForms.mockResolvedValue(mockFormsResponse);

      const result = await formModificationTool.getForms();

      expect(result).toEqual(mockFormsResponse);
      expect(mockTallyApiService.getForms).toHaveBeenCalledWith({});
    });

    it('should pass options to API service', async () => {
      mockTallyApiService.getForms.mockResolvedValue(mockFormsResponse);

      const options = { page: 2, limit: 5, workspaceId: 'workspace-123' };
      await formModificationTool.getForms(options);

      expect(mockTallyApiService.getForms).toHaveBeenCalledWith(options);
    });

    it('should return null when API call fails', async () => {
      mockTallyApiService.getForms.mockRejectedValue(new Error('API error'));

      const result = await formModificationTool.getForms();

      expect(result).toBeNull();
    });
  });

  describe('updateForm', () => {
    const mockFormConfig = {
      title: 'Updated Form Title',
      description: 'Updated description'
    };

    it('should return updated form when API call succeeds', async () => {
      const updatedForm = { ...mockForm, title: 'Updated Form Title' };
      mockTallyApiService.updateForm.mockResolvedValue(updatedForm);

      const result = await formModificationTool.updateForm('test-form-id', mockFormConfig);

      expect(result).toEqual(updatedForm);
      expect(mockTallyApiService.updateForm).toHaveBeenCalledWith('test-form-id', mockFormConfig);
    });

    it('should return null when API call fails', async () => {
      mockTallyApiService.updateForm.mockRejectedValue(new Error('API error'));

      const result = await formModificationTool.updateForm('test-form-id', mockFormConfig);

      expect(result).toBeNull();
    });
  });

  describe('patchForm', () => {
    const mockUpdates = { title: 'Patched Title' };

    it('should return patched form when API call succeeds', async () => {
      const patchedForm = { ...mockForm, title: 'Patched Title' };
      mockTallyApiService.patchForm.mockResolvedValue(patchedForm);

      const result = await formModificationTool.patchForm('test-form-id', mockUpdates);

      expect(result).toEqual(patchedForm);
      expect(mockTallyApiService.patchForm).toHaveBeenCalledWith('test-form-id', mockUpdates);
    });

    it('should return null when API call fails', async () => {
      mockTallyApiService.patchForm.mockRejectedValue(new Error('API error'));

      const result = await formModificationTool.patchForm('test-form-id', mockUpdates);

      expect(result).toBeNull();
    });
  });

  describe('validateConnection', () => {
    it('should return true when connection is valid', async () => {
      const mockFormsResponse = { forms: [], page: 1, limit: 1, hasMore: false };
      mockTallyApiService.getForms.mockResolvedValue(mockFormsResponse);

      const result = await formModificationTool.validateConnection();

      expect(result).toBe(true);
      expect(mockTallyApiService.getForms).toHaveBeenCalledWith({ limit: 1 });
    });

    it('should return false when connection fails', async () => {
      mockTallyApiService.getForms.mockRejectedValue(new Error('Connection failed'));

      const result = await formModificationTool.validateConnection();

      expect(result).toBe(false);
    });

    it('should return false when API returns null', async () => {
      // Mock the getForms method to simulate the tool's internal logic returning null
      jest.spyOn(formModificationTool, 'getForms').mockResolvedValue(null);

      const result = await formModificationTool.validateConnection();

      expect(result).toBe(false);
    });
  });
}); 