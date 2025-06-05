import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { TokenManager, OAuth2Config, TokenStorage } from './TokenManager';
export interface TallyApiClientConfig {
    baseURL?: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
    accessToken?: string;
    oauth2Config?: OAuth2Config;
    tokenStorage?: TokenStorage;
    debug?: boolean;
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
    private request;
    private ensureAuthenticated;
    getAxiosInstance(): AxiosInstance;
    getConfig(): Readonly<Omit<Required<TallyApiClientConfig>, 'oauth2Config' | 'tokenStorage'> & {
        oauth2Config?: OAuth2Config;
        tokenStorage?: TokenStorage;
    }>;
    getTokenManager(): TokenManager | undefined;
    private setupInterceptors;
}
//# sourceMappingURL=TallyApiClient.d.ts.map