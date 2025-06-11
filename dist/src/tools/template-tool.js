import { TemplateService, NlpService } from '../services';
export class TemplateTool {
    constructor() {
        this.name = 'template_tool';
        this.description = 'Manages form templates. Actions: list, use, customize.';
        this.templateService = new TemplateService();
        this.nlpService = new NlpService();
    }
    async execute(args) {
        console.log(`Executing template tool with action: ${args.action}`);
        switch (args.action) {
            case 'list':
                return this.listTemplates();
            case 'use':
                if (!args.templateId) {
                    return {
                        success: false,
                        message: "Template ID is required for the 'use' action.",
                    };
                }
                return this.useTemplate(args.templateId, args.customTitle);
            case 'customize':
                if (!args.templateId || !args.customizationPrompt) {
                    return {
                        success: false,
                        message: "Template ID and customization prompt are required for the 'customize' action.",
                    };
                }
                return this.customizeTemplate(args.templateId, args.customizationPrompt);
            default:
                return {
                    success: false,
                    message: `Invalid action specified: ${args.action}`,
                };
        }
    }
    async listTemplates() {
        const templates = this.templateService.getTemplates();
        return {
            success: true,
            templates,
        };
    }
    async useTemplate(templateId, customTitle) {
        const formConfig = this.templateService.instantiateTemplate(templateId, customTitle);
        if (!formConfig) {
            return {
                success: false,
                message: `Template with ID '${templateId}' not found.`,
            };
        }
        return {
            success: true,
            formConfig,
        };
    }
    async customizeTemplate(templateId, prompt) {
        const baseFormConfig = this.templateService.instantiateTemplate(templateId);
        if (!baseFormConfig) {
            return {
                success: false,
                message: `Template with ID '${templateId}' not found.`,
            };
        }
        const customizedFormConfig = this.nlpService.customizeFormConfig(prompt, baseFormConfig);
        return {
            success: true,
            formConfig: customizedFormConfig,
        };
    }
}
//# sourceMappingURL=template-tool.js.map