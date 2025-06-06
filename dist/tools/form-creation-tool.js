"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormCreationTool = void 0;
const services_1 = require("../services");
class FormCreationTool {
    constructor(apiClientConfig) {
        this.name = 'form_creation_tool';
        this.description = 'Creates a Tally form from a natural language description or a template.';
        this.nlpService = new services_1.NlpService();
        this.tallyApiService = new services_1.TallyApiService(apiClientConfig);
        this.templateService = new services_1.TemplateService();
    }
    async execute(args) {
        console.log(`Executing form creation tool with args: ${JSON.stringify(args)}`);
        let formConfig;
        if (args.templateId) {
            formConfig = this.templateService.instantiateTemplate(args.templateId, args.formTitle);
            if (!formConfig) {
                throw new Error(`Template with ID '${args.templateId}' not found.`);
            }
        }
        else if (args.naturalLanguagePrompt) {
            formConfig = this.nlpService.generateFormConfig(args.naturalLanguagePrompt);
            if (args.formTitle) {
                formConfig.title = args.formTitle;
            }
        }
        else {
            throw new Error('Either naturalLanguagePrompt or templateId must be provided.');
        }
        const createdTallyForm = await this.tallyApiService.createForm(formConfig);
        return {
            formUrl: createdTallyForm.url,
            formConfig,
        };
    }
}
exports.FormCreationTool = FormCreationTool;
//# sourceMappingURL=form-creation-tool.js.map