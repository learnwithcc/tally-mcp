import { TallyApiService } from '../services';
export class FormModificationTool {
    constructor(apiClientConfig) {
        this.name = 'form_modification_tool';
        this.description = 'Modifies existing Tally forms through natural language commands';
        this.tallyApiService = new TallyApiService(apiClientConfig);
    }
    async execute(args) {
        if (!args.formId) {
            return {
                success: false,
                status: 'error',
                message: 'Form ID is required',
                errors: ['Missing form ID']
            };
        }
        try {
            const form = await this.tallyApiService.getForm(args.formId);
            if (!form) {
                return {
                    success: false,
                    status: 'error',
                    message: `Form with ID ${args.formId} not found`,
                    errors: [`Form ${args.formId} does not exist`]
                };
            }
            return {
                success: true,
                status: 'success',
                message: `Successfully retrieved form "${form.title}"`,
                modifiedForm: form,
                finalFormConfig: undefined,
                changes: [`Retrieved form: ${form.title}`]
            };
        }
        catch (error) {
            return {
                success: false,
                status: 'error',
                message: `Form with ID ${args.formId} not found`,
                errors: [`Form ${args.formId} does not exist`]
            };
        }
    }
    async getForm(formId) {
        try {
            return await this.tallyApiService.getForm(formId);
        }
        catch (e) {
            return null;
        }
    }
    async getForms(options = {}) {
        try {
            return await this.tallyApiService.getForms(options);
        }
        catch (e) {
            return null;
        }
    }
    async updateForm(formId, config) {
        try {
            return await this.tallyApiService.updateForm(formId, config);
        }
        catch (e) {
            return null;
        }
    }
    async patchForm(formId, updates) {
        try {
            return await this.tallyApiService.patchForm(formId, updates);
        }
        catch (e) {
            return null;
        }
    }
    async validateConnection() {
        try {
            const result = await this.getForms({ limit: 1 });
            return !!result;
        }
        catch (e) {
            return false;
        }
    }
}
//# sourceMappingURL=form-modification-tool.js.map