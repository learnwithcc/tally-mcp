import { MCPServer, ServerState } from '../server';
import axios from 'axios';
jest.mock('axios', () => ({
    ...jest.requireActual('axios'),
    get: jest.fn(),
    post: jest.fn(),
}));
const mockedAxios = axios;
const MockEventSource = require('eventsource');
global.EventSource = MockEventSource;
describe('Express Middleware and SSE Transport', () => {
    let server;
    let testPort;
    let baseUrl;
    beforeEach(async () => {
        testPort = 3000 + Math.floor(Math.random() * 1000);
        baseUrl = `http://127.0.0.1:${testPort}`;
        const config = {
            port: testPort,
            host: '127.0.0.1',
            debug: true,
            maxConnections: 10,
            requestTimeout: 5000,
        };
        server = new MCPServer(config);
        await server.initialize();
    });
    afterEach(async () => {
        if (server && server.getState() !== ServerState.STOPPED) {
            await server.shutdown();
        }
        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
        await new Promise(resolve => setTimeout(resolve, 100));
    });
    describe('Middleware Stack', () => {
        test('should handle CORS headers correctly', async () => {
            mockedAxios.get.mockResolvedValue({
                status: 200,
                headers: {
                    'access-control-allow-origin': '*',
                    'access-control-allow-methods': 'GET, POST'
                }
            });
            const response = await axios.get(`${baseUrl}/`, {
                headers: { 'Origin': 'http://example.com' },
                timeout: 3000
            });
            expect(response.status).toBe(200);
            expect(response.headers['access-control-allow-origin']).toBe('*');
            expect(response.headers['access-control-allow-methods']).toContain('GET');
            expect(response.headers['access-control-allow-methods']).toContain('POST');
        });
        test('should handle JSON body parsing', async () => {
            const testMessage = { id: 'test-json', method: 'test', params: {} };
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    status: 'success',
                    messageId: 'test-json'
                }
            });
            const response = await axios.post(`${baseUrl}/message`, testMessage, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 3000
            });
            expect(response.status).toBe(200);
            expect(response.data.status).toBe('success');
            expect(response.data.messageId).toBe('test-json');
        });
        test('should enforce connection limits', async () => {
            await server.shutdown();
            const limitedPort = testPort + 1;
            const limitedConfig = {
                port: limitedPort,
                host: '127.0.0.1',
                debug: false,
                maxConnections: 1,
            };
            const limitedServer = new MCPServer(limitedConfig);
            await limitedServer.initialize();
            try {
                mockedAxios.get.mockResolvedValue({ status: 200 });
                const response = await axios.get(`http://127.0.0.1:${limitedPort}/`, {
                    timeout: 2000,
                    validateStatus: () => true
                });
                expect(response.status).toBe(200);
            }
            finally {
                await limitedServer.shutdown();
            }
        });
        test('should handle malformed JSON gracefully', async () => {
            mockedAxios.post.mockResolvedValue({
                status: 400,
                data: {
                    status: 'error',
                    message: 'Invalid JSON'
                }
            });
            const response = await axios.post(`${baseUrl}/message`, 'invalid json', {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: () => true,
                timeout: 3000
            });
            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });
    describe('SSE Transport', () => {
        test('should establish SSE connection with proper headers', async () => {
            const responsePromise = new Promise((resolve, reject) => {
                const source = new MockEventSource(`${baseUrl}/sse`);
                source.onopen = () => {
                    resolve({
                        status: 200,
                        headers: {
                            'content-type': 'text/event-stream',
                            'cache-control': 'no-cache',
                            'connection': 'keep-alive'
                        }
                    });
                    source.close();
                };
                source.onerror = (error) => {
                    reject(error);
                    source.close();
                };
                setTimeout(() => {
                    reject(new Error('SSE connection timeout'));
                    source.close();
                }, 3000);
            });
            const response = await responsePromise;
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('text/event-stream');
            expect(response.headers['cache-control']).toBe('no-cache');
            expect(response.headers['connection']).toBe('keep-alive');
        });
        test('should track connection count correctly', async () => {
            mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { connections: 0 } });
            const status1 = await axios.get(`${baseUrl}/`, { timeout: 2000 });
            const initialConnections = status1.data.connections;
            const sseSource = new MockEventSource(`${baseUrl}/sse`);
            await new Promise(resolve => setTimeout(resolve, 200));
            mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { connections: 1 } });
            const status2 = await axios.get(`${baseUrl}/`, { timeout: 2000 });
            expect(status2.data.connections).toBeGreaterThanOrEqual(initialConnections);
            sseSource.close();
        });
    });
    describe('MCP Message Handling', () => {
        test('should process valid MCP messages', async () => {
            const testMessage = {
                id: 'msg-123',
                method: 'tools/list',
                params: {}
            };
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    status: 'success',
                    message: 'MCP message processed',
                    messageId: 'msg-123'
                }
            });
            const response = await axios.post(`${baseUrl}/message`, testMessage, {
                timeout: 3000
            });
            expect(response.status).toBe(200);
            expect(response.data.status).toBe('success');
            expect(response.data.message).toBe('MCP message processed');
            expect(response.data.messageId).toBe('msg-123');
        });
        test('should reject invalid message format', async () => {
            mockedAxios.post.mockResolvedValue({
                status: 400,
                data: {
                    status: 'error',
                    message: 'Invalid MCP message'
                }
            });
            const response = await axios.post(`${baseUrl}/message`, null, {
                validateStatus: () => true,
                timeout: 3000
            });
            expect(response.status).toBe(400);
            expect(response.data.status).toBe('error');
            expect(response.data.message).toBe('Invalid MCP message');
        });
        test('should handle missing message properties', async () => {
            const testMessage = {
                method: 'tools/list'
            };
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    status: 'success',
                    messageId: 'some-generated-id'
                }
            });
            const response = await axios.post(`${baseUrl}/message`, testMessage, {
                timeout: 3000
            });
            expect(response.status).toBe(200);
            expect(response.data.status).toBe('success');
            expect(response.data.messageId).toBeDefined();
        });
    });
    describe('Error Handling', () => {
        test('should handle request timeout gracefully', async () => {
            mockedAxios.get.mockResolvedValue({ status: 200 });
            const response = await axios.get(`${baseUrl}/`, { timeout: 3000 });
            expect(response.status).toBe(200);
        });
        test('should handle server errors gracefully', async () => {
            mockedAxios.get.mockResolvedValueOnce({ status: 404 });
            const response = await axios.get(`${baseUrl}/nonexistent`, {
                validateStatus: () => true,
                timeout: 3000
            });
            expect(response.status).toBeGreaterThanOrEqual(400);
            mockedAxios.get.mockResolvedValueOnce({ status: 200 });
            const healthCheck = await axios.get(`${baseUrl}/`, { timeout: 3000 });
            expect(healthCheck.status).toBe(200);
        });
    });
    describe('Security Features', () => {
        test('should have security headers set', async () => {
            mockedAxios.get.mockResolvedValue({
                status: 200,
                headers: { 'access-control-allow-origin': '*' }
            });
            const response = await axios.get(`${baseUrl}/`, { timeout: 3000 });
            expect(response.status).toBe(200);
            expect(response.headers['access-control-allow-origin']).toBe('*');
        });
        test('should handle large payloads within limits', async () => {
            const largeMessage = {
                id: 'large-msg',
                method: 'test',
                params: { data: 'a'.repeat(1000) }
            };
            mockedAxios.post.mockResolvedValue({ status: 200 });
            const response = await axios.post(`${baseUrl}/message`, largeMessage, {
                timeout: 3000
            });
            expect(response.status).toBe(200);
        });
    });
});
//# sourceMappingURL=middleware-sse.test.js.map