import { Tool } from './tool';
import { TallyApiClientConfig } from '../services/TallyApiClient';
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
    private commandParser;
    private formOperations;
    private versionManagers;
    constructor(apiClientConfig: TallyApiClientConfig);
    execute(args: FormModificationArgs): Promise<FormModificationResult>;
    getFormHistory(formId: string): import("../models").FormVersion[] | undefined;
    rollbackForm(formId: string, version: number): Promise<FormConfig | undefined>;
    private createErrorResult;
}
//# sourceMappingURL=form-modification-tool.d.ts.map