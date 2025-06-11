import axios from 'axios';
import { TokenManager } from './TokenManager';
import { TallyApiError, AuthenticationError, NetworkError, TimeoutError, createErrorFromResponse, } from '../models';
import { TallySubmissionsResponseSchema, TallyFormsResponseSchema, TallyWorkspacesResponseSchema, TallyFormSchema, TallySubmissionSchema, TallyWorkspaceSchema, validateTallyResponse, } from '../models';
import { tallyApiMock } from './__mocks__/tally-api-mock';
var CircuitBreakerState;
(function (CircuitBreakerState) {
    CircuitBreakerState["CLOSED"] = "CLOSED";
    CircuitBreakerState["OPEN"] = "OPEN";
    CircuitBreakerState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitBreakerState || (CircuitBreakerState = {}));
export class TallyApiClient {
    constructor(config = {}) {
        this.circuitBreakerState = CircuitBreakerState.CLOSED;
        this.consecutiveFailures = 0;
        this.config = {
            baseURL: config.baseURL || 'https://api.tally.so',
            timeout: config.timeout || 30000,
            defaultHeaders: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...config.defaultHeaders,
            },
            accessToken: config.accessToken || '',
            debug: config.debug || false,
            retryConfig: {
                maxAttempts: config.retryConfig?.maxAttempts ?? 3,
                baseDelayMs: config.retryConfig?.baseDelayMs ?? 1000,
                maxDelayMs: config.retryConfig?.maxDelayMs ?? 30000,
                exponentialBase: config.retryConfig?.exponentialBase ?? 2,
                jitterFactor: config.retryConfig?.jitterFactor ?? 0.1,
                enableCircuitBreaker: config.retryConfig?.enableCircuitBreaker ?? true,
                circuitBreakerThreshold: config.retryConfig?.circuitBreakerThreshold ?? 5,
                circuitBreakerTimeout: config.retryConfig?.circuitBreakerTimeout ?? 60000,
            },
        };
        if (config.oauth2Config) {
            this.config.oauth2Config = config.oauth2Config;
        }
        if (config.tokenStorage) {
            this.config.tokenStorage = config.tokenStorage;
        }
        if (this.config.oauth2Config) {
            this.tokenManager = new TokenManager(this.config.oauth2Config, this.config.tokenStorage);
        }
        this.axiosInstance = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: this.config.defaultHeaders,
            responseType: 'json',
        });
        if (this.config.accessToken) {
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.config.accessToken}`;
        }
        this.setupInterceptors();
    }
    getAuthorizationUrl(state) {
        if (!this.tokenManager) {
            throw new Error('OAuth 2.0 configuration is required to get authorization URL');
        }
        return this.tokenManager.getAuthorizationUrl(state);
    }
    async exchangeCodeForToken(code) {
        if (!this.tokenManager) {
            throw new AuthenticationError('OAuth 2.0 configuration is required to exchange code for token');
        }
        try {
            const token = await this.tokenManager.exchangeCodeForToken(code);
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
            return token;
        }
        catch (error) {
            throw new AuthenticationError('Failed to exchange code for token', undefined, undefined, undefined, error);
        }
    }
    async isAuthenticated() {
        if (this.config.accessToken) {
            return true;
        }
        if (this.tokenManager) {
            return await this.tokenManager.hasValidToken();
        }
        return false;
    }
    async refreshToken() {
        if (!this.tokenManager) {
            throw new AuthenticationError('OAuth 2.0 configuration is required to refresh token');
        }
        try {
            const token = await this.tokenManager.refreshToken();
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
            return token;
        }
        catch (error) {
            throw new AuthenticationError('Failed to refresh token', undefined, undefined, undefined, error);
        }
    }
    async clearAuthentication() {
        if (this.tokenManager) {
            await this.tokenManager.clearToken();
        }
        this.config.accessToken = '';
        delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
    setAccessToken(token) {
        this.config.accessToken = token;
        if (token) {
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        else {
            delete this.axiosInstance.defaults.headers.common['Authorization'];
        }
    }
    getAccessToken() {
        return this.config.accessToken;
    }
    async getCurrentToken() {
        if (!this.tokenManager) {
            return null;
        }
        return await this.tokenManager.getCurrentToken();
    }
    async get(url, config) {
        return this.request('GET', url, undefined, config);
    }
    async post(url, data, config) {
        return this.request('POST', url, data, config);
    }
    async put(url, data, config) {
        return this.request('PUT', url, data, config);
    }
    async delete(url, config) {
        return this.request('DELETE', url, undefined, config);
    }
    async patch(url, data, config) {
        return this.request('PATCH', url, data, config);
    }
    async getSubmissions(formId, options = {}) {
        if (this.isMockEnabled()) {
            const mockRes = await tallyApiMock.getSubmissions(formId, options);
            return mockRes.data;
        }
        const params = new URLSearchParams();
        if (options.page)
            params.append('page', options.page.toString());
        if (options.limit)
            params.append('limit', options.limit.toString());
        if (options.status)
            params.append('status', options.status);
        const query = params.toString();
        const url = `/forms/${formId}/submissions${query ? `?${query}` : ''}`;
        const response = await this.get(url);
        return validateTallyResponse(TallySubmissionsResponseSchema, response.data);
    }
    async getSubmission(formId, submissionId) {
        if (this.isMockEnabled()) {
            const mockRes = await tallyApiMock.getSubmission(formId, submissionId);
            return mockRes.data;
        }
        const url = `/forms/${formId}/submissions/${submissionId}`;
        const response = await this.get(url);
        return validateTallyResponse(TallySubmissionSchema, response.data);
    }
    async getForms(options = {}) {
        if (this.isMockEnabled()) {
            const mockRes = await tallyApiMock.getForms(options);
            return mockRes.data;
        }
        const params = new URLSearchParams();
        if (options.page)
            params.append('page', options.page.toString());
        if (options.limit)
            params.append('limit', options.limit.toString());
        if (options.workspaceId)
            params.append('workspaceId', options.workspaceId);
        const query = params.toString();
        const url = `/forms${query ? `?${query}` : ''}`;
        const response = await this.get(url);
        return validateTallyResponse(TallyFormsResponseSchema, response.data);
    }
    async getForm(formId) {
        if (this.isMockEnabled()) {
            const mockRes = await tallyApiMock.getForm(formId);
            return mockRes.data;
        }
        const url = `/forms/${formId}`;
        const response = await this.get(url);
        return validateTallyResponse(TallyFormSchema, response.data);
    }
    async getWorkspaces(options = {}) {
        if (this.isMockEnabled()) {
            const mockRes = await tallyApiMock.getWorkspaces(options);
            return mockRes.data;
        }
        const params = new URLSearchParams();
        if (options.page)
            params.append('page', options.page.toString());
        if (options.limit)
            params.append('limit', options.limit.toString());
        const query = params.toString();
        const url = `/workspaces${query ? `?${query}` : ''}`;
        const response = await this.get(url);
        return validateTallyResponse(TallyWorkspacesResponseSchema, response.data);
    }
    async getWorkspace(workspaceId) {
        if (this.isMockEnabled()) {
            const mockRes = await tallyApiMock.getWorkspace(workspaceId);
            return mockRes.data;
        }
        const url = `/workspaces/${workspaceId}`;
        return this.requestWithValidation('GET', url, TallyWorkspaceSchema);
    }
    validateResponse(schema, data) {
        return schema.safeParse(data);
    }
    async requestWithValidation(method, url, schema, data, config) {
        const response = await this.request(method, url, data, config);
        return validateTallyResponse(schema, response.data);
    }
    async request(method, url, data, config) {
        const requestConfig = {
            method,
            url,
            data,
            ...config,
        };
        const response = await this.axiosInstance.request(requestConfig);
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
    }
    async ensureAuthenticated() {
        if (this.config.accessToken) {
            return;
        }
        if (this.tokenManager) {
            const accessToken = await this.tokenManager.getAccessToken();
            if (accessToken) {
                this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                return;
            }
        }
        throw new AuthenticationError('No valid authentication found. Please authenticate first.', 401, 'Unauthorized');
    }
    getAxiosInstance() {
        return this.axiosInstance;
    }
    getConfig() {
        return { ...this.config };
    }
    getTokenManager() {
        return this.tokenManager;
    }
    calculateBackoffDelay(attempt, baseDelay, exponentialBase, maxDelay, jitterFactor) {
        const exponentialDelay = baseDelay * Math.pow(exponentialBase, attempt);
        const cappedDelay = Math.min(exponentialDelay, maxDelay);
        const jitterRange = cappedDelay * jitterFactor;
        const jitter = (Math.random() - 0.5) * 2 * jitterRange;
        return Math.max(0, Math.floor(cappedDelay + jitter));
    }
    shouldRetry(error, attempt) {
        const { retryConfig } = this.config;
        if (attempt >= retryConfig.maxAttempts) {
            return false;
        }
        if (retryConfig.enableCircuitBreaker && this.circuitBreakerState === CircuitBreakerState.OPEN) {
            if (this.lastFailureTime &&
                Date.now() - this.lastFailureTime.getTime() >= retryConfig.circuitBreakerTimeout) {
                this.circuitBreakerState = CircuitBreakerState.HALF_OPEN;
                if (this.config.debug) {
                    console.log('[TallyApiClient] Circuit breaker transitioning to HALF_OPEN');
                }
            }
            else {
                return false;
            }
        }
        if (error instanceof TallyApiError) {
            return error.isRetryable;
        }
        if (error instanceof NetworkError || error instanceof TimeoutError) {
            return true;
        }
        return false;
    }
    updateCircuitBreakerState(success) {
        const { retryConfig } = this.config;
        if (!retryConfig.enableCircuitBreaker) {
            return;
        }
        if (success) {
            this.consecutiveFailures = 0;
            if (this.circuitBreakerState !== CircuitBreakerState.CLOSED) {
                this.circuitBreakerState = CircuitBreakerState.CLOSED;
                if (this.config.debug) {
                    console.log('[TallyApiClient] Circuit breaker CLOSED after successful request');
                }
            }
        }
        else {
            this.consecutiveFailures++;
            this.lastFailureTime = new Date();
            if (this.consecutiveFailures >= retryConfig.circuitBreakerThreshold &&
                this.circuitBreakerState === CircuitBreakerState.CLOSED) {
                this.circuitBreakerState = CircuitBreakerState.OPEN;
                if (this.config.debug) {
                    console.log(`[TallyApiClient] Circuit breaker OPENED after ${this.consecutiveFailures} consecutive failures`);
                }
            }
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async handleResponseError(error, attempt) {
        const { retryConfig } = this.config;
        if (this.config.debug) {
            console.error(`[TallyApiClient] Response Error (attempt ${attempt + 1}):`, error.response?.status, error.response?.statusText);
        }
        this.updateCircuitBreakerState(false);
        if (!error.response) {
            const networkError = this.createNetworkError(error);
            if (this.shouldRetry(networkError, attempt)) {
                return this.retryRequest(error, attempt);
            }
            return Promise.reject(networkError);
        }
        const { status, statusText, headers, data } = error.response;
        if (status === 401 || status === 403) {
            if (this.tokenManager && attempt === 0) {
                try {
                    await this.refreshToken();
                    const originalRequest = error.config;
                    if (originalRequest) {
                        return this.axiosInstance.request(originalRequest);
                    }
                }
                catch (refreshError) {
                    await this.clearAuthentication();
                    return Promise.reject(new AuthenticationError('Authentication failed and token refresh failed', status, statusText, headers, refreshError));
                }
            }
            const authError = createErrorFromResponse(status, statusText, headers, data, error);
            return Promise.reject(authError);
        }
        if (status === 429) {
            const rateLimitError = createErrorFromResponse(status, statusText, headers, data, error);
            if (this.shouldRetry(rateLimitError, attempt)) {
                let delay;
                if (rateLimitError.retryAfter) {
                    delay = rateLimitError.retryAfter * 1000;
                }
                else {
                    delay = this.calculateBackoffDelay(attempt, retryConfig.baseDelayMs, retryConfig.exponentialBase, retryConfig.maxDelayMs, retryConfig.jitterFactor);
                }
                if (this.config.debug) {
                    console.log(`[TallyApiClient] Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts})`);
                }
                await this.sleep(delay);
                return this.retryRequest(error, attempt);
            }
            return Promise.reject(rateLimitError);
        }
        const standardizedError = createErrorFromResponse(status, statusText, headers, data, error);
        if (this.shouldRetry(standardizedError, attempt)) {
            return this.retryRequest(error, attempt);
        }
        return Promise.reject(standardizedError);
    }
    async retryRequest(originalError, attempt) {
        const { retryConfig } = this.config;
        const nextAttempt = attempt + 1;
        const delay = this.calculateBackoffDelay(attempt, retryConfig.baseDelayMs, retryConfig.exponentialBase, retryConfig.maxDelayMs, retryConfig.jitterFactor);
        if (this.config.debug) {
            console.log(`[TallyApiClient] Retrying request in ${delay}ms (attempt ${nextAttempt + 1}/${retryConfig.maxAttempts})`);
        }
        await this.sleep(delay);
        const originalRequest = originalError.config;
        if (originalRequest) {
            try {
                return await this.axiosInstance.request(originalRequest);
            }
            catch (retryError) {
                return this.handleResponseError(retryError, nextAttempt);
            }
        }
        return Promise.reject(originalError);
    }
    createNetworkError(error) {
        if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
            return new NetworkError('Network connection failed', error);
        }
        if (error.code === 'ECONNRESET' || error.message?.includes('timeout')) {
            return new TimeoutError('Request timeout', error);
        }
        return new NetworkError('Network error occurred', error);
    }
    setupInterceptors() {
        this.axiosInstance.interceptors.request.use(async (config) => {
            await this.ensureAuthenticated();
            if (this.config.debug) {
                console.log(`[TallyApiClient] Request: ${config.method?.toUpperCase()} ${config.url}`);
                if (config.data) {
                    console.log(`[TallyApiClient] Request Data:`, config.data);
                }
            }
            return config;
        }, (error) => {
            if (this.config.debug) {
                console.error('[TallyApiClient] Request Error:', error);
            }
            if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
                return Promise.reject(new NetworkError('Network connection failed', error));
            }
            if (error.code === 'ECONNRESET' || error.message?.includes('timeout')) {
                return Promise.reject(new TimeoutError('Request timeout', error));
            }
            return Promise.reject(error);
        });
        this.axiosInstance.interceptors.response.use((response) => {
            this.updateCircuitBreakerState(true);
            if (this.config.debug) {
                console.log(`[TallyApiClient] Response: ${response.status} ${response.statusText}`);
            }
            return response;
        }, async (error) => {
            return this.handleResponseError(error, 0);
        });
    }
    async inviteUserToWorkspace(workspaceId, email, role) {
        console.warn('Tally API does not officially support inviting users via the API. This is a placeholder.');
        return Promise.resolve({ success: true, message: `User ${email} invited to workspace ${workspaceId} as ${role}. (Mocked)` });
    }
    async removeUserFromWorkspace(workspaceId, userId) {
        console.warn('Tally API does not officially support removing users via the API. This is a placeholder.');
        return Promise.resolve({ success: true, message: `User ${userId} removed from workspace ${workspaceId}. (Mocked)` });
    }
    async updateUserRole(workspaceId, userId, role) {
        console.warn('Tally API does not officially support updating user roles via the API. This is a placeholder.');
        return Promise.resolve({ success: true, message: `User ${userId} role updated to ${role} in workspace ${workspaceId}. (Mocked)` });
    }
    isMockEnabled() {
        return process.env.USE_MOCK_API === 'true';
    }
}
//# sourceMappingURL=TallyApiClient.js.map