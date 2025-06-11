import { Tool } from './tool';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { TallyForm, TallyFormsResponse } from '../models/tally-schemas';
import { FormConfig } from '../models';
export interface FormModificationArgs {
    command: string;
    formId: string;
}
export interface FormModificationResult {
    status: 'success' | 'error' | 'clarification_needed';
    finalFormConfig?: FormConfig;
    message: string;
    changes?: string[];
    errors?: string[];
    clarification?: {
        message: string;
        suggestions: string[];
    };
}
export declare class FormModificationTool implements Tool<FormModificationArgs, FormModificationResult> {
    readonly name = "form_modification_tool";
    readonly description = "Modifies existing Tally forms through natural language commands";
    private tallyApiService;
    constructor(apiClientConfig: TallyApiClientConfig);
    execute(args: FormModificationArgs): Promise<FormModificationResult>;
    getForm(formId: string): Promise<TallyForm | null>;
    getForms(options?: any): Promise<TallyFormsResponse | null>;
    updateForm(formId: string, config: any): Promise<TallyForm | null>;
    patchForm(formId: string, updates: any): Promise<TallyForm | null>;
    validateConnection(): Promise<boolean>;
}
//# sourceMappingURL=form-modification-tool.d.ts.map