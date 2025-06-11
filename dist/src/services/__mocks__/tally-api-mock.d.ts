import { AxiosResponse } from 'axios';
import { TallyForm, TallyFormsResponse, TallySubmission, TallySubmissionsResponse, TallyWorkspace, TallyWorkspacesResponse } from '../../models';
export interface MockConfig {
    enabled: boolean;
    delay: number;
    simulateErrors: boolean;
    errorRate: number;
    simulateRateLimit: boolean;
    rateLimitThreshold: number;
}
export declare const DEFAULT_MOCK_CONFIG: MockConfig;
export declare class MockDataFixtures {
    static createMockForm(overrides?: Partial<TallyForm>): TallyForm;
    static createMockFormsResponse(count?: number): TallyFormsResponse;
    static createMockSubmission(overrides?: Partial<TallySubmission>): TallySubmission;
    static createMockSubmissionsResponse(count?: number): TallySubmissionsResponse;
    static createMockWorkspace(overrides?: Partial<TallyWorkspace>): TallyWorkspace;
    static createMockWorkspacesResponse(count?: number): TallyWorkspacesResponse;
}
export declare class TallyApiMock {
    private config;
    private requestCount;
    private rateLimitResetTime;
    constructor(config?: Partial<MockConfig>);
    updateConfig(config: Partial<MockConfig>): void;
    getConfig(): MockConfig;
    private simulateDelay;
    private shouldSimulateError;
    private checkRateLimit;
    private simulateRandomError;
    private createMockResponse;
    getForms(options?: {
        page?: number;
        limit?: number;
        workspaceId?: string;
    }): Promise<AxiosResponse<TallyFormsResponse>>;
    getForm(formId: string): Promise<AxiosResponse<TallyForm>>;
    getSubmissions(_formId: string, options?: {
        page?: number;
        limit?: number;
        status?: 'all' | 'completed' | 'partial';
    }): Promise<AxiosResponse<TallySubmissionsResponse>>;
    getSubmission(formId: string, submissionId: string): Promise<AxiosResponse<TallySubmission>>;
    getWorkspaces(options?: {
        page?: number;
        limit?: number;
    }): Promise<AxiosResponse<TallyWorkspacesResponse>>;
    getWorkspace(workspaceId: string): Promise<AxiosResponse<TallyWorkspace>>;
    createForm(formData: any): Promise<AxiosResponse<TallyForm>>;
    updateForm(formId: string, formData: any): Promise<AxiosResponse<TallyForm>>;
    deleteForm(_formId: string): Promise<AxiosResponse<{
        success: boolean;
    }>>;
    reset(): void;
    getStats(): {
        requestCount: number;
        rateLimitResetTime: number;
        config: MockConfig;
    };
}
export declare const tallyApiMock: TallyApiMock;
export declare function enableMocking(enabled?: boolean): void;
export declare function configureMock(config: Partial<MockConfig>): void;
export declare function resetMock(): void;
//# sourceMappingURL=tally-api-mock.d.ts.map