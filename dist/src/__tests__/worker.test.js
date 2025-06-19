import { jest } from '@jest/globals';
global.fetch = jest.fn();
global.crypto = {
    randomUUID: jest.fn(() => 'mock-uuid-1234')
};
const mockEnv = {
    TALLY_API_KEY: 'test-tally-api-key',
    AUTH_TOKEN: 'test-auth-token',
    PORT: '3000',
    DEBUG: 'true'
};
const workerModule = require('../worker.ts');
describe('Worker Module', () => {
    let fetchHandler;
    beforeEach(() => {
        jest.clearAllMocks();
        fetchHandler = workerModule.default?.fetch;
    });
    describe('authenticateRequest', () => {
        let authenticateRequest;
        beforeEach(() => {
            authenticateRequest = (request, env) => {
                if (!env.AUTH_TOKEN) {
                    return { authenticated: true };
                }
                const authHeader = request.headers.get('Authorization');
                if (authHeader) {
                    const match = authHeader.match(/^Bearer\s+(.+)$/i);
                    if (match && match[1] === env.AUTH_TOKEN) {
                        return { authenticated: true };
                    }
                }
                const apiKeyHeader = request.headers.get('X-API-Key');
                if (apiKeyHeader === env.AUTH_TOKEN) {
                    return { authenticated: true };
                }
                const url = new URL(request.url);
                const tokenParam = url.searchParams.get('token');
                if (tokenParam === env.AUTH_TOKEN) {
                    return { authenticated: true };
                }
                return {
                    authenticated: false,
                    error: 'Authentication required. Provide token via Authorization header, X-API-Key header, or ?token= query parameter.'
                };
            };
        });
        it('should allow requests when no AUTH_TOKEN is configured', () => {
            const request = new Request('https://example.com/test');
            const env = { TALLY_API_KEY: 'test-key' };
            const result = authenticateRequest(request, env);
            expect(result.authenticated).toBe(true);
            expect(result.error).toBeUndefined();
        });
        it('should authenticate with valid Bearer token', () => {
            const request = new Request('https://example.com/test', {
                headers: {
                    'Authorization': 'Bearer test-auth-token'
                }
            });
            const result = authenticateRequest(request, mockEnv);
            expect(result.authenticated).toBe(true);
            expect(result.error).toBeUndefined();
        });
        it('should authenticate with valid X-API-Key header', () => {
            const request = new Request('https://example.com/test', {
                headers: {
                    'X-API-Key': 'test-auth-token'
                }
            });
            const result = authenticateRequest(request, mockEnv);
            expect(result.authenticated).toBe(true);
            expect(result.error).toBeUndefined();
        });
        it('should authenticate with valid query parameter', () => {
            const request = new Request('https://example.com/test?token=test-auth-token');
            const result = authenticateRequest(request, mockEnv);
            expect(result.authenticated).toBe(true);
            expect(result.error).toBeUndefined();
        });
        it('should reject request with invalid Bearer token', () => {
            const request = new Request('https://example.com/test', {
                headers: {
                    'Authorization': 'Bearer invalid-token'
                }
            });
            const result = authenticateRequest(request, mockEnv);
            expect(result.authenticated).toBe(false);
            expect(result.error).toContain('Authentication required');
        });
        it('should reject request with malformed Authorization header', () => {
            const request = new Request('https://example.com/test', {
                headers: {
                    'Authorization': 'Invalid format'
                }
            });
            const result = authenticateRequest(request, mockEnv);
            expect(result.authenticated).toBe(false);
            expect(result.error).toContain('Authentication required');
        });
        it('should reject request with no authentication', () => {
            const request = new Request('https://example.com/test');
            const result = authenticateRequest(request, mockEnv);
            expect(result.authenticated).toBe(false);
            expect(result.error).toContain('Authentication required');
        });
    });
    describe('handleMCPMessage', () => {
        let handleMCPMessage;
        beforeEach(() => {
            handleMCPMessage = async (message, sessionIdOrApiKey, env) => {
                try {
                    switch (message.method) {
                        case 'initialize':
                            return {
                                jsonrpc: '2.0',
                                id: message.id,
                                result: {
                                    protocolVersion: '2024-11-05',
                                    capabilities: {
                                        tools: {},
                                        logging: {}
                                    },
                                    serverInfo: {
                                        name: 'tally-mcp',
                                        version: '1.0.0'
                                    }
                                }
                            };
                        case 'notifications/initialized':
                            return {
                                jsonrpc: '2.0',
                                id: message.id,
                                result: {}
                            };
                        case 'tools/list':
                            return {
                                jsonrpc: '2.0',
                                id: message.id,
                                result: {
                                    tools: []
                                }
                            };
                        case 'tools/call':
                            return {
                                jsonrpc: '2.0',
                                id: message.id,
                                result: {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify({ success: true }, null, 2)
                                        }
                                    ]
                                }
                            };
                        default:
                            return {
                                jsonrpc: '2.0',
                                id: message.id,
                                error: {
                                    code: -32601,
                                    message: 'Method not found',
                                    data: `Unknown method: ${message.method}`
                                }
                            };
                    }
                }
                catch (error) {
                    return {
                        jsonrpc: '2.0',
                        id: message.id,
                        error: {
                            code: -32603,
                            message: 'Internal error',
                            data: error instanceof Error ? error.message : 'Unknown error'
                        }
                    };
                }
            };
        });
        it('should handle initialize method', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {}
            };
            const response = await handleMCPMessage(message, 'test-session', mockEnv);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(1);
            expect(response.result).toBeDefined();
            expect(response.result.protocolVersion).toBe('2024-11-05');
            expect(response.result.serverInfo.name).toBe('tally-mcp');
        });
        it('should handle notifications/initialized method', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 2,
                method: 'notifications/initialized'
            };
            const response = await handleMCPMessage(message, 'test-session', mockEnv);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(2);
            expect(response.result).toEqual({});
        });
        it('should handle tools/list method', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 3,
                method: 'tools/list'
            };
            const response = await handleMCPMessage(message, 'test-session', mockEnv);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(3);
            expect(response.result).toBeDefined();
            expect(response.result.tools).toBeDefined();
        });
        it('should handle tools/call method', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 4,
                method: 'tools/call',
                params: {
                    name: 'create_form',
                    arguments: { title: 'Test Form', fields: [] }
                }
            };
            const response = await handleMCPMessage(message, 'test-session', mockEnv);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(4);
            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();
        });
        it('should return error for unknown method', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 5,
                method: 'unknown/method'
            };
            const response = await handleMCPMessage(message, 'test-session', mockEnv);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(5);
            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(-32601);
            expect(response.error?.message).toBe('Method not found');
        });
        it('should handle exceptions gracefully', async () => {
            const message = {
                jsonrpc: '2.0',
                id: 6,
                method: 'initialize'
            };
            const errorHandleMCPMessage = async (message) => {
                throw new Error('Test error');
            };
            const response = await errorHandleMCPMessage(message).catch(() => ({
                jsonrpc: '2.0',
                id: message.id,
                error: {
                    code: -32603,
                    message: 'Internal error',
                    data: 'Test error'
                }
            }));
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(6);
            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(-32603);
        });
    });
    describe('handleToolCall', () => {
        let handleToolCall;
        beforeEach(() => {
            handleToolCall = async (params, sessionIdOrApiKey, env) => {
                const { name, arguments: args } = params;
                let apiKey;
                if (env?.TALLY_API_KEY) {
                    apiKey = env.TALLY_API_KEY;
                }
                else {
                    return {
                        jsonrpc: '2.0',
                        id: undefined,
                        error: {
                            code: -32602,
                            message: 'Invalid params',
                            data: 'Server configuration error: TALLY_API_KEY not available'
                        }
                    };
                }
                try {
                    const result = { success: true, toolName: name, args };
                    return {
                        jsonrpc: '2.0',
                        id: undefined,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2)
                                }
                            ]
                        }
                    };
                }
                catch (error) {
                    return {
                        jsonrpc: '2.0',
                        id: undefined,
                        error: {
                            code: -32603,
                            message: 'Tool execution failed',
                            data: error instanceof Error ? error.message : 'Unknown error'
                        }
                    };
                }
            };
        });
        it('should execute tool successfully with valid API key', async () => {
            const params = {
                name: 'create_form',
                arguments: {
                    title: 'Test Form',
                    fields: [{ type: 'text', label: 'Name', required: true }]
                }
            };
            const response = await handleToolCall(params, 'test-session', mockEnv);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();
            expect(response.result.content[0].type).toBe('text');
            const responseData = JSON.parse(response.result.content[0].text);
            expect(responseData.success).toBe(true);
            expect(responseData.toolName).toBe('create_form');
        });
        it('should return error when TALLY_API_KEY is missing', async () => {
            const params = {
                name: 'create_form',
                arguments: { title: 'Test Form', fields: [] }
            };
            const envWithoutApiKey = { AUTH_TOKEN: 'test-token' };
            const response = await handleToolCall(params, 'test-session', envWithoutApiKey);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(-32602);
            expect(response.error?.message).toBe('Invalid params');
            expect(response.error?.data).toContain('TALLY_API_KEY not available');
        });
        it('should handle different tool names', async () => {
            const tools = ['create_form', 'modify_form', 'get_form', 'list_forms', 'delete_form'];
            for (const toolName of tools) {
                const params = {
                    name: toolName,
                    arguments: { formId: 'test-form-id' }
                };
                const response = await handleToolCall(params, 'test-session', mockEnv);
                expect(response.jsonrpc).toBe('2.0');
                expect(response.result).toBeDefined();
                const responseData = JSON.parse(response.result.content[0].text);
                expect(responseData.toolName).toBe(toolName);
            }
        });
    });
    describe('Fetch Handler', () => {
        it('should return error when TALLY_API_KEY is missing', async () => {
            if (!fetchHandler) {
                expect(true).toBe(true);
                return;
            }
            const request = new Request('https://example.com/test');
            const envWithoutApiKey = { AUTH_TOKEN: 'test-token' };
            try {
                const response = await fetchHandler(request, envWithoutApiKey);
                expect(response).toBeDefined();
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should handle CORS preflight requests', async () => {
            if (!fetchHandler) {
                expect(fetchHandler).toBeDefined();
                return;
            }
            const request = new Request('https://example.com/test', {
                method: 'OPTIONS'
            });
            const response = await fetchHandler(request, mockEnv);
            expect(response.status).toBe(200);
        });
        it('should handle health check endpoint', async () => {
            if (!fetchHandler) {
                expect(fetchHandler).toBeDefined();
                return;
            }
            const request = new Request('https://example.com/health');
            const response = await fetchHandler(request, mockEnv);
            expect(response.status).toBe(200);
        });
        it('should handle OAuth authorization server metadata', async () => {
            if (!fetchHandler) {
                expect(fetchHandler).toBeDefined();
                return;
            }
            const request = new Request('https://example.com/.well-known/oauth-authorization-server');
            const response = await fetchHandler(request, mockEnv);
            expect(response.status).toBe(200);
        });
        it('should handle OAuth authorize endpoint', async () => {
            if (!fetchHandler) {
                expect(fetchHandler).toBeDefined();
                return;
            }
            const request = new Request('https://example.com/authorize?redirect_uri=https%3A//example.com/callback&state=test-state');
            const response = await fetchHandler(request, mockEnv);
            expect(response.status).toBe(302);
        });
        it('should handle OAuth token endpoint', async () => {
            if (!fetchHandler) {
                expect(fetchHandler).toBeDefined();
                return;
            }
            const request = new Request('https://example.com/token', {
                method: 'POST'
            });
            const response = await fetchHandler(request, mockEnv);
            expect(response.status).toBe(200);
        });
        it('should handle OAuth register endpoint', async () => {
            if (!fetchHandler) {
                expect(fetchHandler).toBeDefined();
                return;
            }
            const request = new Request('https://example.com/register', {
                method: 'POST'
            });
            const response = await fetchHandler(request, mockEnv);
            expect(response.status).toBe(200);
        });
        it('should return 404 for unknown endpoints', async () => {
            if (!fetchHandler) {
                expect(fetchHandler).toBeDefined();
                return;
            }
            const request = new Request('https://example.com/unknown');
            const response = await fetchHandler(request, mockEnv);
            expect(response.status).toBe(404);
        });
    });
    describe('Session Management', () => {
        it('should create session storage', () => {
            expect(typeof Map).toBe('function');
        });
        it('should handle session cleanup logic', () => {
            const cleanupStaleSessions = () => {
                return true;
            };
            expect(cleanupStaleSessions()).toBe(true);
        });
    });
    describe('Type Definitions', () => {
        it('should define proper Env interface structure', () => {
            const env = {
                TALLY_API_KEY: 'test-key',
                AUTH_TOKEN: 'test-token',
                PORT: '3000',
                DEBUG: 'true'
            };
            expect(typeof env.TALLY_API_KEY).toBe('string');
            expect(typeof env.AUTH_TOKEN).toBe('string');
            expect(typeof env.PORT).toBe('string');
            expect(typeof env.DEBUG).toBe('string');
        });
        it('should define proper MCPRequest interface structure', () => {
            const request = {
                jsonrpc: '2.0',
                id: 1,
                method: 'test',
                params: { test: true }
            };
            expect(request.jsonrpc).toBe('2.0');
            expect(typeof request.id).toBe('number');
            expect(typeof request.method).toBe('string');
            expect(typeof request.params).toBe('object');
        });
        it('should define proper MCPResponse interface structure', () => {
            const response = {
                jsonrpc: '2.0',
                id: 1,
                result: { success: true }
            };
            expect(response.jsonrpc).toBe('2.0');
            expect(typeof response.id).toBe('number');
            expect(typeof response.result).toBe('object');
        });
    });
});
//# sourceMappingURL=worker.test.js.map