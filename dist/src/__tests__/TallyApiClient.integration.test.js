import { TallyApiClient } from '../services/TallyApiClient';
describe('TallyApiClient Integration Tests', () => {
    describe('Retry Configuration Integration', () => {
        it('should initialize with default retry configuration', () => {
            const client = new TallyApiClient();
            const config = client.getConfig();
            expect(config.retryConfig).toEqual({
                maxAttempts: 3,
                baseDelayMs: 1000,
                maxDelayMs: 30000,
                exponentialBase: 2,
                jitterFactor: 0.1,
                enableCircuitBreaker: true,
                circuitBreakerThreshold: 5,
                circuitBreakerTimeout: 60000,
            });
        });
        it('should accept custom retry configuration', () => {
            const customRetryConfig = {
                maxAttempts: 5,
                baseDelayMs: 500,
                maxDelayMs: 10000,
                exponentialBase: 1.5,
                jitterFactor: 0.2,
                enableCircuitBreaker: false,
                circuitBreakerThreshold: 3,
                circuitBreakerTimeout: 30000,
            };
            const client = new TallyApiClient({
                retryConfig: customRetryConfig,
            });
            const config = client.getConfig();
            expect(config.retryConfig).toEqual(customRetryConfig);
        });
        it('should merge partial retry configuration with defaults', () => {
            const partialRetryConfig = {
                maxAttempts: 5,
                baseDelayMs: 500,
            };
            const client = new TallyApiClient({
                retryConfig: partialRetryConfig,
            });
            const config = client.getConfig();
            expect(config.retryConfig).toEqual({
                maxAttempts: 5,
                baseDelayMs: 500,
                maxDelayMs: 30000,
                exponentialBase: 2,
                jitterFactor: 0.1,
                enableCircuitBreaker: true,
                circuitBreakerThreshold: 5,
                circuitBreakerTimeout: 60000,
            });
        });
        it('should have interceptors set up when retry config is provided', () => {
            const client = new TallyApiClient({
                accessToken: 'test-token',
                retryConfig: {
                    maxAttempts: 3,
                    enableCircuitBreaker: true,
                },
            });
            const axiosInstance = client.getAxiosInstance();
            expect(axiosInstance.interceptors).toBeDefined();
            expect(axiosInstance.interceptors.request).toBeDefined();
            expect(axiosInstance.interceptors.response).toBeDefined();
            expect(typeof axiosInstance.interceptors.request.use).toBe('function');
            expect(typeof axiosInstance.interceptors.response.use).toBe('function');
        });
        it('should maintain backward compatibility when no retry config is provided', () => {
            const client = new TallyApiClient({
                baseURL: 'https://custom-api.example.com',
                accessToken: 'test-token',
                timeout: 5000,
            });
            const config = client.getConfig();
            expect(config.retryConfig).toBeDefined();
            expect(config.retryConfig.maxAttempts).toBe(3);
            expect(config.retryConfig.enableCircuitBreaker).toBe(true);
            expect(config.baseURL).toBe('https://custom-api.example.com');
            expect(config.accessToken).toBe('test-token');
            expect(config.timeout).toBe(5000);
        });
    });
    describe('Error Handling Configuration', () => {
        it('should have proper error types available for retry logic', () => {
            const { RateLimitError, ServerError, NetworkError, BadRequestError } = require('../models');
            expect(RateLimitError).toBeDefined();
            expect(ServerError).toBeDefined();
            expect(NetworkError).toBeDefined();
            expect(BadRequestError).toBeDefined();
        });
        it('should create client with debug logging enabled', () => {
            const client = new TallyApiClient({
                debug: true,
                retryConfig: {
                    maxAttempts: 2,
                    baseDelayMs: 100,
                },
            });
            const config = client.getConfig();
            expect(config.debug).toBe(true);
            expect(config.retryConfig.maxAttempts).toBe(2);
            expect(config.retryConfig.baseDelayMs).toBe(100);
        });
    });
    describe('Circuit Breaker Configuration', () => {
        it('should configure circuit breaker with custom settings', () => {
            const client = new TallyApiClient({
                retryConfig: {
                    enableCircuitBreaker: true,
                    circuitBreakerThreshold: 3,
                    circuitBreakerTimeout: 45000,
                },
            });
            const config = client.getConfig();
            expect(config.retryConfig.enableCircuitBreaker).toBe(true);
            expect(config.retryConfig.circuitBreakerThreshold).toBe(3);
            expect(config.retryConfig.circuitBreakerTimeout).toBe(45000);
        });
        it('should allow disabling circuit breaker', () => {
            const client = new TallyApiClient({
                retryConfig: {
                    enableCircuitBreaker: false,
                },
            });
            const config = client.getConfig();
            expect(config.retryConfig.enableCircuitBreaker).toBe(false);
            expect(config.retryConfig.maxAttempts).toBe(3);
            expect(config.retryConfig.baseDelayMs).toBe(1000);
        });
    });
});
//# sourceMappingURL=TallyApiClient.integration.test.js.map