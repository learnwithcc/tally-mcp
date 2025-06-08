import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { TokenManager, OAuth2Config, TokenStorage } from './TokenManager';
import { type TallySubmissionsResponse, type TallyFormsResponse, type TallyWorkspacesResponse, type TallyForm, type TallySubmission, type TallyWorkspace } from '../models';
export interface RetryConfig {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    exponentialBase?: number;
    jitterFactor?: number;
    enableCircuitBreaker?: boolean;
    circuitBreakerThreshold?: number;
    circuitBreakerTimeout?: number;
}
export interface TallyApiClientConfig {
    baseURL?: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
    accessToken?: string;
    oauth2Config?: OAuth2Config;
    tokenStorage?: TokenStorage;
    debug?: boolean;
    retryConfig?: RetryConfig;
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}
export declare class TallyApiClient {
    private axiosInstance;
    private config;
    private tokenManager?;
    private circuitBreakerState;
    private consecutiveFailures;
    private lastFailureTime?;
    constructor(config?: TallyApiClientConfig);
    getAuthorizationUrl(state?: string): string;
    exchangeCodeForToken(code: string): Promise<import("./TokenManager").Token>;
    isAuthenticated(): Promise<boolean>;
    refreshToken(): Promise<import("./TokenManager").Token>;
    clearAuthentication(): Promise<void>;
    setAccessToken(token: string): void;
    getAccessToken(): string;
    getCurrentToken(): Promise<import("./TokenManager").Token | null>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    getSubmissions(formId: string, options?: {
        page?: number;
        limit?: number;
        status?: 'all' | 'completed' | 'partial';
    }): Promise<TallySubmissionsResponse>;
    getSubmission(formId: string, submissionId: string): Promise<TallySubmission>;
    getForms(options?: {
        page?: number;
        limit?: number;
        workspaceId?: string;
    }): Promise<TallyFormsResponse>;
    getForm(formId: string): Promise<TallyForm>;
    getWorkspaces(options?: {
        page?: number;
        limit?: number;
    }): Promise<TallyWorkspacesResponse>;
    getWorkspace(workspaceId: string): Promise<TallyWorkspace>;
    validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): z.SafeParseReturnType<unknown, T>;
    requestWithValidation<T>(method: HttpMethod, url: string, schema: z.ZodSchema<T>, data?: any, config?: AxiosRequestConfig): Promise<T>;
    private request;
    private ensureAuthenticated;
    getAxiosInstance(): AxiosInstance;
    getConfig(): Readonly<Omit<Required<TallyApiClientConfig>, 'oauth2Config' | 'tokenStorage'> & {
        oauth2Config?: OAuth2Config;
        tokenStorage?: TokenStorage;
    }>;
    getTokenManager(): TokenManager | undefined;
    private calculateBackoffDelay;
    private shouldRetry;
    private updateCircuitBreakerState;
    private sleep;
    private handleResponseError;
    private retryRequest;
    private createNetworkError;
    private setupInterceptors;
    inviteUserToWorkspace(workspaceId: string, email: string, role: string): Promise<any>;
    removeUserFromWorkspace(workspaceId: string, userId: string): Promise<any>;
    updateUserRole(workspaceId: string, userId: string, role: string): Promise<any>;
    private isMockEnabled;
}
//# sourceMappingURL=TallyApiClient.d.ts.map