import { FormCreationTool } from '../form-creation-tool';
import { TallyApiService } from '../../services/tally-api-service';
import { FormConfig, QuestionType } from '../../models/form-config';
import { TallyApiClientConfig } from '../../services/TallyApiClient';
import { NlpService } from '../../services/nlp-service';

// Mock the TallyApiClient to capture the actual payload being sent
jest.mock('../../services/TallyApiClient');
jest.mock('../../services/nlp-service');

describe('FormCreationTool - BlockBuilder Integration', () => {
  let tool: FormCreationTool;
  let mockApiClientConfig: TallyApiClientConfig;
  let capturedPayload: any;
  let mockNlpService: jest.Mocked<NlpService>;

  beforeEach(() => {
    mockApiClientConfig = {
      accessToken: 'test-token',
      baseURL: 'https://api.tally.so'
    };

    // Clear captured payload
    capturedPayload = null;

    // Mock the TallyApiClient constructor and requestWithValidation method
    const MockTallyApiClient = require('../../services/TallyApiClient').TallyApiClient;
    MockTallyApiClient.mockImplementation(() => ({
      requestWithValidation: jest.fn().mockImplementation((method, endpoint, schema, payload) => {
        capturedPayload = payload;
        return Promise.resolve({
          id: 'test-form-id',
          url: 'https://tally.so/forms/test-form-id',
          title: 'Test Form',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        });
      })
    }));

    tool = new FormCreationTool(mockApiClientConfig);
    mockNlpService = (tool as any).nlpService as jest.Mocked<NlpService>;
  });

  describe('BlockBuilder payload generation', () => {
    it('should generate correct Tally API payload with FORM_TITLE and question blocks', async () => {
      // Arrange - Mock NLP service to return a detailed form config
      const detailedFormConfig: FormConfig = {
        title: 'Contact Form',
        description: 'Please fill out this contact form',
        questions: [
          {
            id: 'name',
            type: QuestionType.TEXT,
            label: 'Full Name',
            required: true,
            placeholder: 'Enter your full name'
          },
          {
            id: 'email',
            type: QuestionType.EMAIL,
            label: 'Email Address',
            required: true,
            placeholder: 'Enter your email'
          },
          {
            id: 'department',
            type: QuestionType.DROPDOWN,
            label: 'Department',
            required: false,
            options: [
              { id: 'sales', text: 'Sales' },
              { id: 'support', text: 'Support' },
              { id: 'engineering', text: 'Engineering' }
            ]
          }
        ],
        settings: {
          submissionBehavior: 'message' as any
        }
      };

      mockNlpService.generateFormConfig.mockReturnValue(detailedFormConfig);

      // Act
      await tool.execute({ 
        naturalLanguagePrompt: 'Create a contact form', 
        formTitle: 'Contact Form'
      });

      // Assert - verify the payload structure
      expect(capturedPayload).toBeDefined();
      expect(capturedPayload.status).toBe('PUBLISHED');
      expect(capturedPayload.name).toBe('Contact Form');
      expect(capturedPayload.blocks).toBeDefined();
      expect(Array.isArray(capturedPayload.blocks)).toBe(true);

      const blocks = capturedPayload.blocks;
      
      // Debug: log the actual blocks to understand the structure
      console.log('Generated blocks:', JSON.stringify(blocks, null, 2));
      
      // Should have: 1 FORM_TITLE + question blocks (each question generates TITLE + input blocks)
      expect(blocks.length).toBeGreaterThanOrEqual(4); // At least title + some question blocks

      // First block should be FORM_TITLE
      const titleBlock = blocks[0];
      expect(titleBlock.type).toBe('FORM_TITLE');
      expect(titleBlock.groupType).toBe('TEXT');
      expect(titleBlock.payload.html).toBe('Contact Form');
      expect(titleBlock.uuid).toMatch(/[0-9a-f-]{36}/);
      expect(titleBlock.groupUuid).toMatch(/[0-9a-f-]{36}/);

      // Verify question blocks are present
      const questionBlocks = blocks.filter(block => 
        ['TITLE', 'INPUT_TEXT', 'INPUT_EMAIL', 'DROPDOWN_OPTION'].includes(block.type)
      );
      expect(questionBlocks.length).toBeGreaterThan(0);

      // Check that each question block has proper structure
      questionBlocks.forEach(block => {
        expect(block.uuid).toMatch(/[0-9a-f-]{36}/);
        expect(block.groupUuid).toMatch(/[0-9a-f-]{36}/);
        expect(block.type).toBeDefined();
        expect(block.groupType).toBeDefined();
        expect(block.payload).toBeDefined();
      });
    });

    it('should handle forms with only title block', async () => {
      // Arrange - Mock NLP service to return a simple form config
      const simpleFormConfig: FormConfig = {
        title: 'Simple Form',
        questions: [],
        settings: {
          submissionBehavior: 'message' as any
        }
      };

      mockNlpService.generateFormConfig.mockReturnValue(simpleFormConfig);

      // Act
      await tool.execute({ 
        naturalLanguagePrompt: 'Create a simple form', 
        formTitle: 'Simple Form'
      });

      // Assert
      expect(capturedPayload).toBeDefined();
      expect(capturedPayload.blocks).toBeDefined();
      expect(capturedPayload.blocks.length).toBeGreaterThanOrEqual(1);

      const titleBlock = capturedPayload.blocks[0];
      expect(titleBlock.type).toBe('FORM_TITLE');
      expect(titleBlock.payload.html).toBe('Simple Form');
    });

    it('should generate correct blocks for different question types', async () => {
      // Mock NLP service to return a form with various question types
      const multiTypeFormConfig: FormConfig = {
        title: 'Survey Form',
        questions: [
          {
            id: 'q1',
            type: QuestionType.TEXT,
            label: 'Text Question',
            required: true
          },
          {
            id: 'q2',
            type: QuestionType.MULTIPLE_CHOICE,
            label: 'Multiple Choice',
            required: false,
            options: [
              { id: 'a', text: 'Option A' },
              { id: 'b', text: 'Option B' }
            ]
          }
        ],
        settings: {
          submissionBehavior: 'message' as any
        }
      };

      mockNlpService.generateFormConfig.mockReturnValue(multiTypeFormConfig);

      // Act
      const result = await tool.execute({
        naturalLanguagePrompt: 'Create a survey with multiple question types'
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.formUrl).toBeDefined();
      expect(capturedPayload).toBeDefined();
      expect(capturedPayload.blocks).toBeDefined();
      expect(capturedPayload.blocks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('API endpoint integration', () => {
    it('should call the correct endpoint with POST method', async () => {
      // Mock NLP service
      mockNlpService.generateFormConfig.mockReturnValue({
        title: 'Test Form',
        questions: [],
        settings: { submissionBehavior: 'message' as any }
      });

      // Act
      await tool.execute({
        naturalLanguagePrompt: 'Create a test form'
      });

      // Assert - verify the TallyApiClient was called correctly
      const tallyApiService = (tool as any).tallyApiService as TallyApiService;
      const apiClient = (tallyApiService as any).apiClient;
      
      expect(apiClient.requestWithValidation).toHaveBeenCalledWith(
        'POST',
        '/forms',
        expect.any(Object), // TallyFormSchema
        expect.any(Object)  // payload
      );
    });
  });
}); 