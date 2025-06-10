"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationValidator = exports.ApiKeyFormatError = exports.TokenRefreshError = exports.InsufficientPermissionsError = exports.ExpiredTokenError = exports.InvalidApiKeyError = void 0;
const TallyApiClient_1 = require("./TallyApiClient");
const models_1 = require("../models");
const https_1 = __importDefault(require("https"));
class InvalidApiKeyError extends models_1.AuthenticationError {
    constructor(message, keyFormat) {
        super(message);
        this.keyFormat = keyFormat;
        this.name = 'InvalidApiKeyError';
    }
}
exports.InvalidApiKeyError = InvalidApiKeyError;
class ExpiredTokenError extends models_1.AuthenticationError {
    constructor(message, expirationDate) {
        super(message);
        this.expirationDate = expirationDate;
        this.name = 'ExpiredTokenError';
    }
}
exports.ExpiredTokenError = ExpiredTokenError;
class InsufficientPermissionsError extends models_1.AuthenticationError {
    constructor(message, requiredScopes) {
        super(message);
        this.requiredScopes = requiredScopes;
        this.name = 'InsufficientPermissionsError';
    }
}
exports.InsufficientPermissionsError = InsufficientPermissionsError;
class TokenRefreshError extends models_1.AuthenticationError {
    constructor(message, refreshToken) {
        super(message);
        this.refreshToken = refreshToken;
        this.name = 'TokenRefreshError';
    }
}
exports.TokenRefreshError = TokenRefreshError;
class ApiKeyFormatError extends Error {
    constructor(message, providedKey) {
        super(message);
        this.providedKey = providedKey;
        this.name = 'ApiKeyFormatError';
    }
}
exports.ApiKeyFormatError = ApiKeyFormatError;
class AuthenticationValidator {
    constructor(config = {}) {
        this.config = {
            baseURL: config.baseURL || 'https://api.tally.so',
            timeout: config.timeout || 10000,
            debug: config.debug || false,
            maxAuthAttempts: config.maxAuthAttempts || 3,
            authRetryDelayMs: config.authRetryDelayMs || 1000,
        };
        if (config.oauth2Config) {
            this.config.oauth2Config = config.oauth2Config;
        }
        const clientConfig = {
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            debug: this.config.debug,
            retryConfig: {
                maxAttempts: this.config.maxAuthAttempts,
                baseDelayMs: this.config.authRetryDelayMs,
                enableCircuitBreaker: false,
            },
        };
        if (this.config.oauth2Config) {
            clientConfig.oauth2Config = this.config.oauth2Config;
        }
        this.apiClient = new TallyApiClient_1.TallyApiClient(clientConfig);
    }
    categorizeAuthError(error, context) {
        const timestamp = new Date();
        let errorInfo;
        if (error instanceof ApiKeyFormatError) {
            errorInfo = {
                category: 'format',
                severity: 'high',
                isRetryable: false,
                userMessage: 'The API key format is invalid',
                technicalDetails: error.message,
                suggestedActions: [
                    'Verify that your API key starts with "tally_"',
                    'Check that the API key contains only alphanumeric characters, underscores, and hyphens',
                    'Ensure the API key length is between 10 and 100 characters',
                    'Generate a new API key from your Tally dashboard if needed'
                ],
                helpLinks: ['https://tally.so/help/api-keys']
            };
        }
        else if (error instanceof InvalidApiKeyError) {
            errorInfo = {
                category: 'authentication',
                severity: 'high',
                isRetryable: false,
                userMessage: 'The API key is invalid or not recognized',
                technicalDetails: error.message,
                suggestedActions: [
                    'Verify that you are using the correct API key',
                    'Check that the API key has not been revoked',
                    'Generate a new API key from your Tally dashboard',
                    'Ensure you are using the API key for the correct environment'
                ],
                helpLinks: ['https://tally.so/help/api-keys']
            };
        }
        else if (error instanceof ExpiredTokenError) {
            errorInfo = {
                category: 'authentication',
                severity: 'medium',
                isRetryable: true,
                retryDelayMs: 0,
                userMessage: 'The access token has expired',
                technicalDetails: error.message,
                suggestedActions: [
                    'Refresh the access token using your refresh token',
                    'Re-authenticate using the OAuth flow',
                    'Check token expiration times in your application'
                ],
                helpLinks: ['https://tally.so/help/oauth']
            };
        }
        else if (error instanceof InsufficientPermissionsError) {
            errorInfo = {
                category: 'authorization',
                severity: 'medium',
                isRetryable: false,
                userMessage: 'Insufficient permissions to access this resource',
                technicalDetails: error.message,
                suggestedActions: [
                    'Request additional permissions from the workspace owner',
                    'Verify that your API key has the required scopes',
                    'Check that you are accessing resources within your permitted workspaces'
                ],
                helpLinks: ['https://tally.so/help/permissions']
            };
        }
        else if (error instanceof models_1.RateLimitError) {
            errorInfo = {
                category: 'rate_limit',
                severity: 'low',
                isRetryable: true,
                retryDelayMs: 60000,
                userMessage: 'Rate limit exceeded',
                technicalDetails: error.message,
                suggestedActions: [
                    'Wait before making additional requests',
                    'Implement exponential backoff in your application',
                    'Consider upgrading your API plan for higher rate limits',
                    'Optimize your API usage to reduce request frequency'
                ],
                helpLinks: ['https://tally.so/help/rate-limits']
            };
        }
        else if (error instanceof models_1.NetworkError) {
            errorInfo = {
                category: 'network',
                severity: 'medium',
                isRetryable: true,
                retryDelayMs: 5000,
                userMessage: 'Network connection error',
                technicalDetails: error.message,
                suggestedActions: [
                    'Check your internet connection',
                    'Verify that api.tally.so is accessible from your network',
                    'Check for firewall or proxy restrictions',
                    'Try again in a few moments'
                ]
            };
        }
        else if (error instanceof models_1.TimeoutError) {
            errorInfo = {
                category: 'network',
                severity: 'medium',
                isRetryable: true,
                retryDelayMs: 3000,
                userMessage: 'Request timed out',
                technicalDetails: error.message,
                suggestedActions: [
                    'Check your network connection speed',
                    'Increase the timeout value in your configuration',
                    'Try again with a smaller request payload',
                    'Contact support if timeouts persist'
                ]
            };
        }
        else if (error instanceof models_1.TallyApiError) {
            const statusCode = error.statusCode;
            if (statusCode >= 500) {
                errorInfo = {
                    category: 'server',
                    severity: 'high',
                    isRetryable: true,
                    retryDelayMs: 10000,
                    userMessage: 'Server error occurred',
                    technicalDetails: error.message,
                    suggestedActions: [
                        'Try again in a few moments',
                        'Check the Tally status page for service issues',
                        'Contact support if the problem persists'
                    ],
                    helpLinks: ['https://status.tally.so']
                };
            }
            else if (statusCode === 401) {
                errorInfo = {
                    category: 'authentication',
                    severity: 'high',
                    isRetryable: false,
                    userMessage: 'Authentication failed',
                    technicalDetails: error.message,
                    suggestedActions: [
                        'Verify your API key or access token',
                        'Check that your credentials have not expired',
                        'Re-authenticate if using OAuth'
                    ]
                };
            }
            else if (statusCode === 403) {
                errorInfo = {
                    category: 'authorization',
                    severity: 'medium',
                    isRetryable: false,
                    userMessage: 'Access forbidden',
                    technicalDetails: error.message,
                    suggestedActions: [
                        'Check that you have permission to access this resource',
                        'Verify that your API key has the required scopes',
                        'Contact the workspace owner for access'
                    ]
                };
            }
            else {
                errorInfo = {
                    category: 'unknown',
                    severity: 'medium',
                    isRetryable: false,
                    userMessage: 'An API error occurred',
                    technicalDetails: error.message,
                    suggestedActions: [
                        'Check the API documentation for this endpoint',
                        'Verify your request parameters',
                        'Contact support if the issue persists'
                    ]
                };
            }
        }
        else {
            errorInfo = {
                category: 'unknown',
                severity: 'medium',
                isRetryable: false,
                userMessage: 'An unexpected error occurred',
                technicalDetails: error.message,
                suggestedActions: [
                    'Try again in a few moments',
                    'Check your network connection',
                    'Contact support if the problem persists'
                ]
            };
        }
        return {
            originalError: error,
            errorInfo,
            statusCode: error instanceof models_1.TallyApiError ? error.statusCode : undefined,
            timestamp,
            context
        };
    }
    createAuthError(statusCode, message, responseData) {
        switch (statusCode) {
            case 401:
                if (message.toLowerCase().includes('expired')) {
                    return new ExpiredTokenError(message);
                }
                else if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('key')) {
                    return new InvalidApiKeyError(message);
                }
                else {
                    return new models_1.AuthenticationError(message);
                }
            case 403:
                return new InsufficientPermissionsError(message);
            case 429:
                return new models_1.RateLimitError(message);
            case 408:
            case 504:
                return new models_1.TimeoutError(message);
            case 500:
            case 502:
            case 503:
                return new models_1.TallyApiError(message, statusCode);
            default:
                return new models_1.TallyApiError(message, statusCode);
        }
    }
    shouldRetryAuthError(error, attemptNumber, maxAttempts) {
        if (attemptNumber >= maxAttempts) {
            return { shouldRetry: false, delayMs: 0 };
        }
        const categorizedError = this.categorizeAuthError(error);
        if (!categorizedError.errorInfo.isRetryable) {
            return { shouldRetry: false, delayMs: 0 };
        }
        const baseDelay = categorizedError.errorInfo.retryDelayMs || this.config.authRetryDelayMs;
        const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1);
        const maxDelay = 60000;
        const delayMs = Math.min(exponentialDelay, maxDelay);
        return { shouldRetry: true, delayMs };
    }
    validateApiKeyFormat(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return {
                isValid: false,
                error: 'API key must be a non-empty string',
                details: {
                    hasCorrectPrefix: false,
                    hasCorrectLength: false,
                    hasValidCharacters: false,
                },
            };
        }
        const hasCorrectPrefix = apiKey.startsWith('tally_');
        const hasCorrectLength = apiKey.length >= 10 && apiKey.length <= 100;
        const hasValidCharacters = /^[a-zA-Z0-9_-]+$/.test(apiKey);
        const isValid = hasCorrectPrefix && hasCorrectLength && hasValidCharacters;
        const result = {
            isValid,
            details: {
                hasCorrectPrefix,
                hasCorrectLength,
                hasValidCharacters,
            },
        };
        if (!isValid) {
            const errors = [];
            if (!hasCorrectPrefix) {
                errors.push('API key must start with "tally_" prefix');
            }
            if (!hasCorrectLength) {
                errors.push(`API key length must be between 10 and 100 characters (current: ${apiKey.length})`);
            }
            if (!hasValidCharacters) {
                errors.push('API key can only contain alphanumeric characters, underscores, and hyphens');
            }
            result.error = errors.join('; ');
        }
        return result;
    }
    generateAuthorizationUrl(state, scopes) {
        if (!this.config.oauth2Config) {
            throw new models_1.AuthenticationError('OAuth 2.0 configuration is required for authorization URL generation');
        }
        return this.apiClient.getAuthorizationUrl(state);
    }
    async exchangeCodeForToken(authorizationCode) {
        const startTime = Date.now();
        try {
            if (!this.config.oauth2Config) {
                throw new models_1.AuthenticationError('OAuth 2.0 configuration is required for token exchange');
            }
            const result = await this.apiClient.exchangeCodeForToken(authorizationCode);
            const responseTimeMs = Date.now() - startTime;
            return {
                isAuthenticated: true,
                statusCode: 200,
                responseTimeMs,
                responseData: result,
            };
        }
        catch (error) {
            const responseTimeMs = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during token exchange';
            const result = {
                isAuthenticated: false,
                error: errorMessage,
                responseTimeMs,
            };
            if (error instanceof models_1.TallyApiError) {
                result.statusCode = error.statusCode;
            }
            return result;
        }
    }
    async testAuthentication(accessToken) {
        const startTime = Date.now();
        try {
            this.apiClient.setAccessToken(accessToken);
            const isAuthenticated = await this.apiClient.isAuthenticated();
            const responseTimeMs = Date.now() - startTime;
            if (isAuthenticated) {
                const workspaces = await this.apiClient.getWorkspaces({ limit: 1 });
                return {
                    isAuthenticated: true,
                    statusCode: 200,
                    responseTimeMs,
                    responseData: { workspacesCount: workspaces.workspaces?.length || 0 },
                };
            }
            else {
                return {
                    isAuthenticated: false,
                    statusCode: 401,
                    error: 'Authentication failed - token may be invalid or expired',
                    responseTimeMs,
                };
            }
        }
        catch (error) {
            const responseTimeMs = Date.now() - startTime;
            let statusCode;
            let errorMessage;
            if (error instanceof models_1.AuthenticationError) {
                statusCode = 401;
                errorMessage = error.message;
            }
            else if (error instanceof models_1.RateLimitError) {
                statusCode = 429;
                errorMessage = 'Rate limit exceeded during authentication test';
            }
            else if (error instanceof models_1.NetworkError) {
                statusCode = 503;
                errorMessage = 'Network error during authentication test';
            }
            else if (error instanceof models_1.TimeoutError) {
                statusCode = 408;
                errorMessage = 'Timeout during authentication test';
            }
            else if (error instanceof models_1.TallyApiError) {
                statusCode = error.statusCode;
                errorMessage = error.message;
            }
            else {
                errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
            }
            const result = {
                isAuthenticated: false,
                error: errorMessage,
                responseTimeMs,
            };
            if (statusCode !== undefined) {
                result.statusCode = statusCode;
            }
            return result;
        }
    }
    async testEndpointAccessibility(endpoint, accessToken) {
        const startTime = Date.now();
        try {
            if (accessToken) {
                this.apiClient.setAccessToken(accessToken);
            }
            else {
                this.apiClient.setAccessToken('');
            }
            const response = await this.apiClient.get(endpoint);
            const responseTimeMs = Date.now() - startTime;
            return {
                isAccessible: true,
                statusCode: response.status,
                responseTimeMs,
                requiresAuthentication: !!accessToken,
            };
        }
        catch (error) {
            const responseTimeMs = Date.now() - startTime;
            let statusCode;
            let errorMessage;
            let requiresAuthentication = false;
            if (error instanceof models_1.AuthenticationError) {
                statusCode = 401;
                errorMessage = 'Endpoint requires authentication';
                requiresAuthentication = true;
            }
            else if (error instanceof models_1.TallyApiError) {
                statusCode = error.statusCode;
                errorMessage = error.message;
                requiresAuthentication = statusCode === 401 || statusCode === 403;
            }
            else if (error instanceof models_1.NetworkError) {
                statusCode = 503;
                errorMessage = 'Network error accessing endpoint';
            }
            else if (error instanceof models_1.TimeoutError) {
                statusCode = 408;
                errorMessage = 'Timeout accessing endpoint';
            }
            else {
                errorMessage = error instanceof Error ? error.message : 'Unknown error accessing endpoint';
            }
            return {
                isAccessible: false,
                statusCode,
                error: errorMessage,
                responseTimeMs,
                requiresAuthentication,
            };
        }
    }
    validateResponseFormat(endpoint, responseData) {
        try {
            const { TallyFormsResponseSchema, TallyWorkspacesResponseSchema, TallySubmissionsResponseSchema } = require('../models');
            let schema;
            if (endpoint.includes('/forms')) {
                schema = TallyFormsResponseSchema;
            }
            else if (endpoint.includes('/workspaces')) {
                schema = TallyWorkspacesResponseSchema;
            }
            else if (endpoint.includes('/submissions')) {
                schema = TallySubmissionsResponseSchema;
            }
            else {
                return {
                    isValid: typeof responseData === 'object' && responseData !== null,
                    errors: typeof responseData !== 'object' ? ['Response is not an object'] : [],
                };
            }
            const validation = schema.safeParse(responseData);
            return {
                isValid: validation.success,
                errors: validation.success ? [] : validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
            };
        }
        catch (error) {
            return {
                isValid: false,
                errors: [`Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            };
        }
    }
    async testEndpointAccessibilityEnhanced(endpoint, accessToken, validateFormat = false) {
        const startTime = Date.now();
        try {
            if (accessToken) {
                this.apiClient.setAccessToken(accessToken);
            }
            else {
                this.apiClient.setAccessToken('');
            }
            const response = await this.apiClient.get(endpoint);
            const responseTimeMs = Date.now() - startTime;
            const result = {
                isAccessible: true,
                statusCode: response.status,
                responseTimeMs,
                requiresAuthentication: !!accessToken,
                responseData: response.data,
            };
            if (validateFormat) {
                const formatValidation = this.validateResponseFormat(endpoint, response.data);
                result.isValidFormat = formatValidation.isValid;
                result.formatErrors = formatValidation.errors;
            }
            return result;
        }
        catch (error) {
            const responseTimeMs = Date.now() - startTime;
            let statusCode;
            let errorMessage;
            let requiresAuthentication = false;
            if (error instanceof models_1.AuthenticationError) {
                statusCode = 401;
                errorMessage = 'Endpoint requires authentication';
                requiresAuthentication = true;
            }
            else if (error instanceof models_1.TallyApiError) {
                statusCode = error.statusCode;
                errorMessage = error.message;
                requiresAuthentication = statusCode === 401 || statusCode === 403;
            }
            else if (error instanceof models_1.NetworkError) {
                statusCode = 503;
                errorMessage = 'Network error accessing endpoint';
            }
            else if (error instanceof models_1.TimeoutError) {
                statusCode = 408;
                errorMessage = 'Timeout accessing endpoint';
            }
            else {
                errorMessage = error instanceof Error ? error.message : 'Unknown error accessing endpoint';
            }
            return {
                isAccessible: false,
                statusCode,
                error: errorMessage,
                responseTimeMs,
                requiresAuthentication,
            };
        }
    }
    async testFormsEndpoint(accessToken, options = {}) {
        const queryParams = new URLSearchParams();
        if (options.page)
            queryParams.append('page', options.page.toString());
        if (options.limit)
            queryParams.append('limit', options.limit.toString());
        if (options.workspaceId)
            queryParams.append('workspaceId', options.workspaceId);
        const endpoint = `/forms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.testEndpointAccessibilityEnhanced(endpoint, accessToken, true);
    }
    async testWorkspacesEndpoint(accessToken, options = {}) {
        const queryParams = new URLSearchParams();
        if (options.page)
            queryParams.append('page', options.page.toString());
        if (options.limit)
            queryParams.append('limit', options.limit.toString());
        const endpoint = `/workspaces${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.testEndpointAccessibilityEnhanced(endpoint, accessToken, true);
    }
    async testEndpointsBatch(endpoints, accessToken, validateFormat = false) {
        const startTime = Date.now();
        const endpointResults = {};
        const errors = [];
        for (const endpoint of endpoints) {
            try {
                endpointResults[endpoint] = await this.testEndpointAccessibilityEnhanced(endpoint, accessToken, validateFormat);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                endpointResults[endpoint] = {
                    isAccessible: false,
                    error: errorMessage,
                    responseTimeMs: 0,
                };
                errors.push(`${endpoint}: ${errorMessage}`);
            }
        }
        const totalTimeMs = Date.now() - startTime;
        const results = Object.values(endpointResults);
        const successful = results.filter(r => r.isAccessible).length;
        const failed = results.filter(r => !r.isAccessible).length;
        const requiresAuth = results.filter(r => r.requiresAuthentication).length;
        return {
            overallSuccess: failed === 0,
            endpointResults,
            totalTimeMs,
            summary: {
                total: endpoints.length,
                successful,
                failed,
                requiresAuth,
            },
            errors,
        };
    }
    async testAuthenticationScenarios(endpoint, scenarios) {
        const defaultScenarios = [
            {
                name: 'valid_token',
                accessToken: 'tally_valid_test_token_12345',
                expectedStatusCode: 200,
                shouldSucceed: true,
                description: 'Test with a valid access token format',
            },
            {
                name: 'invalid_token',
                accessToken: 'tally_invalid_token_xyz',
                expectedStatusCode: 401,
                shouldSucceed: false,
                description: 'Test with an invalid access token',
            },
            {
                name: 'malformed_token',
                accessToken: 'not_a_tally_token',
                expectedStatusCode: 401,
                shouldSucceed: false,
                description: 'Test with a malformed token (wrong prefix)',
            },
            {
                name: 'empty_token',
                accessToken: '',
                expectedStatusCode: 401,
                shouldSucceed: false,
                description: 'Test with an empty token',
            },
            {
                name: 'no_token',
                accessToken: undefined,
                expectedStatusCode: 401,
                shouldSucceed: false,
                description: 'Test without any authentication token',
            },
        ];
        const testScenarios = scenarios || defaultScenarios;
        const results = {};
        for (const scenario of testScenarios) {
            try {
                const result = await this.testEndpointAccessibilityEnhanced(endpoint, scenario.accessToken);
                results[scenario.name] = {
                    ...result,
                    scenarioConfig: scenario,
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results[scenario.name] = {
                    isAccessible: false,
                    error: errorMessage,
                    responseTimeMs: 0,
                    scenarioConfig: scenario,
                };
            }
        }
        return results;
    }
    async testConnection(hostname = 'api.tally.so', port = 443) {
        const startTime = Date.now();
        return new Promise((resolve) => {
            const options = {
                hostname,
                port,
                method: 'HEAD',
                timeout: this.config.timeout,
                rejectUnauthorized: true,
            };
            const req = https_1.default.request(options, (res) => {
                const responseTimeMs = Date.now() - startTime;
                const socket = res.socket;
                const sslInfo = socket.getPeerCertificate ? {
                    valid: socket.authorized || false,
                    issuer: socket.getPeerCertificate()?.issuer?.CN,
                    subject: socket.getPeerCertificate()?.subject?.CN,
                    validFrom: socket.getPeerCertificate()?.valid_from ? new Date(socket.getPeerCertificate().valid_from) : undefined,
                    validTo: socket.getPeerCertificate()?.valid_to ? new Date(socket.getPeerCertificate().valid_to) : undefined,
                    fingerprint: socket.getPeerCertificate()?.fingerprint,
                } : undefined;
                resolve({
                    isConnected: true,
                    responseTimeMs,
                    sslInfo,
                    networkInfo: {
                        hostname,
                        port,
                        protocol: 'https',
                        ipAddress: socket.remoteAddress,
                    },
                });
            });
            req.on('error', (error) => {
                const responseTimeMs = Date.now() - startTime;
                resolve({
                    isConnected: false,
                    responseTimeMs,
                    error: error.message,
                    networkInfo: {
                        hostname,
                        port,
                        protocol: 'https',
                    },
                });
            });
            req.on('timeout', () => {
                req.destroy();
                const responseTimeMs = Date.now() - startTime;
                resolve({
                    isConnected: false,
                    responseTimeMs,
                    error: `Connection timeout after ${this.config.timeout}ms`,
                    networkInfo: {
                        hostname,
                        port,
                        protocol: 'https',
                    },
                });
            });
            req.end();
        });
    }
    async validateSSLCertificate(hostname = 'api.tally.so', port = 443) {
        return new Promise((resolve) => {
            const options = {
                hostname,
                port,
                method: 'HEAD',
                timeout: this.config.timeout,
                rejectUnauthorized: true,
            };
            const req = https_1.default.request(options, (res) => {
                const socket = res.socket;
                const cert = socket.getPeerCertificate();
                if (!cert || Object.keys(cert).length === 0) {
                    resolve({
                        isValid: false,
                        errors: ['No SSL certificate found'],
                        warnings: [],
                    });
                    return;
                }
                const now = new Date();
                const validFrom = new Date(cert.valid_from);
                const validTo = new Date(cert.valid_to);
                const errors = [];
                const warnings = [];
                if (now < validFrom) {
                    errors.push('Certificate is not yet valid');
                }
                if (now > validTo) {
                    errors.push('Certificate has expired');
                }
                const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                if (validTo < thirtyDaysFromNow) {
                    warnings.push('Certificate expires within 30 days');
                }
                if (cert.subject?.CN !== hostname && !cert.subjectaltname?.includes(hostname)) {
                    errors.push(`Certificate hostname mismatch: expected ${hostname}, got ${cert.subject?.CN}`);
                }
                if (cert.issuer?.CN === cert.subject?.CN) {
                    warnings.push('Certificate appears to be self-signed');
                }
                const isValid = socket.authorized && errors.length === 0;
                resolve({
                    isValid,
                    certificate: {
                        issuer: cert.issuer?.CN || 'Unknown',
                        subject: cert.subject?.CN || 'Unknown',
                        validFrom,
                        validTo,
                        fingerprint: cert.fingerprint || '',
                        serialNumber: cert.serialNumber || '',
                    },
                    errors,
                    warnings,
                });
            });
            req.on('error', (error) => {
                resolve({
                    isValid: false,
                    errors: [`SSL connection error: ${error.message}`],
                    warnings: [],
                });
            });
            req.on('timeout', () => {
                req.destroy();
                resolve({
                    isValid: false,
                    errors: [`SSL validation timeout after ${this.config.timeout}ms`],
                    warnings: [],
                });
            });
            req.end();
        });
    }
    async testConnectionWithRetry(hostname = 'api.tally.so', port = 443, maxRetries = 3) {
        let lastError = '';
        let totalResponseTime = 0;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.testConnection(hostname, port);
                if (result.isConnected) {
                    return {
                        ...result,
                        responseTimeMs: totalResponseTime + result.responseTimeMs,
                        retryAttempts: attempt,
                    };
                }
                lastError = result.error || 'Connection failed';
                totalResponseTime += result.responseTimeMs;
                if (attempt < maxRetries) {
                    const delay = this.config.authRetryDelayMs * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            catch (error) {
                lastError = error instanceof Error ? error.message : 'Unknown error';
                if (attempt < maxRetries) {
                    const delay = this.config.authRetryDelayMs * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        return {
            isConnected: false,
            responseTimeMs: totalResponseTime,
            error: `Failed after ${maxRetries + 1} attempts: ${lastError}`,
            retryAttempts: maxRetries + 1,
            networkInfo: {
                hostname,
                port,
                protocol: 'https',
            },
        };
    }
    async performComprehensiveValidation(accessToken, testEndpoints = ['/workspaces', '/forms']) {
        const startTime = Date.now();
        const errors = [];
        const apiKeyValidation = this.validateApiKeyFormat(accessToken);
        if (!apiKeyValidation.isValid && apiKeyValidation.error) {
            errors.push(`API Key Format: ${apiKeyValidation.error}`);
        }
        const connectionTest = await this.testConnection();
        if (!connectionTest.isConnected && connectionTest.error) {
            errors.push(`Connection: ${connectionTest.error}`);
        }
        const sslValidation = await this.validateSSLCertificate();
        if (!sslValidation.isValid) {
            errors.push(`SSL: ${sslValidation.errors.join(', ')}`);
        }
        const authenticationTest = await this.testAuthentication(accessToken);
        if (!authenticationTest.isAuthenticated && authenticationTest.error) {
            errors.push(`Authentication: ${authenticationTest.error}`);
        }
        const endpointTests = {};
        for (const endpoint of testEndpoints) {
            try {
                endpointTests[endpoint] = await this.testEndpointAccessibility(endpoint, accessToken);
                if (!endpointTests[endpoint].isAccessible && endpointTests[endpoint].error) {
                    errors.push(`Endpoint ${endpoint}: ${endpointTests[endpoint].error}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                endpointTests[endpoint] = {
                    isAccessible: false,
                    error: errorMessage,
                    responseTimeMs: 0,
                };
                errors.push(`Endpoint ${endpoint}: ${errorMessage}`);
            }
        }
        const totalTimeMs = Date.now() - startTime;
        const isValid = apiKeyValidation.isValid &&
            connectionTest.isConnected &&
            sslValidation.isValid &&
            authenticationTest.isAuthenticated &&
            Object.values(endpointTests).every(result => result.isAccessible);
        return {
            isValid,
            apiKeyValidation,
            connectionTest,
            sslValidation,
            authenticationTest,
            endpointTests,
            totalTimeMs,
            errors,
        };
    }
    getApiClient() {
        return this.apiClient;
    }
    getConfig() {
        return { ...this.config };
    }
}
exports.AuthenticationValidator = AuthenticationValidator;
//# sourceMappingURL=authentication-validator.js.map