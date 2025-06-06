import { FormConfig, FormTemplate } from '../models';
import { Tool } from './tool';
import { TemplateService, NlpService } from '../services';

export interface TemplateToolArgs {
  action: 'list' | 'use' | 'customize';
  templateId?: string; // Required for 'use' and 'customize' actions
  customTitle?: string; // Optional for 'use' action
  customizationPrompt?: string;
}

export interface TemplateToolResult {
  templates?: FormTemplate[]; // Result for 'list' action
  formConfig?: FormConfig; // Result for 'use' and 'customize' actions
  success: boolean;
  message?: string;
}

export class TemplateTool implements Tool<TemplateToolArgs, TemplateToolResult> {
  public readonly name = 'template_tool';
  public readonly description =
    'Manages form templates. Actions: list, use, customize.';

  private templateService: TemplateService;
  private nlpService: NlpService;

  constructor() {
    this.templateService = new TemplateService();
    this.nlpService = new NlpService();
  }

  public async execute(args: TemplateToolArgs): Promise<TemplateToolResult> {
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

  private async listTemplates(): Promise<TemplateToolResult> {
    const templates = this.templateService.getTemplates();
    return {
      success: true,
      templates,
    };
  }

  private async useTemplate(
    templateId: string,
    customTitle?: string
  ): Promise<TemplateToolResult> {
    const formConfig = this.templateService.instantiateTemplate(
      templateId,
      customTitle
    );

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

  private async customizeTemplate(
    templateId: string,
    prompt: string
  ): Promise<TemplateToolResult> {
    const baseFormConfig = this.templateService.instantiateTemplate(templateId);
    if (!baseFormConfig) {
      return {
        success: false,
        message: `Template with ID '${templateId}' not found.`,
      };
    }

    const customizedFormConfig = this.nlpService.customizeFormConfig(
      prompt,
      baseFormConfig
    );

    return {
      success: true,
      formConfig: customizedFormConfig,
    };
  }
} 