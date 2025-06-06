import { FormConfig } from '../models/form-config';
import { Tool } from './tool';
import { TallyApiClientConfig } from '../services/TallyApiClient';
export interface FormCreationArgs {
    naturalLanguagePrompt?: string;
    templateId?: string;
    formTitle?: string;
}
export interface FormCreationResult {
    formUrl: string | undefined;
    formConfig: FormConfig;
}
export declare class FormCreationTool implements Tool<FormCreationArgs, FormCreationResult> {
    readonly name = "form_creation_tool";
    readonly description = "Creates a Tally form from a natural language description or a template.";
    private nlpService;
    private tallyApiService;
    private templateService;
    constructor(apiClientConfig: TallyApiClientConfig);
    execute(args: FormCreationArgs): Promise<FormCreationResult>;
}
//# sourceMappingURL=form-creation-tool.d.ts.map