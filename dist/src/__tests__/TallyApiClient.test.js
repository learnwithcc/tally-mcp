import axios from 'axios';
import { TallyApiClient } from '../services/TallyApiClient';
import { TallySubmissionSchema, TallyWorkspaceSchema, } from '../models';
jest.mock('axios');
const mockedAxios = axios;
describe('TallyApiClient', () => {
    let client;
    let mockAxiosInstance;
    beforeEach(() => {
        jest.clearAllMocks();
        mockAxiosInstance = {
            request: jest.fn(),
            defaults: {
                headers: {
                    common: {},
                },
            },
            interceptors: {
                request: {
                    use: jest.fn(),
                },
                response: {
                    use: jest.fn(),
                },
            },
        };
        mockedAxios.create.mockReturnValue(mockAxiosInstance);
    });
    describe('Constructor and Configuration', () => {
        it('should create a client with default configuration', () => {
            client = new TallyApiClient();
            expect(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: 'https://api.tally.so',
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                responseType: 'json',
            });
            const config = client.getConfig();
            expect(config.baseURL).toBe('https://api.tally.so');
            expect(config.timeout).toBe(30000);
            expect(config.debug).toBe(false);
            expect(config.accessToken).toBe('');
        });
        it('should create a client with custom configuration', () => {
            const customConfig = {
                baseURL: 'https://custom-api.example.com',
                timeout: 5000,
                defaultHeaders: {
                    'Custom-Header': 'custom-value',
                },
                accessToken: 'test-token',
                debug: true,
            };
            client = new TallyApiClient(customConfig);
            expect(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: 'https://custom-api.example.com',
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Custom-Header': 'custom-value',
                },
                responseType: 'json',
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
            expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
        });
        it('should not set Authorization header if no access token is provided', () => {
            client = new TallyApiClient();
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });
    });
    describe('Access Token Management', () => {
        beforeEach(() => {
            client = new TallyApiClient();
        });
        it('should set access token and update Authorization header', () => {
            const token = 'new-access-token';
            client.setAccessToken(token);
            expect(client.getAccessToken()).toBe(token);
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
        });
        it('should remove Authorization header when setting empty token', () => {
            client.setAccessToken('some-token');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer some-token');
            client.setAccessToken('');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });
        it('should return current access token', () => {
            expect(client.getAccessToken()).toBe('');
            client.setAccessToken('test-token');
            expect(client.getAccessToken()).toBe('test-token');
        });
    });
    describe('HTTP Methods', () => {
        beforeEach(() => {
            client = new TallyApiClient({ accessToken: 'test-token' });
        });
        const mockResponseData = { id: 1, name: 'Test Data' };
        const mockAxiosResponse = {
            data: mockResponseData,
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            config: {
                headers: {},
            },
        };
        it('should make a GET request', async () => {
            mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);
            const response = await client.get('/test-endpoint');
            expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/test-endpoint',
                data: undefined,
            });
            expect(response).toEqual({
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            });
        });
        it('should make a GET request with custom config', async () => {
            mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);
            const customConfig = { params: { limit: 10 } };
            await client.get('/test-endpoint', customConfig);
            expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/test-endpoint',
                data: undefined,
                params: { limit: 10 },
            });
        });
        it('should make a POST request with data', async () => {
            mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);
            const postData = { name: 'Test Form' };
            await client.post('/forms', postData);
            expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                method: 'POST',
                url: '/forms',
                data: postData,
            });
        });
        it('should make a PUT request with data', async () => {
            mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);
            const putData = { name: 'Updated Form' };
            await client.put('/forms/123', putData);
            expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                method: 'PUT',
                url: '/forms/123',
                data: putData,
            });
        });
        it('should make a DELETE request', async () => {
            mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);
            await client.delete('/forms/123');
            expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                method: 'DELETE',
                url: '/forms/123',
                data: undefined,
            });
        });
        it('should make a PATCH request with data', async () => {
            mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);
            const patchData = { enabled: false };
            await client.patch('/forms/123', patchData);
            expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                method: 'PATCH',
                url: '/forms/123',
                data: patchData,
            });
        });
    });
    describe('Error Handling', () => {
        beforeEach(() => {
            client = new TallyApiClient({ accessToken: 'test-token' });
        });
        it('should propagate axios errors', async () => {
            const axiosError = new Error('Network Error');
            mockAxiosInstance.request.mockRejectedValue(axiosError);
            await expect(client.get('/test-error')).rejects.toThrow('Network Error');
        });
        it('should propagate HTTP error responses', async () => {
            const errorResponse = {
                data: { message: 'Not Found' },
                status: 404,
                statusText: 'Not Found',
                headers: {},
                config: {
                    headers: {},
                },
            };
            mockAxiosInstance.request.mockRejectedValue({ response: errorResponse, isAxiosError: true });
            try {
                await client.get('/not-found');
            }
            catch (error) {
                expect(error.response).toEqual(errorResponse);
            }
        });
    });
    describe('Utility Methods', () => {
        beforeEach(() => {
            client = new TallyApiClient();
        });
        it('should return the axios instance', () => {
            const axiosInstance = client.getAxiosInstance();
            expect(axiosInstance).toBe(mockAxiosInstance);
        });
        it('should return readonly configuration', () => {
            const config = client.getConfig();
            expect(config).toEqual({
                baseURL: 'https://api.tally.so',
                timeout: 30000,
                defaultHeaders: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                accessToken: '',
                debug: false,
                retryConfig: {
                    maxAttempts: 3,
                    baseDelayMs: 1000,
                    maxDelayMs: 30000,
                    exponentialBase: 2,
                    jitterFactor: 0.1,
                    enableCircuitBreaker: true,
                    circuitBreakerThreshold: 5,
                    circuitBreakerTimeout: 60000,
                },
            });
            try {
                config.baseURL = 'https://malicious.example.com';
            }
            catch (error) {
            }
            const freshConfig = client.getConfig();
            expect(freshConfig.baseURL).toBe('https://api.tally.so');
        });
    });
    describe('Interceptors', () => {
        it('should always setup interceptors for authentication and error handling', () => {
            client = new TallyApiClient({ debug: false });
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
            expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
        });
        it('should setup interceptors with debug logging when debug is enabled', () => {
            client = new TallyApiClient({ debug: true });
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
            expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
        });
    });
    describe('Type Safety', () => {
        beforeEach(() => {
            client = new TallyApiClient({ accessToken: 'test-token' });
        });
        it('should maintain type safety with generic responses', async () => {
            const mockResponse = {
                data: { id: 1, name: 'Test' },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {
                    headers: {},
                },
            };
            mockAxiosInstance.request.mockResolvedValue(mockResponse);
            const response = await client.get('/test');
            expect(response.data.id).toBe(1);
            expect(response.data.name).toBe('Test');
        });
    });
    describe('Rate Limiting and Retry Logic', () => {
        beforeEach(() => {
            client = new TallyApiClient({
                accessToken: 'test-token',
                debug: false,
                retryConfig: {
                    maxAttempts: 3,
                    baseDelayMs: 10,
                    maxDelayMs: 100,
                    exponentialBase: 2,
                    jitterFactor: 0,
                    enableCircuitBreaker: true,
                    circuitBreakerThreshold: 2,
                    circuitBreakerTimeout: 1000,
                }
            });
        });
        it('should have retry configuration set correctly', () => {
            const config = client.getConfig();
            expect(config.retryConfig).toEqual({
                maxAttempts: 3,
                baseDelayMs: 10,
                maxDelayMs: 100,
                exponentialBase: 2,
                jitterFactor: 0,
                enableCircuitBreaker: true,
                circuitBreakerThreshold: 2,
                circuitBreakerTimeout: 1000,
            });
        });
        it('should setup interceptors for retry logic', () => {
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
            expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
        });
        it('should handle custom retry configuration', () => {
            const customClient = new TallyApiClient({
                retryConfig: {
                    maxAttempts: 5,
                    baseDelayMs: 500,
                    maxDelayMs: 10000,
                    exponentialBase: 3,
                    jitterFactor: 0.2,
                    enableCircuitBreaker: false,
                    circuitBreakerThreshold: 10,
                    circuitBreakerTimeout: 30000,
                }
            });
            const config = customClient.getConfig();
            expect(config.retryConfig).toEqual({
                maxAttempts: 5,
                baseDelayMs: 500,
                maxDelayMs: 10000,
                exponentialBase: 3,
                jitterFactor: 0.2,
                enableCircuitBreaker: false,
                circuitBreakerThreshold: 10,
                circuitBreakerTimeout: 30000,
            });
        });
    });
    describe('Type-Safe API Methods with Zod Validation', () => {
        let client;
        beforeEach(() => {
            client = new TallyApiClient({ accessToken: 'test-token' });
        });
        describe('getSubmissions', () => {
            it('should validate and return submissions response', async () => {
                const validSubmissionsData = {
                    hasMore: false,
                    limit: 10,
                    page: 1,
                    submissions: [
                        {
                            id: 'sub_1',
                            formId: 'form_123',
                            respondentId: 'resp_1',
                            isCompleted: true,
                            submittedAt: new Date().toISOString(),
                            responses: [
                                {
                                    questionId: 'q1',
                                    value: 'Test User'
                                }
                            ]
                        }
                    ],
                    questions: [],
                    totalNumberOfSubmissionsPerFilter: {
                        all: 1,
                        completed: 1,
                        partial: 0,
                    },
                };
                const mockResponse = {
                    data: validSubmissionsData,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {
                        headers: {},
                    },
                };
                mockAxiosInstance.request.mockResolvedValue(mockResponse);
                const result = await client.getSubmissions('form123', { page: 1, limit: 10 });
                expect(result).toEqual(validSubmissionsData);
                expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                    method: 'GET',
                    url: '/forms/form123/submissions?page=1&limit=10',
                    data: undefined,
                });
            });
            it('should throw validation error for invalid submissions response', async () => {
                const invalidData = { hasMore: false, submissions: [{ id: 'sub_1', responses: 'invalid' }] };
                const mockResponse = {
                    data: invalidData,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {
                        headers: {},
                    },
                };
                mockAxiosInstance.request.mockResolvedValue(mockResponse);
                await expect(client.getSubmissions('form123', { page: 1, limit: 10 })).rejects.toThrow();
            });
        });
        describe('getForm', () => {
            it('should validate and return form data', async () => {
                const validFormData = {
                    id: 'form123',
                    title: 'Contact Us',
                    description: 'Get in touch with our team',
                    status: 'published',
                    isPublished: true,
                    url: 'https://tally.so/r/form_123456789',
                    embedUrl: 'https://tally.so/embed/form_123456789',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    submissionsCount: 42,
                };
                const mockResponse = {
                    data: validFormData,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {
                        headers: {},
                    },
                };
                mockAxiosInstance.request.mockResolvedValue(mockResponse);
                const result = await client.getForm('form123');
                expect(result).toEqual(validFormData);
                expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                    method: 'GET',
                    url: '/forms/form123',
                    data: undefined,
                });
            });
            it('should throw validation error for invalid form response', async () => {
                const invalidData = { id: 'form123', title: 'Test Form', submissionsCount: 'not-a-number' };
                const mockResponse = {
                    data: invalidData,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {
                        headers: {},
                    },
                };
                mockAxiosInstance.request.mockResolvedValue(mockResponse);
                await expect(client.getForm('form123')).rejects.toThrow();
            });
        });
        describe('validateResponse', () => {
            it('should return success result for valid data', () => {
                const validSubmission = {
                    id: 'sub1',
                    formId: 'form123',
                    respondentId: 'resp1',
                    isCompleted: true,
                    submittedAt: '2024-01-01T11:00:00Z',
                    responses: [],
                };
                const result = client.validateResponse(TallySubmissionSchema, validSubmission);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual(validSubmission);
                }
            });
            it('should return error result for invalid data', () => {
                const invalidData = {
                    id: 123,
                    formId: null,
                };
                const result = client.validateResponse(TallySubmissionSchema, invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error).toBeDefined();
                    expect(result.error.issues.length).toBeGreaterThan(0);
                }
            });
        });
        describe('requestWithValidation', () => {
            it('should make request and validate response with schema', async () => {
                const validWorkspace = {
                    id: 'ws1',
                    name: 'Test Workspace',
                    slug: 'test-workspace',
                    createdAt: '2024-01-01T10:00:00Z',
                    updatedAt: '2024-01-01T10:00:00Z',
                    members: [],
                };
                const mockResponse = {
                    data: validWorkspace,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: { headers: {} },
                };
                mockAxiosInstance.request.mockResolvedValue(mockResponse);
                const result = await client.requestWithValidation('GET', '/workspaces/ws1', TallyWorkspaceSchema);
                expect(result).toEqual(validWorkspace);
                expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                    method: 'GET',
                    url: '/workspaces/ws1',
                    data: undefined,
                });
            });
            it('should throw validation error for invalid response data', async () => {
                const invalidData = {
                    id: 123,
                    name: null,
                };
                const mockResponse = {
                    data: invalidData,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: { headers: {} },
                };
                mockAxiosInstance.request.mockResolvedValue(mockResponse);
                await expect(client.requestWithValidation('GET', '/workspaces/ws1', TallyWorkspaceSchema)).rejects.toThrow();
            });
        });
    });
});
//# sourceMappingURL=TallyApiClient.test.js.map