import { FormCreationTool, FormCreationArgs, FormCreationResult } from '../form-creation-tool';
import { NlpService, TallyApiService, TemplateService } from '../../services';
import { FormConfig, QuestionType } from '../../models/form-config';
import { TallyApiClientConfig } from '../../services/TallyApiClient';
import { buildBlocksForFormWithMapping, generateEnrichedFieldConfigurations } from '../../utils';

// Mock the services
jest.mock('../../services/nlp-service');
jest.mock('../../services/tally-api-service');
jest.mock('../../services/template-service');

// Mock the utility functions
jest.mock('../../utils', () => ({
  buildBlocksForFormWithMapping: jest.fn(),
  generateEnrichedFieldConfigurations: jest.fn(),
}));

describe('FormCreationTool', () => {
  let tool: FormCreationTool;
  let mockNlpService: jest.Mocked<NlpService>;
  let mockTallyApiService: jest.Mocked<TallyApiService>;
  let mockTemplateService: jest.Mocked<TemplateService>;
  let mockApiClientConfig: TallyApiClientConfig;

  const mockFormConfig: FormConfig = {
    title: 'Test Form',
    description: 'A test form',
    questions: [
      {
        id: 'q1',
        type: QuestionType.TEXT,
        label: 'Name',
        required: true
      }
    ],
    settings: {
      submissionBehavior: 'message' as any
    }
  };

  const mockCreatedForm = {
    id: 'form123',
    url: 'https://tally.so/forms/form123/edit',
    title: 'Test Form',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockBlockResult = {
    fieldIds: ['field1', 'field2'],
    fieldBlockMapping: { q1: 'field1' }
  };

  const mockEnrichedFieldConfigurations = [
    { fieldId: 'field1', type: 'text', validation: {} }
  ];

  beforeEach(() => {
    mockApiClientConfig = {
      accessToken: 'test-token',
      baseURL: 'https://api.tally.so'
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Reset mockFormConfig to original state to prevent test interference
    mockFormConfig.title = 'Test Form';

    // Setup utility function mocks
    (buildBlocksForFormWithMapping as jest.Mock).mockReturnValue(mockBlockResult);
    (generateEnrichedFieldConfigurations as jest.Mock).mockReturnValue(mockEnrichedFieldConfigurations);

    // Create tool instance
    tool = new FormCreationTool(mockApiClientConfig);

    // Get mocked instances
    mockNlpService = (tool as any).nlpService as jest.Mocked<NlpService>;
    mockTallyApiService = (tool as any).tallyApiService as jest.Mocked<TallyApiService>;
    mockTemplateService = (tool as any).templateService as jest.Mocked<TemplateService>;
  });

  describe('constructor', () => {
    it('should create an instance with correct name and description', () => {
      expect(tool.name).toBe('form_creation_tool');
      expect(tool.description).toBe('Creates a Tally form from a natural language description or a template.');
    });

    it('should initialize all required services', () => {
      expect(NlpService).toHaveBeenCalledTimes(1);
      expect(TallyApiService).toHaveBeenCalledWith(mockApiClientConfig);
      expect(TemplateService).toHaveBeenCalledTimes(1);
    });
  });

  describe('execute - template creation', () => {
    const templateArgs: FormCreationArgs = {
      templateId: 'template123',
      formTitle: 'Custom Title'
    };

    it('should create form from template successfully', async () => {
      // Arrange
      mockTemplateService.instantiateTemplate.mockReturnValue(mockFormConfig);
      mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);

      // Act
      const result: FormCreationResult = await tool.execute(templateArgs);

      // Assert
      expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith(
        'template123',
        'Custom Title'
      );
      expect(mockTallyApiService.createForm).toHaveBeenCalledWith(mockFormConfig);
      expect(result).toEqual({
        formUrl: 'https://tally.so/forms/form123/edit',
        formId: 'form123',
        formConfig: mockFormConfig,
        generatedFieldIds: ['field1', 'field2'],
        enrichedFieldConfigurations: [{ fieldId: 'field1', type: 'text', validation: {} }]
      });
    });

    it('should create form from template without custom title', async () => {
      // Arrange
      const argsWithoutTitle = { templateId: 'template123' };
      mockTemplateService.instantiateTemplate.mockReturnValue(mockFormConfig);
      mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);

      // Act
      const result = await tool.execute(argsWithoutTitle);

      // Assert
      expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith(
        'template123',
        undefined
      );
      expect(result.formConfig).toEqual(mockFormConfig);
    });

    it('should throw error when template not found', async () => {
      // Arrange
      mockTemplateService.instantiateTemplate.mockReturnValue(undefined);

      // Act & Assert
      await expect(tool.execute(templateArgs)).rejects.toThrow(
        "Template with ID 'template123' not found."
      );
      expect(mockTallyApiService.createForm).not.toHaveBeenCalled();
    });
  });

  describe('execute - natural language creation', () => {
    const nlpArgs: FormCreationArgs = {
      naturalLanguagePrompt: 'Create a contact form with name and email fields',
      formTitle: 'Contact Form'
    };

    it('should create form from natural language prompt successfully', async () => {
      // Arrange
      mockNlpService.generateFormConfig.mockReturnValue(mockFormConfig);
      mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);

      // Act
      const result = await tool.execute(nlpArgs);

      // Assert
      expect(mockNlpService.generateFormConfig).toHaveBeenCalledWith(
        'Create a contact form with name and email fields'
      );
      expect(mockTallyApiService.createForm).toHaveBeenCalledWith({
        ...mockFormConfig,
        title: 'Contact Form'
      });
      expect(result).toEqual({
        formUrl: 'https://tally.so/forms/form123/edit',
        formId: 'form123',
        formConfig: {
          ...mockFormConfig,
          title: 'Contact Form'
        },
        generatedFieldIds: ['field1', 'field2'],
        enrichedFieldConfigurations: [{ fieldId: 'field1', type: 'text', validation: {} }]
      });
    });

    it('should create form without custom title override', async () => {
      // Arrange
      const argsWithoutTitle = {
        naturalLanguagePrompt: 'Create a survey form'
      };
      // Create a fresh mock config for this test to avoid interference
      const freshMockFormConfig = { ...mockFormConfig };
      mockNlpService.generateFormConfig.mockReturnValue(freshMockFormConfig);
      mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);

      // Act
      const result = await tool.execute(argsWithoutTitle);

      // Assert
      expect(mockNlpService.generateFormConfig).toHaveBeenCalledWith('Create a survey form');
      expect(mockTallyApiService.createForm).toHaveBeenCalledWith(freshMockFormConfig);
      expect(result.formConfig.title).toBe('Test Form'); // Original title preserved
      expect(result.formConfig).toBe(freshMockFormConfig); // The same object reference is returned
    });
  });

  describe('execute - error scenarios', () => {
    it('should throw error when neither templateId nor naturalLanguagePrompt provided', async () => {
      // Arrange
      const emptyArgs: FormCreationArgs = {};

      // Act & Assert
      await expect(tool.execute(emptyArgs)).rejects.toThrow(
        'One of formConfig, naturalLanguagePrompt, or templateId must be provided.'
      );
      expect(mockTemplateService.instantiateTemplate).not.toHaveBeenCalled();
      expect(mockNlpService.generateFormConfig).not.toHaveBeenCalled();
      expect(mockTallyApiService.createForm).not.toHaveBeenCalled();
    });

    it('should propagate API errors from createForm', async () => {
      // Arrange
      const nlpArgs = { naturalLanguagePrompt: 'Test prompt' };
      const apiError = new Error('API call failed');
      mockNlpService.generateFormConfig.mockReturnValue(mockFormConfig);
      mockTallyApiService.createForm.mockRejectedValue(apiError);

      // Act & Assert
      await expect(tool.execute(nlpArgs)).rejects.toThrow('API call failed');
      expect(mockNlpService.generateFormConfig).toHaveBeenCalled();
      expect(mockTallyApiService.createForm).toHaveBeenCalled();
    });

    it('should handle both templateId and naturalLanguagePrompt (prioritize template)', async () => {
      // Arrange
      const bothArgs: FormCreationArgs = {
        templateId: 'template123',
        naturalLanguagePrompt: 'This should be ignored',
        formTitle: 'Mixed Args Form'
      };
      mockTemplateService.instantiateTemplate.mockReturnValue(mockFormConfig);
      mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);

      // Act
      const result = await tool.execute(bothArgs);

      // Assert
      expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith(
        'template123',
        'Mixed Args Form'
      );
      expect(mockNlpService.generateFormConfig).not.toHaveBeenCalled();
      expect(result.formConfig).toEqual(mockFormConfig);
    });
  });

  describe('execute - edge cases', () => {
    it('should handle empty string values gracefully', async () => {
      // Arrange
      const argsWithEmptyStrings: FormCreationArgs = {
        templateId: '',
        naturalLanguagePrompt: 'Create a form',
        formTitle: ''
      };
      // Create a fresh mock config for this test to avoid interference
      const freshMockFormConfig = { ...mockFormConfig };
      mockNlpService.generateFormConfig.mockReturnValue(freshMockFormConfig);
      mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);

      // Act
      const result = await tool.execute(argsWithEmptyStrings);

      // Assert
      // Empty templateId should fall through to NLP
      expect(mockNlpService.generateFormConfig).toHaveBeenCalledWith('Create a form');
      expect(mockTemplateService.instantiateTemplate).not.toHaveBeenCalled();
      expect(result.formConfig.title).toBe('Test Form'); // Empty title is falsy, so original title preserved
    });

    it('should handle null/undefined form URL from API', async () => {
      // Arrange
      const nlpArgs = { naturalLanguagePrompt: 'Test prompt' };
      const formWithoutUrl = { title: 'Test Form', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' };
      mockNlpService.generateFormConfig.mockReturnValue(mockFormConfig);
      mockTallyApiService.createForm.mockResolvedValue(formWithoutUrl);

      // Act
      const result = await tool.execute(nlpArgs);

      // Assert
      expect(result.formUrl).toBeUndefined();
      expect(result.formId).toBeUndefined();
      expect(result.formConfig).toEqual(mockFormConfig);
    });
  });

  describe('logging', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log execution arguments', async () => {
      // Arrange
      const args = { naturalLanguagePrompt: 'Test logging' };
      mockNlpService.generateFormConfig.mockReturnValue(mockFormConfig);
      mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);

      // Act
      await tool.execute(args);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Executing form creation tool with args: {"naturalLanguagePrompt":"Test logging"}'
      );
    });
  });
}); 