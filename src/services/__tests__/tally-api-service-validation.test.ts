import { TallyApiService } from '../tally-api-service';
import { FormConfig, QuestionType, SubmissionBehavior } from '../../models/form-config';
import { TallyApiClientConfig } from '../TallyApiClient';
import { 
  TallyFormCreatePayloadSchema,
  TallyFormUpdatePayloadSchema,
  TallyBlockSchema,
  TallyBlockTypeSchema,
  TallyGroupTypeSchema
} from '../../models/tally-schemas';
import { ZodError } from 'zod';

// Mock the TallyApiClient
jest.mock('../TallyApiClient');

describe('TallyApiService - Schema Validation', () => {
  let service: TallyApiService;
  let mockApiClientConfig: TallyApiClientConfig;

  // Default form settings for tests
  const defaultFormSettings = {
    submissionBehavior: SubmissionBehavior.MESSAGE,
    showProgressBar: false,
    allowDrafts: false,
  };

  beforeEach(() => {
    mockApiClientConfig = {
      accessToken: 'test-token',
      baseURL: 'https://api.tally.so'
    };

    service = new TallyApiService(mockApiClientConfig);

    // Mock the requestWithValidation method to avoid actual API calls
    const mockApiClient = (service as any).apiClient;
    mockApiClient.requestWithValidation = jest.fn().mockResolvedValue({
      id: 'test-form-id',
      title: 'Test Form',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe('createForm payload validation', () => {
    it('validates a simple form with title and text question', async () => {
      const formConfig: FormConfig = {
        title: 'Simple Test Form',
        description: 'A test form',
        settings: defaultFormSettings,
        questions: [
          {
            id: 'q1',
            type: QuestionType.TEXT,
            label: 'Your name',
            required: true,
            placeholder: 'Enter your name'
          }
        ]
      };

      // This should not throw validation errors
      await expect(service.createForm(formConfig)).resolves.toBeDefined();

      const mockApiClient = (service as any).apiClient;
      const capturedPayload = mockApiClient.requestWithValidation.mock.calls[0][3];

      // Validate the payload structure
      expect(() => TallyFormCreatePayloadSchema.parse(capturedPayload)).not.toThrow();
      expect(capturedPayload.name).toBe('Simple Test Form');
      expect(capturedPayload.status).toBe('PUBLISHED');
      expect(capturedPayload.blocks).toHaveLength(3); // FORM_TITLE + TITLE + INPUT_TEXT
    });

    it('validates a complex form with multiple question types', async () => {
      const formConfig: FormConfig = {
        title: 'Complex Test Form',
        description: 'A complex test form',
        settings: defaultFormSettings,
        questions: [
          {
            id: 'q1',
            type: QuestionType.TEXT,
            label: 'Name',
            required: true,
            placeholder: 'Your name'
          },
          {
            id: 'q2',
            type: QuestionType.EMAIL,
            label: 'Email',
            required: true,
            placeholder: 'your@email.com'
          },
          {
            id: 'q3',
            type: QuestionType.DROPDOWN,
            label: 'Country',
            required: false,
            options: [
              { text: 'USA' },
              { text: 'Canada' },
              { text: 'UK' }
            ]
          }
        ]
      };

      await expect(service.createForm(formConfig)).resolves.toBeDefined();

      const mockApiClient = (service as any).apiClient;
      const capturedPayload = mockApiClient.requestWithValidation.mock.calls[0][3];

      // Validate the payload structure
      expect(() => TallyFormCreatePayloadSchema.parse(capturedPayload)).not.toThrow();
      expect(capturedPayload.blocks.length).toBeGreaterThan(3); // Multiple blocks for dropdown options
    });

    it('rejects invalid form configuration - empty title', async () => {
      const formConfig: FormConfig = {
        title: '', // Invalid: empty title
        description: 'A test form',
        settings: defaultFormSettings,
        questions: [
          {
            id: 'q1',
            type: QuestionType.TEXT,
            label: 'Your name',
            required: true
          }
        ]
      };

      await expect(service.createForm(formConfig)).rejects.toThrow(ZodError);
    });

    it('validates form with no questions', async () => {
      const formConfig: FormConfig = {
        title: 'Test Form',
        description: 'A test form',
        settings: defaultFormSettings,
        questions: [] // No questions means only title block
      };

      // This should pass validation since we always have at least a FORM_TITLE block
      await expect(service.createForm(formConfig)).resolves.toBeDefined();
    });

    it('validates all generated blocks have proper UUIDs', async () => {
      const formConfig: FormConfig = {
        title: 'UUID Test Form',
        settings: defaultFormSettings,
        questions: [
          {
            id: 'q1',
            type: QuestionType.TEXT,
            label: 'Test Question',
            required: false
          }
        ]
      };

      await service.createForm(formConfig);

      const mockApiClient = (service as any).apiClient;
      const capturedPayload = mockApiClient.requestWithValidation.mock.calls[0][3];

      // Validate each block has proper UUIDs
      capturedPayload.blocks.forEach((block: any) => {
        expect(() => TallyBlockSchema.parse(block)).not.toThrow();
        expect(block.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        expect(block.groupUuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      });
    });

    it('validates block types are supported by Tally', async () => {
      const formConfig: FormConfig = {
        title: 'Block Type Test',
        settings: defaultFormSettings,
        questions: [
          {
            id: 'q1',
            type: QuestionType.EMAIL,
            label: 'Email',
            required: true
          },
          {
            id: 'q2',
            type: QuestionType.NUMBER,
            label: 'Age',
            required: false
          }
        ]
      };

      await service.createForm(formConfig);

      const mockApiClient = (service as any).apiClient;
      const capturedPayload = mockApiClient.requestWithValidation.mock.calls[0][3];

      // Validate all block types are recognized
      capturedPayload.blocks.forEach((block: any) => {
        expect(() => TallyBlockTypeSchema.parse(block.type)).not.toThrow();
        expect(() => TallyGroupTypeSchema.parse(block.groupType)).not.toThrow();
      });
    });
  });

  describe('updateForm payload validation', () => {
    it('validates partial form updates', async () => {
      const partialConfig: Partial<FormConfig> = {
        title: 'Updated Form Title',
        description: 'Updated description'
      };

      await expect(service.updateForm('test-form-id', partialConfig)).resolves.toBeDefined();

      const mockApiClient = (service as any).apiClient;
      const capturedPayload = mockApiClient.requestWithValidation.mock.calls[0][3];

      // Validate the update payload structure
      expect(() => TallyFormUpdatePayloadSchema.parse(capturedPayload)).not.toThrow();
    });

    it('rejects invalid update payloads', async () => {
      const partialConfig: Partial<FormConfig> = {
        title: '', // Invalid: empty title
      };

      await expect(service.updateForm('test-form-id', partialConfig)).rejects.toThrow(ZodError);
    });
  });

  describe('error handling for malformed blocks', () => {
    it('catches validation errors before API submission', async () => {
      // Create a service instance that generates invalid blocks
      const invalidService = new TallyApiService(mockApiClientConfig);
      
      // Mock the internal method that generates the payload to return invalid data
      jest.spyOn(invalidService as any, 'mapToTallyPayload').mockImplementation(() => {
        // Return a payload that will fail Zod validation due to invalid UUID format
        return {
          status: 'PUBLISHED',
          name: 'Test Form',
          blocks: [
            {
              uuid: 'invalid-uuid', // Invalid UUID format
              type: 'FORM_TITLE',
              groupUuid: 'another-invalid-uuid',
              groupType: 'TEXT',
              title: 'Test',
              payload: { html: 'Test' }
            }
          ]
        };
      });

      const formConfig: FormConfig = {
        title: 'Test Form',
        settings: defaultFormSettings,
        questions: []
      };

      // Should throw validation error before making API call
      await expect(invalidService.createForm(formConfig)).rejects.toThrow();
    });
  });

  describe('comprehensive schema coverage', () => {
    it('tests all supported question types generate valid blocks', async () => {
      const questionTypes = [
        QuestionType.TEXT,
        QuestionType.EMAIL,
        QuestionType.NUMBER,
        QuestionType.PHONE,
        QuestionType.URL,
        QuestionType.DATE,
        QuestionType.TIME,
        QuestionType.TEXTAREA,
        QuestionType.DROPDOWN,
        QuestionType.CHECKBOXES,
        QuestionType.MULTIPLE_CHOICE,
        QuestionType.LINEAR_SCALE,
        QuestionType.RATING,
        QuestionType.FILE,
        QuestionType.SIGNATURE
      ];

      for (const questionType of questionTypes) {
        const formConfig: FormConfig = {
          title: `Test Form - ${questionType}`,
          settings: defaultFormSettings,
          questions: [
            {
              id: 'q1',
              type: questionType,
              label: `Test ${questionType}`,
              required: false,
              ...(questionType === QuestionType.DROPDOWN || 
                  questionType === QuestionType.CHECKBOXES || 
                  questionType === QuestionType.MULTIPLE_CHOICE
                ? { options: [{ text: 'Option 1' }, { text: 'Option 2' }] }
                : {}),
              ...(questionType === QuestionType.RATING
                ? { minRating: 1, maxRating: 5 }
                : {}),
              ...(questionType === QuestionType.LINEAR_SCALE
                ? { minValue: 1, maxValue: 10 }
                : {}),
              ...(questionType === QuestionType.PAYMENT
                ? { currency: 'USD' }
                : {}),
              ...(questionType === QuestionType.MATRIX
                ? { 
                    rows: [{ text: 'Row 1' }], 
                    columns: [{ text: 'Column 1' }],
                    defaultResponseType: 'single_select' as const
                  }
                : {})
            } as any
          ]
        };

        await expect(service.createForm(formConfig)).resolves.toBeDefined();

        const mockApiClient = (service as any).apiClient;
        const lastCallIndex = mockApiClient.requestWithValidation.mock.calls.length - 1;
        const capturedPayload = mockApiClient.requestWithValidation.mock.calls[lastCallIndex][3];

        // Each payload should pass validation
        expect(() => TallyFormCreatePayloadSchema.parse(capturedPayload)).not.toThrow();
      }
    });
  });
}); 