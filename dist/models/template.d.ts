import { FormConfig } from './form-config';
export declare enum TemplateCategory {
    REGISTRATION = "registration",
    FEEDBACK = "feedback",
    SURVEY = "survey",
    CONTACT = "contact",
    APPLICATION = "application",
    EVENT = "event",
    ECOMMERCE = "ecommerce",
    EDUCATION = "education",
    HEALTHCARE = "healthcare",
    HUMAN_RESOURCES = "human_resources",
    CUSTOM = "custom"
}
export interface FormTemplate {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    version: string;
    formConfig: FormConfig;
    previewData?: Record<string, any>;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}
export interface TemplateRegistry {
    [templateId: string]: FormTemplate;
}
//# sourceMappingURL=template.d.ts.map