import { FormConfig, FormTemplate } from '../models';
export declare class TemplateService {
    private templateRegistry;
    constructor();
    getTemplates(): FormTemplate[];
    findTemplateById(templateId: string): FormTemplate | undefined;
    instantiateTemplate(templateId: string, customTitle?: string): FormConfig | undefined;
    createTemplate(templateData: Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt'>): FormTemplate;
    updateTemplate(templateId: string, updates: Partial<Omit<FormTemplate, 'id'>>): FormTemplate | undefined;
    deleteTemplate(templateId: string): boolean;
}
//# sourceMappingURL=template-service.d.ts.map