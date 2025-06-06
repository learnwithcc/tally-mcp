import { TemplateTool, TemplateToolArgs } from '../template-tool';
import { TemplateService, NlpService } from '../../services';
import { FormTemplate, TemplateCategory, FormConfig, SubmissionBehavior } from '../../models';

// Mock the services
jest.mock('../../services/template-service');
jest.mock('../../services/nlp-service');

const MockTemplateService = TemplateService as jest.MockedClass<typeof TemplateService>;
const MockNlpService = NlpService as jest.MockedClass<typeof NlpService>;

describe('TemplateTool', () => {
  let templateTool: TemplateTool;
  let mockTemplateService: jest.Mocked<TemplateService>;
  let mockNlpService: jest.Mocked<NlpService>;

  beforeEach(() => {
    // Reset mocks before each test
    MockTemplateService.mockClear();
    MockNlpService.mockClear();
    
    templateTool = new TemplateTool();
    
    mockTemplateService = MockTemplateService.mock.instances[0] as jest.Mocked<TemplateService>;
    mockNlpService = MockNlpService.mock.instances[0] as jest.Mocked<NlpService>;
  });

  describe('execute', () => {
    it("should call listTemplates for the 'list' action", async () => {
      const templates: FormTemplate[] = [
        {
          id: 'test-id',
          name: 'Test Template',
          description: 'A template for testing',
          category: TemplateCategory.CUSTOM,
          version: '1.0',
          formConfig: {
            title: 'Test',
            questions: [],
            settings: { submissionBehavior: SubmissionBehavior.MESSAGE },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockTemplateService.getTemplates.mockReturnValue(templates);

      const args: TemplateToolArgs = { action: 'list' };
      const result = await templateTool.execute(args);

      expect(mockTemplateService.getTemplates).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.templates).toEqual(templates);
    });

    it("should call useTemplate for the 'use' action", async () => {
      const formConfig: FormConfig = {
        title: 'Instantiated Form',
        questions: [],
        settings: { submissionBehavior: SubmissionBehavior.MESSAGE },
      };
      mockTemplateService.instantiateTemplate.mockReturnValue(formConfig);

      const args: TemplateToolArgs = { action: 'use', templateId: 'test-id' };
      const result = await templateTool.execute(args);

      expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith('test-id', undefined);
      expect(result.success).toBe(true);
      expect(result.formConfig).toEqual(formConfig);
    });

    it("should call customizeTemplate for the 'customize' action", async () => {
      const baseFormConfig: FormConfig = {
        title: 'Base Form',
        questions: [],
        settings: { submissionBehavior: SubmissionBehavior.MESSAGE },
      };
      const customizedFormConfig: FormConfig = {
        title: 'Customized Form',
        questions: [],
        settings: { submissionBehavior: SubmissionBehavior.MESSAGE },
      };

      mockTemplateService.instantiateTemplate.mockReturnValue(baseFormConfig);
      mockNlpService.customizeFormConfig.mockReturnValue(customizedFormConfig);

      const args: TemplateToolArgs = {
        action: 'customize',
        templateId: 'test-id',
        customizationPrompt: 'Make it better',
      };
      const result = await templateTool.execute(args);

      expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith('test-id');
      expect(mockNlpService.customizeFormConfig).toHaveBeenCalledWith('Make it better', baseFormConfig);
      expect(result.success).toBe(true);
      expect(result.formConfig).toEqual(customizedFormConfig);
    });

    it("should return an error if templateId is missing for the 'use' action", async () => {
      const args: TemplateToolArgs = { action: 'use' };
      const result = await templateTool.execute(args);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Template ID is required');
    });

    it('should return an error for an invalid action', async () => {
      const args: TemplateToolArgs = { action: 'invalid' as any };
      const result = await templateTool.execute(args);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid action');
    });
  });
}); 