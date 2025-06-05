"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TallyApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const TokenManager_1 = require("./TokenManager");
const models_1 = require("../models");
class TallyApiClient {
    constructor(config = {}) {
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
        };
        if (config.oauth2Config) {
            this.config.oauth2Config = config.oauth2Config;
        }
        if (config.tokenStorage) {
            this.config.tokenStorage = config.tokenStorage;
        }
        if (this.config.oauth2Config) {
            this.tokenManager = new TokenManager_1.TokenManager(this.config.oauth2Config, this.config.tokenStorage);
        }
        this.axiosInstance = axios_1.default.create({
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
            throw new models_1.AuthenticationError('OAuth 2.0 configuration is required to exchange code for token');
        }
        try {
            const token = await this.tokenManager.exchangeCodeForToken(code);
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
            return token;
        }
        catch (error) {
            throw new models_1.AuthenticationError('Failed to exchange code for token', undefined, undefined, undefined, error);
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
            throw new models_1.AuthenticationError('OAuth 2.0 configuration is required to refresh token');
        }
        try {
            const token = await this.tokenManager.refreshToken();
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
            return token;
        }
        catch (error) {
            throw new models_1.AuthenticationError('Failed to refresh token', undefined, undefined, undefined, error);
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
        throw new models_1.AuthenticationError('No valid authentication found. Please authenticate first.', 401, 'Unauthorized');
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
                return Promise.reject(new models_1.NetworkError('Network connection failed', error));
            }
            if (error.code === 'ECONNRESET' || error.message?.includes('timeout')) {
                return Promise.reject(new models_1.TimeoutError('Request timeout', error));
            }
            return Promise.reject(error);
        });
        this.axiosInstance.interceptors.response.use((response) => {
            if (this.config.debug) {
                console.log(`[TallyApiClient] Response: ${response.status} ${response.statusText}`);
            }
            return response;
        }, async (error) => {
            if (this.config.debug) {
                console.error('[TallyApiClient] Response Error:', error.response?.status, error.response?.statusText);
            }
            if (!error.response) {
                if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
                    return Promise.reject(new models_1.NetworkError('Network connection failed', error));
                }
                if (error.code === 'ECONNRESET' || error.message?.includes('timeout')) {
                    return Promise.reject(new models_1.TimeoutError('Request timeout', error));
                }
                return Promise.reject(new models_1.NetworkError('Network error occurred', error));
            }
            const { status, statusText, headers, data } = error.response;
            if (status === 401 || status === 403) {
                if (this.tokenManager) {
                    try {
                        await this.refreshToken();
                        const originalRequest = error.config;
                        if (originalRequest) {
                            return this.axiosInstance.request(originalRequest);
                        }
                    }
                    catch (refreshError) {
                        await this.clearAuthentication();
                        return Promise.reject(new models_1.AuthenticationError('Authentication failed and token refresh failed', status, statusText, headers, refreshError));
                    }
                }
                return Promise.reject((0, models_1.createErrorFromResponse)(status, statusText, headers, data, error));
            }
            const standardizedError = (0, models_1.createErrorFromResponse)(status, statusText, headers, data, error);
            return Promise.reject(standardizedError);
        });
    }
}
exports.TallyApiClient = TallyApiClient;
//# sourceMappingURL=TallyApiClient.js.map