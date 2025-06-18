import { Tool } from './tool';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { TallyFormsResponse } from '../models/tally-schemas';
export interface FormRetrievalArgs {
    page?: number;
    limit?: number;
    workspaceId?: string;
}
export declare class FormRetrievalTool implements Tool<FormRetrievalArgs, TallyFormsResponse> {
    readonly name = "list_forms";
    readonly description = "Lists Tally forms.";
    private tallyApiService;
    constructor(apiClientConfig: TallyApiClientConfig);
    execute(args: FormRetrievalArgs): Promise<TallyFormsResponse>;
}
//# sourceMappingURL=form_retrieval_tool.d.ts.map