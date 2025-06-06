"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormCreationTool = void 0;
const services_1 = require("../services");
class FormCreationTool {
    constructor(apiClientConfig) {
        this.name = 'form_creation_tool';
        this.description = 'Creates a Tally form from a natural language description.';
        this.nlpService = new services_1.NlpService();
        this.tallyApiService = new services_1.TallyApiService(apiClientConfig);
    }
    async execute(args) {
        console.log(`Executing form creation tool with prompt: ${args.naturalLanguagePrompt}`);
        const formConfig = this.nlpService.generateFormConfig(args.naturalLanguagePrompt);
        const createdTallyForm = await this.tallyApiService.createForm(formConfig);
        return {
            formUrl: createdTallyForm.url,
            formConfig: formConfig,
        };
    }
}
exports.FormCreationTool = FormCreationTool;
//# sourceMappingURL=form-creation-tool.js.map