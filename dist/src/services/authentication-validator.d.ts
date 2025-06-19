import { TallyApiClient } from './TallyApiClient';
import { OAuth2Config } from './TokenManager';
import { AuthenticationError } from '../models';
export declare class InvalidApiKeyError extends AuthenticationError {
    readonly keyFormat?: string | undefined;
    constructor(message: string, keyFormat?: string | undefined);
}
export declare class ExpiredTokenError extends AuthenticationError {
    readonly expirationDate?: Date | undefined;
    constructor(message: string, expirationDate?: Date | undefined);
}
export declare class InsufficientPermissionsError extends AuthenticationError {
    readonly requiredScopes?: string[] | undefined;
    constructor(message: string, requiredScopes?: string[] | undefined);
}
export declare class TokenRefreshError extends AuthenticationError {
    readonly refreshToken?: string | undefined;
    constructor(message: string, refreshToken?: string | undefined);
}
export declare class ApiKeyFormatError extends Error {
    readonly providedKey?: string | undefined;
    constructor(message: string, providedKey?: string | undefined);
}
export interface AuthenticationValidatorConfig {
    baseURL?: string;
    timeout?: number;
    oauth2Config?: OAuth2Config;
    debug?: boolean;
    maxAuthAttempts?: number;
    authRetryDelayMs?: number;
    authStateConfig?: AuthStateConfig;
}
export interface ApiKeyValidationResult {
    isValid: boolean;
    error?: string;
    details?: {
        hasCorrectPrefix: boolean;
        hasCorrectLength: boolean;
        hasValidCharacters: boolean;
    };
}
export interface AuthenticationTestResult {
    isAuthenticated: boolean;
    statusCode?: number;
    error?: string;
    responseTimeMs?: number;
    responseData?: any;
}
export interface EndpointAccessibilityResult {
    isAccessible: boolean;
    statusCode?: number;
    error?: string;
    responseTimeMs?: number;
    requiresAuthentication?: boolean;
    responseData?: any;
    isValidFormat?: boolean;
    formatErrors?: string[];
}
export interface BatchEndpointTestResult {
    overallSuccess: boolean;
    endpointResults: Record<string, EndpointAccessibilityResult>;
    totalTimeMs: number;
    summary: {
        total: number;
        successful: number;
        failed: number;
        requiresAuth: number;
    };
    errors: string[];
}
export interface AuthScenarioConfig {
    name: string;
    accessToken?: string;
    expectedStatusCode: number;
    shouldSucceed: boolean;
    description: string;
}
export interface AuthErrorInfo {
    category: 'format' | 'authentication' | 'authorization' | 'network' | 'rate_limit' | 'server' | 'unknown';
    severity: 'low' | 'medium' | 'high' | 'critical';
    isRetryable: boolean;
    retryDelayMs?: number;
    userMessage: string;
    technicalDetails: string;
    suggestedActions: string[];
    helpLinks?: string[];
}
export interface CategorizedAuthError {
    originalError: Error;
    errorInfo: AuthErrorInfo;
    statusCode?: number;
    timestamp: Date;
    context?: {
        endpoint?: string;
        method?: string;
        requestId?: string;
    };
}
export interface ConnectionTestResult {
    isConnected: boolean;
    responseTimeMs: number;
    error?: string;
    sslInfo?: {
        valid: boolean;
        issuer?: string;
        subject?: string;
        validFrom?: Date;
        validTo?: Date;
        fingerprint?: string;
    };
    networkInfo?: {
        hostname: string;
        port: number;
        protocol: string;
        ipAddress?: string;
    };
}
export interface SSLValidationResult {
    isValid: boolean;
    certificate?: {
        issuer: string;
        subject: string;
        validFrom: Date;
        validTo: Date;
        fingerprint: string;
        serialNumber: string;
    };
    errors: string[];
    warnings: string[];
}
export interface ComprehensiveAuthValidationResult {
    isValid: boolean;
    apiKeyValidation: ApiKeyValidationResult;
    authenticationTest: AuthenticationTestResult;
    connectionTest: ConnectionTestResult;
    sslValidation: SSLValidationResult;
    endpointTests: Record<string, EndpointAccessibilityResult>;
    totalTimeMs: number;
    errors: string[];
}
export interface AuthCacheEntry {
    accessToken: string;
    expiresAt: Date;
    cachedAt: Date;
    scopes?: string[];
    userInfo?: {
        id: string;
        email?: string;
        name?: string;
    };
}
export interface AuthStateConfig {
    cacheTtlMs?: number;
    enableTokenRefresh?: boolean;
    refreshThresholdMs?: number;
    enableCaching?: boolean;
}
export interface EnvValidationResult {
    isValid: boolean;
    missingVars: string[];
    invalidVars: {
        name: string;
        reason: string;
    }[];
    warnings: string[];
}
export declare class AuthenticationValidator {
    private apiClient;
    private config;
    private authCache;
    private authStateConfig;
    constructor(config?: AuthenticationValidatorConfig);
    categorizeAuthError(error: Error, context?: {
        endpoint?: string;
        method?: string;
    }): CategorizedAuthError;
    createAuthError(statusCode: number, message: string, responseData?: any): Error;
    shouldRetryAuthError(error: Error, attemptNumber: number, maxAttempts: number): {
        shouldRetry: boolean;
        delayMs: number;
    };
    validateApiKeyFormat(apiKey: string): ApiKeyValidationResult;
    generateAuthorizationUrl(state?: string, scopes?: string[]): string;
    exchangeCodeForToken(authorizationCode: string): Promise<AuthenticationTestResult>;
    testAuthentication(accessToken: string): Promise<AuthenticationTestResult>;
    testEndpointAccessibility(endpoint: string, accessToken?: string): Promise<EndpointAccessibilityResult>;
    private validateResponseFormat;
    testEndpointAccessibilityEnhanced(endpoint: string, accessToken?: string, validateFormat?: boolean): Promise<EndpointAccessibilityResult>;
    testFormsEndpoint(accessToken: string, options?: {
        page?: number;
        limit?: number;
        workspaceId?: string;
    }): Promise<EndpointAccessibilityResult>;
    testWorkspacesEndpoint(accessToken: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<EndpointAccessibilityResult>;
    testEndpointsBatch(endpoints: string[], accessToken?: string, validateFormat?: boolean): Promise<BatchEndpointTestResult>;
    testAuthenticationScenarios(endpoint: string, scenarios?: AuthScenarioConfig[]): Promise<Record<string, EndpointAccessibilityResult & {
        scenarioConfig: AuthScenarioConfig;
    }>>;
    testConnection(hostname?: string, port?: number): Promise<ConnectionTestResult>;
    validateSSLCertificate(hostname?: string, port?: number): Promise<SSLValidationResult>;
    testConnectionWithRetry(hostname?: string, port?: number, maxRetries?: number): Promise<ConnectionTestResult & {
        retryAttempts: number;
    }>;
    performComprehensiveValidation(accessToken: string, testEndpoints?: string[]): Promise<ComprehensiveAuthValidationResult>;
    getApiClient(): TallyApiClient;
    getConfig(): Readonly<Required<Omit<AuthenticationValidatorConfig, 'oauth2Config'>> & {
        oauth2Config?: OAuth2Config;
    }>;
    validateEnvironment(): EnvValidationResult;
    private cacheAuthResult;
    private getCachedAuth;
    private needsTokenRefresh;
    refreshAuthToken(refreshToken: string): Promise<AuthenticationTestResult>;
    testAuthenticationWithCache(accessToken: string, forceRefresh?: boolean): Promise<AuthenticationTestResult>;
    private cleanupExpiredCache;
    clearAuthCache(): void;
    getAuthCacheStats(): {
        totalEntries: number;
        validEntries: number;
        expiredEntries: number;
        oldestEntry?: Date;
        newestEntry?: Date;
    };
    private logAuthentication;
}
//# sourceMappingURL=authentication-validator.d.ts.map