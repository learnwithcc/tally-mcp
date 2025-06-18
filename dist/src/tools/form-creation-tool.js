import { NlpService, TallyApiService, TemplateService } from '../services';
export class FormCreationTool {
    constructor(apiClientConfig) {
        this.name = 'form_creation_tool';
        this.description = 'Creates a Tally form from a natural language description or a template.';
        this.nlpService = new NlpService();
        this.tallyApiService = new TallyApiService(apiClientConfig);
        this.templateService = new TemplateService();
    }
    async execute(args) {
        console.log(`Executing form creation tool with args: ${JSON.stringify(args)}`);
        let formConfig;
        if (args.formConfig) {
            formConfig = { ...args.formConfig };
            if (args.formTitle) {
                formConfig.title = args.formTitle;
            }
        }
        if (!formConfig && args.templateId) {
            formConfig = this.templateService.instantiateTemplate(args.templateId, args.formTitle);
            if (!formConfig) {
                throw new Error(`Template with ID '${args.templateId}' not found.`);
            }
        }
        if (!formConfig && args.naturalLanguagePrompt) {
            formConfig = this.nlpService.generateFormConfig(args.naturalLanguagePrompt);
            if (args.formTitle) {
                formConfig.title = args.formTitle;
            }
        }
        if (!formConfig) {
            throw new Error('One of formConfig, naturalLanguagePrompt, or templateId must be provided.');
        }
        const createdTallyForm = await this.tallyApiService.createForm(formConfig);
        console.log('[FormCreationTool] Created form response:', JSON.stringify(createdTallyForm, null, 2));
        let formUrl = createdTallyForm.url ||
            createdTallyForm.shareUrl ||
            createdTallyForm.share_url ||
            createdTallyForm.publicUrl;
        if (!formUrl && createdTallyForm.id) {
            try {
                const fetched = await this.tallyApiService.getForm(createdTallyForm.id);
                formUrl = fetched.url;
            }
            catch (err) {
                console.warn('Unable to retrieve form URL from getForm:', err.message);
            }
        }
        return {
            formUrl,
            formId: createdTallyForm.id,
            formConfig,
        };
    }
}
//# sourceMappingURL=form-creation-tool.js.map