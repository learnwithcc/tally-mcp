import { FormConfig } from '../models/form-config';
import { Tool } from './tool';
import { TallyApiClientConfig } from '../services/TallyApiClient';
export interface FormCreationArgs {
    naturalLanguagePrompt: string;
}
export interface FormCreationResult {
    formUrl: string | undefined;
    formConfig: FormConfig;
}
export declare class FormCreationTool implements Tool<FormCreationArgs, FormCreationResult> {
    readonly name = "form_creation_tool";
    readonly description = "Creates a Tally form from a natural language description.";
    private nlpService;
    private tallyApiService;
    constructor(apiClientConfig: TallyApiClientConfig);
    execute(args: FormCreationArgs): Promise<FormCreationResult>;
}
//# sourceMappingURL=form-creation-tool.d.ts.map