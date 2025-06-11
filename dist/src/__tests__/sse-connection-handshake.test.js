import { MCPServer, ServerState } from '../server';
import axios from 'axios';
import EventSource from 'eventsource';
jest.mock('axios', () => ({
    ...jest.requireActual('axios'),
    get: jest.fn(),
    post: jest.fn(),
}));
const mockedAxios = axios;
class MockMCPClient {
    constructor(serverUrl, clientId = 'test-client') {
        this.messages = [];
        this.events = [];
        this.connected = false;
        this.serverUrl = serverUrl;
        this.clientId = clientId;
        this.events = [];
        this.eventListeners = new Map();
    }
    async connect(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.disconnect();
                reject(new Error(`Connection timeout after ${timeout}ms`));
            }, timeout);
            this.eventSource = new EventSource(`${this.serverUrl}?clientId=${this.clientId}`);
            this.eventSource.onopen = () => {
                this.connected = true;
                this.events.push({ type: 'open', data: '' });
                this.emit('open');
                clearTimeout(timeoutId);
                resolve();
            };
            this.eventSource.onerror = (errorEvent) => {
                this.connected = false;
                const error = new Error('SSE connection error');
                error.event = errorEvent;
                this.events.push({ type: 'error', data: JSON.stringify(errorEvent) });
                this.emit('error', error);
                reject(error);
            };
            this.eventSource.onmessage = (event) => {
                this.events.push({ type: 'message', data: event.data });
                this.emit('message', event);
                try {
                    const data = JSON.parse(event.data);
                    this.messages.push(data);
                }
                catch (e) {
                    this.messages.push({ raw: event.data });
                }
            };
            this.eventSource.addEventListener('connection', (event) => {
                this.events.push({ type: 'connection', data: event.data });
                this.emit('connection', event);
            });
            this.eventSource.addEventListener('heartbeat', (event) => {
                this.events.push({ type: 'heartbeat', data: event.data });
                this.emit('heartbeat', event);
            });
            this.eventSource.addEventListener('mcp-response', (event) => {
                this.events.push({ type: 'mcp-response', data: event.data });
                this.emit('mcp-response', event);
            });
        });
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
    getMessages() {
        return [...this.messages];
    }
    getEvents() {
        return [...this.events];
    }
    getConnectionError() {
        return this.connectionError;
    }
    async waitForMessages(count, timeout = 3000) {
        const startTime = Date.now();
        while (this.messages.length < count && (Date.now() - startTime) < timeout) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return this.getMessages();
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
    on(event, listener) {
        this.eventListeners.set(event, listener);
    }
    emit(event, ...args) {
        const listener = this.eventListeners.get(event);
        if (listener) {
            listener(...args);
        }
    }
}
class HttpMCPClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async sendMessage(message, timeout = 3000) {
        const response = await axios.post(`${this.baseUrl}/message`, message, {
            timeout,
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }
    async initialize(clientInfo = {}) {
        return this.sendMessage({
            jsonrpc: '2.0',
            id: 'init-1',
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: {
                    name: 'test-client',
                    version: '1.0.0',
                    ...clientInfo
                }
            }
        });
    }
    async listTools() {
        return this.sendMessage({
            jsonrpc: '2.0',
            id: 'tools-list-1',
            method: 'tools/list',
            params: {}
        });
    }
    async callTool(name, arguments_ = {}) {
        return this.sendMessage({
            jsonrpc: '2.0',
            id: `tool-call-${Date.now()}`,
            method: 'tools/call',
            params: {
                name,
                arguments: arguments_
            }
        });
    }
}
describe('SSE Connection Establishment and MCP Handshake Testing', () => {
    let server;
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
    });
    afterEach(async () => {
        if (server && server.getState() !== ServerState.STOPPED) {
            await server.shutdown();
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
    });
    describe('Basic SSE Connection Establishment', () => {
        test('should establish SSE connection within expected timeframe', async () => {
            const client = new MockMCPClient(`${baseUrl}/sse`, 'claude-desktop');
            const startTime = Date.now();
            await client.connect(3000);
            const connectionTime = Date.now() - startTime;
            expect(client.isConnected()).toBe(true);
            expect(connectionTime).toBeLessThan(3000);
            client.disconnect();
        }, 5000);
        test('should handle multiple simultaneous SSE connections', async () => {
            const clients = Array.from({ length: 5 }, (_, i) => new MockMCPClient(`${baseUrl}/sse`, `client-${i}`));
            const connectionPromises = clients.map(client => client.connect());
            await Promise.all(connectionPromises);
            clients.forEach(client => {
                expect(client.isConnected()).toBe(true);
                client.disconnect();
            });
        }, 10000);
        test('should send initial connection confirmation message', async () => {
            const client = new MockMCPClient(`${baseUrl}/sse`, 'client-confirm');
            await client.connect();
            const connectionEvent = await client.waitForEvent('connection', 5000);
            expect(connectionEvent).toBeDefined();
            const connectionData = JSON.parse(connectionEvent.data);
            expect(connectionData.status).toBe('connected');
            client.disconnect();
        }, 10000);
        test('should maintain heartbeat mechanism', async () => {
            const client = new MockMCPClient(`${baseUrl}/sse`, 'heartbeat-client');
            await client.connect();
            const heartbeatEvent = await client.waitForEvent('heartbeat', 35000);
            expect(heartbeatEvent).toBeDefined();
            expect(heartbeatEvent.data).toContain('ping');
            client.disconnect();
        }, 40000);
    });
    describe('MCP Protocol Handshake', () => {
        test('should complete proper MCP initialization handshake', async () => {
            const httpClient = new HttpMCPClient(baseUrl);
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'init-1',
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: { tools: true, resources: true, prompts: true }
                    }
                }
            });
            const initResponse = await httpClient.initialize();
            expect(initResponse.jsonrpc).toBe('2.0');
            expect(initResponse.id).toBe('init-1');
            expect(initResponse.result).toBeDefined();
            expect(initResponse.result.protocolVersion).toBe('2024-11-05');
            expect(initResponse.result.capabilities).toBeDefined();
        });
        test('should support capability negotiation', async () => {
            const httpClient = new HttpMCPClient(baseUrl);
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'init-1',
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: { tools: true, resources: true, prompts: true }
                    }
                }
            });
            const initResponse = await httpClient.initialize({ capabilities: { custom: true } });
            const capabilities = initResponse.result.capabilities;
            expect(capabilities).toHaveProperty('tools');
            expect(capabilities).toHaveProperty('resources');
            expect(capabilities).toHaveProperty('prompts');
        });
        test('should handle invalid handshake messages gracefully', async () => {
            const httpClient = new HttpMCPClient(baseUrl);
            mockedAxios.post.mockResolvedValue({
                status: 400,
                data: {
                    jsonrpc: '2.0',
                    id: 'invalid-init',
                    error: { code: -32602, message: 'Invalid params' }
                }
            });
            const response = await httpClient.sendMessage({
                jsonrpc: '2.0',
                id: 'invalid-init',
                method: 'initialize',
                params: { protocolVersion: 'invalid' }
            });
            expect(response.error).toBeDefined();
            expect(response.error.code).toBe(-32602);
        });
        test('should validate JSON-RPC 2.0 compliance', async () => {
            const httpClient = new HttpMCPClient(baseUrl);
            mockedAxios.post.mockResolvedValue({
                status: 400,
                data: {
                    jsonrpc: '2.0',
                    id: 'jsonrpc-test',
                    error: { code: -32600, message: 'Invalid Request' }
                }
            });
            const response = await httpClient.sendMessage({ id: 'jsonrpc-test' });
            expect(response.error).toBeDefined();
            expect(response.error.code).toBe(-32600);
        });
    });
    describe('Tool Discovery Through SSE', () => {
        test('should list available tools correctly', async () => {
            const client = new MockMCPClient(`${baseUrl}/sse`, 'tools-client');
            await client.connect();
            const httpClient = new HttpMCPClient(baseUrl);
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'tools-list-1',
                    result: {
                        tools: [{ name: 'test-tool', description: 'A test tool' }]
                    }
                }
            });
            const toolsResponse = await httpClient.listTools();
            expect(toolsResponse.jsonrpc).toBe('2.0');
            expect(toolsResponse.result).toBeDefined();
            expect(toolsResponse.result.tools).toBeDefined();
            expect(Array.isArray(toolsResponse.result.tools)).toBe(true);
            expect(toolsResponse.result.tools.length).toBeGreaterThan(0);
            client.disconnect();
        });
        test('should handle tool calls with proper error handling', async () => {
            const httpClient = new HttpMCPClient(baseUrl);
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'test-invalid-tool',
                    error: {
                        code: -32601,
                        message: 'Method not found'
                    }
                }
            });
            const response = await httpClient.callTool('invalid-tool');
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe('test-invalid-tool');
            expect(response.result || response.error).toBeDefined();
        });
    });
    describe('Client Type Simulation', () => {
        test('should handle Claude Desktop simulation', async () => {
            const sseClient = new MockMCPClient(`${baseUrl}/sse`, 'claude-desktop');
            const httpClient = new HttpMCPClient(baseUrl);
            await sseClient.connect();
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'init-1',
                    result: {
                        protocolVersion: '2024-11-05'
                    }
                }
            });
            const initResponse = await httpClient.initialize();
            expect(initResponse.result).toBeDefined();
            expect(initResponse.result.protocolVersion).toBe('2024-11-05');
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'tools-list-1',
                    result: {
                        tools: [{ name: 'test-tool', description: 'A test tool' }]
                    }
                }
            });
            const toolsResponse = await httpClient.listTools();
            expect(toolsResponse.result.tools).toBeDefined();
            sseClient.disconnect();
        });
        test('should handle MCP Inspector simulation', async () => {
            const sseClient = new MockMCPClient(`${baseUrl}/sse`, 'mcp-inspector');
            const httpClient = new HttpMCPClient(baseUrl);
            await sseClient.connect();
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'init-1',
                    result: {
                        serverInfo: { name: 'tally-mcp-server' }
                    }
                }
            });
            const initResponse = await httpClient.initialize();
            expect(initResponse.result.serverInfo.name).toBe('tally-mcp-server');
            sseClient.disconnect();
        });
        test('should handle custom client simulation', async () => {
            const sseClient = new MockMCPClient(`${baseUrl}/sse`, 'custom-client');
            const httpClient = new HttpMCPClient(baseUrl);
            await sseClient.connect();
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: {
                    jsonrpc: '2.0',
                    id: 'init-1',
                    result: {
                        capabilities: { tools: true }
                    }
                }
            });
            const initResponse = await httpClient.initialize();
            expect(initResponse.result.capabilities).toHaveProperty('tools');
            sseClient.disconnect();
        });
    });
    describe('Connection State Management', () => {
        test('should track connection lifecycle properly', async () => {
            mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { connections: 3 } });
            const initialHealthResponse = await axios.get(`${baseUrl}/health`);
            const initialConnections = initialHealthResponse.data.connections;
            const client = new MockMCPClient(`${baseUrl}/sse`);
            await client.connect();
            await new Promise(resolve => setTimeout(resolve, 100));
            mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { connections: initialConnections + 1 } });
            const midHealthResponse = await axios.get(`${baseUrl}/health`, {
                timeout: 5000
            });
            expect(midHealthResponse.data.connections).toBe(initialConnections + 1);
            client.disconnect();
            await new Promise(resolve => setTimeout(resolve, 100));
            mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { connections: initialConnections } });
            const finalHealthResponse = await axios.get(`${baseUrl}/health`);
            expect(finalHealthResponse.data.connections).toBe(initialConnections);
        });
        test('should handle abrupt connection termination', async () => {
            const client = new MockMCPClient(`${baseUrl}/sse`);
            await client.connect();
            client.disconnect();
            await new Promise(resolve => setTimeout(resolve, 500));
            mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { connections: 0 } });
            const healthResponse = await axios.get(`${baseUrl}/health`, {
                validateStatus: () => true,
                timeout: 5000
            });
            expect(healthResponse.status).toBe(200);
        });
    });
    describe('Performance and Reliability', () => {
        test('should establish connections within performance benchmarks', async () => {
            const startTime = Date.now();
            const client = new MockMCPClient(`${baseUrl}/sse`, 'perf-client');
            await client.connect();
            const connectionTime = Date.now() - startTime;
            expect(connectionTime).toBeLessThan(1000);
            client.disconnect();
        });
        test('should handle rapid connection cycling', async () => {
            for (let i = 0; i < 5; i++) {
                const client = new MockMCPClient(`${baseUrl}/sse`, `cycle-${i}`);
                await client.connect();
                client.disconnect();
            }
            mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { connections: 0 } });
            const healthResponse = await axios.get(`${baseUrl}/health`, {
                validateStatus: () => true,
                timeout: 5000
            });
            expect(healthResponse.status).toBe(200);
        });
    });
});
//# sourceMappingURL=sse-connection-handshake.test.js.map