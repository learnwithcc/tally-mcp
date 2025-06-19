import { FormCreationTool } from '../form-creation-tool';
import { NlpService, TallyApiService, TemplateService } from '../../services';
import { QuestionType } from '../../models/form-config';
jest.mock('../../services/nlp-service');
jest.mock('../../services/tally-api-service');
jest.mock('../../services/template-service');
describe('FormCreationTool', () => {
    let tool;
    let mockNlpService;
    let mockTallyApiService;
    let mockTemplateService;
    let mockApiClientConfig;
    const mockFormConfig = {
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
            submissionBehavior: 'message'
        }
    };
    const mockCreatedForm = {
        id: 'form123',
        url: 'https://tally.so/r/form123',
        title: 'Test Form',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
    };
    beforeEach(() => {
        mockApiClientConfig = {
            accessToken: 'test-token',
            baseURL: 'https://api.tally.so'
        };
        jest.clearAllMocks();
        mockFormConfig.title = 'Test Form';
        tool = new FormCreationTool(mockApiClientConfig);
        mockNlpService = tool.nlpService;
        mockTallyApiService = tool.tallyApiService;
        mockTemplateService = tool.templateService;
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
        const templateArgs = {
            templateId: 'template123',
            formTitle: 'Custom Title'
        };
        it('should create form from template successfully', async () => {
            mockTemplateService.instantiateTemplate.mockReturnValue(mockFormConfig);
            mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);
            const result = await tool.execute(templateArgs);
            expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith('template123', 'Custom Title');
            expect(mockTallyApiService.createForm).toHaveBeenCalledWith(mockFormConfig);
            expect(result).toEqual({
                formUrl: 'https://tally.so/r/form123',
                formConfig: mockFormConfig
            });
        });
        it('should create form from template without custom title', async () => {
            const argsWithoutTitle = { templateId: 'template123' };
            mockTemplateService.instantiateTemplate.mockReturnValue(mockFormConfig);
            mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);
            const result = await tool.execute(argsWithoutTitle);
            expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith('template123', undefined);
            expect(result.formConfig).toEqual(mockFormConfig);
        });
        it('should throw error when template not found', async () => {
            mockTemplateService.instantiateTemplate.mockReturnValue(undefined);
            await expect(tool.execute(templateArgs)).rejects.toThrow("Template with ID 'template123' not found.");
            expect(mockTallyApiService.createForm).not.toHaveBeenCalled();
        });
    });
    describe('execute - natural language creation', () => {
        const nlpArgs = {
            naturalLanguagePrompt: 'Create a contact form with name and email fields',
            formTitle: 'Contact Form'
        };
        it('should create form from natural language prompt successfully', async () => {
            mockNlpService.generateFormConfig.mockReturnValue(mockFormConfig);
            mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);
            const result = await tool.execute(nlpArgs);
            expect(mockNlpService.generateFormConfig).toHaveBeenCalledWith('Create a contact form with name and email fields');
            expect(mockTallyApiService.createForm).toHaveBeenCalledWith({
                ...mockFormConfig,
                title: 'Contact Form'
            });
            expect(result).toEqual({
                formUrl: 'https://tally.so/r/form123',
                formConfig: {
                    ...mockFormConfig,
                    title: 'Contact Form'
                }
            });
        });
        it('should create form without custom title override', async () => {
            const argsWithoutTitle = {
                naturalLanguagePrompt: 'Create a survey form'
            };
            const freshMockFormConfig = { ...mockFormConfig };
            mockNlpService.generateFormConfig.mockReturnValue(freshMockFormConfig);
            mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);
            const result = await tool.execute(argsWithoutTitle);
            expect(mockNlpService.generateFormConfig).toHaveBeenCalledWith('Create a survey form');
            expect(mockTallyApiService.createForm).toHaveBeenCalledWith(freshMockFormConfig);
            expect(result.formConfig.title).toBe('Test Form');
            expect(result.formConfig).toBe(freshMockFormConfig);
        });
    });
    describe('execute - error scenarios', () => {
        it('should throw error when neither templateId nor naturalLanguagePrompt provided', async () => {
            const emptyArgs = {};
            await expect(tool.execute(emptyArgs)).rejects.toThrow('Either naturalLanguagePrompt or templateId must be provided.');
            expect(mockTemplateService.instantiateTemplate).not.toHaveBeenCalled();
            expect(mockNlpService.generateFormConfig).not.toHaveBeenCalled();
            expect(mockTallyApiService.createForm).not.toHaveBeenCalled();
        });
        it('should propagate API errors from createForm', async () => {
            const nlpArgs = { naturalLanguagePrompt: 'Test prompt' };
            const apiError = new Error('API call failed');
            mockNlpService.generateFormConfig.mockReturnValue(mockFormConfig);
            mockTallyApiService.createForm.mockRejectedValue(apiError);
            await expect(tool.execute(nlpArgs)).rejects.toThrow('API call failed');
            expect(mockNlpService.generateFormConfig).toHaveBeenCalled();
            expect(mockTallyApiService.createForm).toHaveBeenCalled();
        });
        it('should handle both templateId and naturalLanguagePrompt (prioritize template)', async () => {
            const bothArgs = {
                templateId: 'template123',
                naturalLanguagePrompt: 'This should be ignored',
                formTitle: 'Mixed Args Form'
            };
            mockTemplateService.instantiateTemplate.mockReturnValue(mockFormConfig);
            mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);
            const result = await tool.execute(bothArgs);
            expect(mockTemplateService.instantiateTemplate).toHaveBeenCalledWith('template123', 'Mixed Args Form');
            expect(mockNlpService.generateFormConfig).not.toHaveBeenCalled();
            expect(result.formConfig).toEqual(mockFormConfig);
        });
    });
    describe('execute - edge cases', () => {
        it('should handle empty string values gracefully', async () => {
            const argsWithEmptyStrings = {
                templateId: '',
                naturalLanguagePrompt: 'Create a form',
                formTitle: ''
            };
            const freshMockFormConfig = { ...mockFormConfig };
            mockNlpService.generateFormConfig.mockReturnValue(freshMockFormConfig);
            mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);
            const result = await tool.execute(argsWithEmptyStrings);
            expect(mockNlpService.generateFormConfig).toHaveBeenCalledWith('Create a form');
            expect(mockTemplateService.instantiateTemplate).not.toHaveBeenCalled();
            expect(result.formConfig.title).toBe('Test Form');
        });
        it('should handle null/undefined form URL from API', async () => {
            const nlpArgs = { naturalLanguagePrompt: 'Test prompt' };
            const formWithoutUrl = { ...mockCreatedForm, url: undefined };
            mockNlpService.generateFormConfig.mockReturnValue(mockFormConfig);
            mockTallyApiService.createForm.mockResolvedValue(formWithoutUrl);
            const result = await tool.execute(nlpArgs);
            expect(result.formUrl).toBeUndefined();
            expect(result.formConfig).toEqual(mockFormConfig);
        });
    });
    describe('logging', () => {
        let consoleSpy;
        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        });
        afterEach(() => {
            consoleSpy.mockRestore();
        });
        it('should log execution arguments', async () => {
            const args = { naturalLanguagePrompt: 'Test logging' };
            mockNlpService.generateFormConfig.mockReturnValue(mockFormConfig);
            mockTallyApiService.createForm.mockResolvedValue(mockCreatedForm);
            await tool.execute(args);
            expect(consoleSpy).toHaveBeenCalledWith('Executing form creation tool with args: {"naturalLanguagePrompt":"Test logging"}');
        });
    });
});
//# sourceMappingURL=form-creation-tool.test.js.map