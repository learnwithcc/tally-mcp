import { TemplateTool } from '../template-tool';
import { TemplateService, NlpService } from '../../services';
import { TemplateCategory, SubmissionBehavior } from '../../models';
jest.mock('../../services/template-service');
jest.mock('../../services/nlp-service');
const MockTemplateService = TemplateService;
const MockNlpService = NlpService;
describe('TemplateTool', () => {
    let templateTool;
    let mockTemplateService;
    let mockNlpService;
    beforeEach(() => {
        MockTemplateService.mockClear();
        MockNlpService.mockClear();
        templateTool = new TemplateTool();
        mockTemplateService = MockTemplateService.mock.instances[0];
        mockNlpService = MockNlpService.mock.instances[0];
    });
    describe('execute', () => {
        it("should call listTemplates for the 'list' action", async () => {
            const templates = [
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
            const args = { action: 'list' };
            const result = await templateTool.execute(args);
            expect(mockTemplateService.getTemplates).toHaveBeenCalledTimes(1);
            expect(result.success).toBe(true);
            expect(result.templates).toEqual(templates);
        });
        it("should call useTemplate for the 'use' action", async () => {
            const formConfig = {
                title: 'Instantiated Form',
                questions: [],
                settings: { submissionBehavior: SubmissionBehavior.MESSAGE },
            };
            mockTemplateService.instantiateTemplate.mockReturnValue(formConfig);
            const args = { action: 'use', templateId: 'test-id' };
            const result = await templateTool.execute(args);
            expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith('test-id', undefined);
            expect(result.success).toBe(true);
            expect(result.formConfig).toEqual(formConfig);
        });
        it("should call customizeTemplate for the 'customize' action", async () => {
            const baseFormConfig = {
                title: 'Base Form',
                questions: [],
                settings: { submissionBehavior: SubmissionBehavior.MESSAGE },
            };
            const customizedFormConfig = {
                title: 'Customized Form',
                questions: [],
                settings: { submissionBehavior: SubmissionBehavior.MESSAGE },
            };
            mockTemplateService.instantiateTemplate.mockReturnValue(baseFormConfig);
            mockNlpService.customizeFormConfig.mockReturnValue(customizedFormConfig);
            const args = {
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
            const args = { action: 'use' };
            const result = await templateTool.execute(args);
            expect(result.success).toBe(false);
            expect(result.message).toContain('Template ID is required');
        });
        it('should return an error for an invalid action', async () => {
            const args = { action: 'invalid' };
            const result = await templateTool.execute(args);
            expect(result.success).toBe(false);
            expect(result.message).toContain('Invalid action');
        });
    });
});
//# sourceMappingURL=template-tool.test.js.map