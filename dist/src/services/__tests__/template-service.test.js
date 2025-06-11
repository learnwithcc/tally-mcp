import { TemplateService } from '../template-service';
import { TemplateCategory, SubmissionBehavior } from '../../models';
describe('TemplateService', () => {
    let templateService;
    beforeEach(() => {
        templateService = new TemplateService();
    });
    describe('getTemplates', () => {
        it('should return all available templates', () => {
            const templates = templateService.getTemplates();
            expect(templates).toHaveLength(4);
            expect(templates[0]?.name).toBe('Simple Contact Form');
        });
    });
    describe('findTemplateById', () => {
        it('should find a template by its ID', () => {
            const template = templateService.findTemplateById('contact-form-v1');
            expect(template).toBeDefined();
            expect(template?.name).toBe('Simple Contact Form');
        });
        it('should return undefined for a non-existent template ID', () => {
            const template = templateService.findTemplateById('non-existent-id');
            expect(template).toBeUndefined();
        });
    });
    describe('instantiateTemplate', () => {
        it('should instantiate a form from a template', () => {
            const formConfig = templateService.instantiateTemplate('contact-form-v1');
            expect(formConfig).toBeDefined();
            expect(formConfig?.title).toBe('Contact Us');
        });
        it('should override the title if a custom title is provided', () => {
            const formConfig = templateService.instantiateTemplate('contact-form-v1', 'Custom Title');
            expect(formConfig?.title).toBe('Custom Title');
        });
        it('should return undefined for a non-existent template ID', () => {
            const formConfig = templateService.instantiateTemplate('non-existent-id');
            expect(formConfig).toBeUndefined();
        });
        it('should create a deep copy of the form configuration', () => {
            const formConfig = templateService.instantiateTemplate('contact-form-v1');
            const originalTemplate = templateService.findTemplateById('contact-form-v1');
            expect(formConfig).not.toBe(originalTemplate?.formConfig);
            if (formConfig) {
                formConfig.title = 'A New Title';
            }
            expect(originalTemplate?.formConfig.title).toBe('Contact Us');
        });
    });
    describe('createTemplate', () => {
        it('should create a new template and add it to the registry', () => {
            const newTemplateData = {
                name: 'New Test Template',
                description: 'A new template for testing.',
                category: TemplateCategory.CUSTOM,
                version: '1.0',
                formConfig: {
                    title: 'Test Template',
                    questions: [],
                    settings: { submissionBehavior: SubmissionBehavior.MESSAGE },
                },
            };
            const createdTemplate = templateService.createTemplate(newTemplateData);
            expect(createdTemplate.id).toBeDefined();
            expect(createdTemplate.name).toBe('New Test Template');
            const foundTemplate = templateService.findTemplateById(createdTemplate.id);
            expect(foundTemplate).toEqual(createdTemplate);
        });
    });
    describe('updateTemplate', () => {
        it('should update an existing template', () => {
            const updates = { name: 'Updated Contact Form', version: '1.1' };
            const updatedTemplate = templateService.updateTemplate('contact-form-v1', updates);
            expect(updatedTemplate).toBeDefined();
            expect(updatedTemplate?.name).toBe('Updated Contact Form');
            expect(updatedTemplate?.version).toBe('1.1');
            expect(updatedTemplate?.description).toBe('A basic contact form with name, email, and message fields.');
        });
        it('should return undefined for a non-existent template ID', () => {
            const updatedTemplate = templateService.updateTemplate('non-existent-id', {
                name: 'test',
            });
            expect(updatedTemplate).toBeUndefined();
        });
    });
    describe('deleteTemplate', () => {
        it('should delete an existing template', () => {
            const result = templateService.deleteTemplate('contact-form-v1');
            expect(result).toBe(true);
            const foundTemplate = templateService.findTemplateById('contact-form-v1');
            expect(foundTemplate).toBeUndefined();
        });
        it('should return false for a non-existent template ID', () => {
            const result = templateService.deleteTemplate('non-existent-id');
            expect(result).toBe(false);
        });
    });
});
//# sourceMappingURL=template-service.test.js.map