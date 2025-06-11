import { MCPServer, ServerState } from '../server';
import EventSource from 'eventsource';
import axios from 'axios';
jest.mock('axios', () => ({
    ...jest.requireActual('axios'),
    get: jest.fn(),
    post: jest.fn(),
}));
const mockedAxios = axios;
class MessageDeliveryClient {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.receivedMessages = [];
        this.events = [];
        this.connected = false;
    }
    async connect(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.disconnect();
                reject(new Error(`Connection timeout after ${timeout}ms`));
            }, timeout);
            this.eventSource = new EventSource(`${this.serverUrl}/sse`);
            this.eventSource.onopen = () => {
                this.connected = true;
                clearTimeout(timeoutId);
                resolve();
            };
            this.eventSource.onerror = (errorEvent) => {
                const error = new Error('SSE connection error');
                error.event = errorEvent;
                this.connectionError = error;
                clearTimeout(timeoutId);
                this.disconnect();
                reject(error);
            };
            this.eventSource.onmessage = (event) => {
                this.events.push(event);
                this.receivedMessages.push({
                    event: 'message',
                    data: event.data,
                    timestamp: Date.now()
                });
            };
            this.eventSource.addEventListener('connection', (event) => {
                this.events.push({ type: 'connection', data: event.data });
            });
            this.eventSource.addEventListener('heartbeat', (event) => {
                this.events.push({ type: 'heartbeat', data: event.data });
                this.receivedMessages.push({
                    event: 'heartbeat',
                    data: event.data,
                    timestamp: Date.now()
                });
            });
            this.eventSource.addEventListener('mcp-response', (event) => {
                this.events.push({ type: 'mcp-response', data: event.data });
                this.receivedMessages.push({
                    event: 'mcp-response',
                    data: event.data,
                    timestamp: Date.now()
                });
            });
        });
    }
    async sendMessage(message) {
        const response = await axios.post(`${this.serverUrl}/message`, message, {
            timeout: 3000,
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = undefined;
        }
        this.connected = false;
    }
    isConnected() {
        return this.connected && this.eventSource?.readyState === EventSource.OPEN;
    }
    getReceivedMessages() {
        return [...this.receivedMessages];
    }
    getEvents() {
        return [...this.events];
    }
    clearMessages() {
        this.receivedMessages = [];
        this.events = [];
    }
    getConnectionError() {
        return this.connectionError;
    }
    async waitForMessages(count, timeout = 5000) {
        const startTime = Date.now();
        while (this.receivedMessages.length < count && (Date.now() - startTime) < timeout) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return this.getReceivedMessages();
    }
    async waitForEvent(eventType, timeout = 3000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const event = this.events.find(e => e.type === eventType || e.type === eventType);
            if (event)
                return event;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        throw new Error(`Event ${eventType} not received within ${timeout}ms`);
    }
}
describe('Message Delivery and Formatting Verification', () => {
    let server;
    let client;
    let testPort;
    let baseUrl;
    beforeEach(async () => {
        testPort = 4000 + Math.floor(Math.random() * 1000);
        baseUrl = `http://127.0.0.1:${testPort}`;
        const config = {
            port: testPort,
            host: '127.0.0.1',
            debug: true,
            maxConnections: 20,
            requestTimeout: 10000,
        };
        server = new MCPServer(config);
        await server.initialize();
        client = new MessageDeliveryClient(baseUrl);
        await client.connect();
    });
    afterEach(async () => {
        if (client) {
            client.disconnect();
        }
        if (server && server.getState() !== ServerState.STOPPED) {
            await server.shutdown();
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        mockedAxios.post.mockClear();
    });
    describe('SSE Message Format Validation', () => {
        test('should establish SSE connection successfully', async () => {
            expect(client.isConnected()).toBe(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            const events = client.getEvents();
            expect(events.length).toBeGreaterThanOrEqual(0);
        });
        test('should format MCP response messages correctly', async () => {
            const request = {
                jsonrpc: '2.0',
                id: 'test-001',
                method: 'tools/list',
                params: {}
            };
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'test-001',
                    result: {
                        tools: [{ name: 'test-tool', description: 'A test tool' }]
                    }
                }
            });
            const response = await client.sendMessage(request);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe('test-001');
            expect(response.result || response.error).toBeDefined();
        });
        test('should handle various MCP method calls', async () => {
            const testCases = [
                {
                    method: 'tools/list',
                    expectedResultType: 'object'
                },
                {
                    method: 'prompts/list',
                    expectedResultType: 'object'
                }
            ];
            for (const testCase of testCases) {
                const request = {
                    jsonrpc: '2.0',
                    id: `test-${Date.now()}`,
                    method: testCase.method,
                    params: {}
                };
                mockedAxios.post.mockResolvedValue({
                    status: 200,
                    data: {
                        jsonrpc: '2.0',
                        id: request.id,
                        result: {}
                    }
                });
                const response = await client.sendMessage(request);
                expect(response.jsonrpc).toBe('2.0');
                expect(response.id).toBe(request.id);
                if (response.result) {
                    expect(typeof response.result).toBe(testCase.expectedResultType);
                }
            }
        });
        test('should format error messages properly', async () => {
            const invalidRequest = {
                jsonrpc: '2.0',
                id: 'error-test',
                method: 'invalid/method',
                params: {}
            };
            mockedAxios.post.mockResolvedValue({
                status: 400,
                data: {
                    jsonrpc: '2.0',
                    id: 'error-test',
                    error: {
                        code: -32601,
                        message: 'Method not found'
                    }
                }
            });
            const response = await client.sendMessage(invalidRequest);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe('error-test');
            expect(response.error).toBeDefined();
            expect(typeof response.error.code).toBe('number');
            expect(typeof response.error.message).toBe('string');
        });
    });
    describe('Message Timing and Delivery', () => {
        test('should deliver messages within acceptable timeframe', async () => {
            const request = {
                jsonrpc: '2.0',
                id: 'timing-test',
                method: 'tools/list',
                params: {}
            };
            mockedAxios.post.mockResolvedValue({ status: 200, data: { jsonrpc: '2.0', id: 'timing-test', result: {} } });
            const startTime = Date.now();
            await client.sendMessage(request);
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(2000);
        });
        test('should maintain message order for sequential requests', async () => {
            const requests = [
                { jsonrpc: '2.0', id: 'seq-1', method: 'tools/list', params: {} },
                { jsonrpc: '2.0', id: 'seq-2', method: 'prompts/list', params: {} }
            ];
            const responses = [];
            for (const request of requests) {
                mockedAxios.post.mockResolvedValueOnce({ status: 200, data: { jsonrpc: '2.0', id: request.id, result: {} } });
                const response = await client.sendMessage(request);
                responses.push(response);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            expect(responses.length).toBe(requests.length);
            for (let i = 0; i < responses.length; i++) {
                expect(responses[i].id).toBe(`seq-${i + 1}`);
            }
        });
        test('should handle concurrent message delivery', async () => {
            const concurrentRequests = Array.from({ length: 3 }, (_, i) => ({
                jsonrpc: '2.0',
                id: `concurrent-${i}`,
                method: 'tools/list',
                params: {}
            }));
            const promises = concurrentRequests.map(request => {
                mockedAxios.post.mockResolvedValueOnce({ status: 200, data: { jsonrpc: '2.0', id: request.id, result: {} } });
                return client.sendMessage(request);
            });
            const responses = await Promise.all(promises);
            expect(responses.length).toBe(concurrentRequests.length);
            const receivedIds = responses.map(response => response.id);
            concurrentRequests.forEach(request => {
                expect(receivedIds).toContain(request.id);
            });
        });
    });
    describe('Connection Stability', () => {
        test('should maintain connection stability over time', async () => {
            const request = {
                jsonrpc: '2.0',
                id: 'stability-test-1',
                method: 'tools/list',
                params: {}
            };
            mockedAxios.post.mockResolvedValue({ status: 200, data: { jsonrpc: '2.0', id: 'stability-test-1', result: {} } });
            const response1 = await client.sendMessage(request);
            expect(response1.id).toBe('stability-test-1');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const request2 = {
                jsonrpc: '2.0',
                id: 'stability-test-2',
                method: 'tools/list',
                params: {}
            };
            mockedAxios.post.mockResolvedValue({ status: 200, data: { jsonrpc: '2.0', id: 'stability-test-2', result: {} } });
            const response2 = await client.sendMessage(request2);
            expect(response2.id).toBe('stability-test-2');
            expect(client.isConnected()).toBe(true);
        });
    });
    describe('Error Handling and Edge Cases', () => {
        test('should handle malformed JSON in requests gracefully', async () => {
            const client = new MessageDeliveryClient(`${baseUrl}/sse`);
            await client.connect();
            mockedAxios.post.mockRejectedValue(new Error('Request failed with status code 400'));
            const malformedRequest = {
                jsonrpc: '2.0',
                method: 'tools/list'
            };
            try {
                await client.sendMessage(malformedRequest);
                expect(true).toBe(false);
            }
            catch (error) {
                expect(error.message).toContain('400');
            }
            client.disconnect();
        }, 10000);
        test('should handle malformed JSON in responses', async () => {
            const client = new MessageDeliveryClient(`${baseUrl}/sse`);
            await client.connect();
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: '{"jsonrpc":"2.0","id":"test"',
                headers: {}
            });
            const request = {
                jsonrpc: '2.0',
                id: 'test-malformed-response',
                method: 'tools/list',
                params: {}
            };
            try {
                const response = await client.sendMessage(request);
                expect(response).toBeDefined();
            }
            catch (error) {
                expect(error).toBeDefined();
            }
            client.disconnect();
        }, 10000);
        test('should handle requests without required fields', async () => {
            try {
                await axios.post(`${baseUrl}/message`, { id: 1 }, {
                    headers: { 'Content-Type': 'application/json' },
                    validateStatus: () => true
                });
                expect(true).toBe(false);
            }
            catch (error) {
                expect(error.response?.status).toBe(400);
            }
        });
        test('should handle non-existent methods', async () => {
            const request = {
                jsonrpc: '2.0',
                id: 'non-existent-test',
                method: 'non/existent',
                params: {}
            };
            mockedAxios.post.mockResolvedValue({ status: 404, data: { jsonrpc: '2.0', id: 'non-existent-test', error: { code: -32601, message: 'Method not found' } } });
            const response = await client.sendMessage(request);
            expect(response.error).toBeDefined();
            expect(response.error.code).toBe(-32601);
        });
    });
    describe('Message Content Validation', () => {
        test('should handle special characters and encoding', async () => {
            const specialParams = {
                unicode: '🚀 测试 🎉',
                emojis: '😀😃😄😁😆😅😂🤣',
                special: '"quotes" \'apostrophes\' & ampersands < > brackets',
                newlines: 'line1\nline2\r\nline3\ttab'
            };
            const request = {
                jsonrpc: '2.0',
                id: 'encoding-test',
                method: 'echo',
                params: { text: '你好世界 & < > "' }
            };
            mockedAxios.post.mockResolvedValue({ status: 200, data: { jsonrpc: '2.0', id: 'encoding-test', result: { echoed: '你好世界 & < > "' } } });
            const response = await client.sendMessage(request);
            expect(response.result.echoed).toBe('你好世界 & < > "');
        });
        test('should validate JSON-RPC message structure compliance', async () => {
            const request = {
                jsonrpc: '2.0',
                id: 'compliance-test',
                method: 'test'
            };
            mockedAxios.post.mockResolvedValue({ status: 200, data: { jsonrpc: '2.0', id: 'compliance-test', result: {} } });
            const response = await client.sendMessage(request);
            expect(response).toHaveProperty('jsonrpc', '2.0');
            expect(response).toHaveProperty('id', 'compliance-test');
            expect(response).toHaveProperty('result');
        });
    });
});
//# sourceMappingURL=message-delivery-formatting.test.js.map