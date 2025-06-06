import { FormConfig, FormTemplate } from '../models';
import { Tool } from './tool';
export interface TemplateToolArgs {
    action: 'list' | 'use' | 'customize';
    templateId?: string;
    customTitle?: string;
    customizationPrompt?: string;
}
export interface TemplateToolResult {
    templates?: FormTemplate[];
    formConfig?: FormConfig;
    success: boolean;
    message?: string;
}
export declare class TemplateTool implements Tool<TemplateToolArgs, TemplateToolResult> {
    readonly name = "template_tool";
    readonly description = "Manages form templates. Actions: list, use, customize.";
    private templateService;
    private nlpService;
    constructor();
    execute(args: TemplateToolArgs): Promise<TemplateToolResult>;
    private listTemplates;
    private useTemplate;
    private customizeTemplate;
}
//# sourceMappingURL=template-tool.d.ts.map