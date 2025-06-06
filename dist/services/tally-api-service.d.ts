import { TallyApiClientConfig } from './TallyApiClient';
import { FormConfig } from '../models';
import { TallyForm, TallyFormsResponse } from '../models/tally-schemas';
export declare class TallyApiService {
    private apiClient;
    constructor(config: TallyApiClientConfig);
    createForm(formConfig: FormConfig): Promise<TallyForm>;
    getForm(formId: string): Promise<TallyForm>;
    getForms(options?: {
        page?: number;
        limit?: number;
        workspaceId?: string;
    }): Promise<TallyFormsResponse>;
    updateForm(formId: string, formConfig: Partial<FormConfig>): Promise<TallyForm>;
    patchForm(formId: string, updates: Record<string, any>): Promise<TallyForm>;
    private mapToTallyPayload;
    private mapToTallyUpdatePayload;
}
//# sourceMappingURL=tally-api-service.d.ts.map