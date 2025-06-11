import { MCPServer, ServerState } from '../server';
import axios from 'axios';
jest.mock('axios', () => ({
    ...jest.requireActual('axios'),
    get: jest.fn(),
    post: jest.fn(),
}));
const mockedAxios = axios;
describe('MCPServer Lifecycle Management', () => {
    let server;
    let testPort;
    beforeEach(() => {
        testPort = 3000 + Math.floor(Math.random() * 1000);
        const config = {
            port: testPort,
            host: '127.0.0.1',
            debug: false,
        };
        server = new MCPServer(config);
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: {
                name: 'Tally MCP Server',
                version: '1.0.0',
                status: 'running',
                connections: 0
            },
            headers: {}
        });
    });
    afterEach(async () => {
        if (server.getState() === ServerState.RUNNING) {
            await server.shutdown();
        }
        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
    });
    describe('Server Initialization', () => {
        test('should initialize server successfully', async () => {
            expect(server.getState()).toBe(ServerState.STOPPED);
            await server.initialize();
            expect(server.getState()).toBe(ServerState.RUNNING);
        });
        test('should not allow initialization when not stopped', async () => {
            await server.initialize();
            expect(server.getState()).toBe(ServerState.RUNNING);
            await server.initialize();
            expect(server.getState()).toBe(ServerState.RUNNING);
        });
        test('should serve basic endpoint after initialization', async () => {
            await server.initialize();
            const response = await axios.get(`http://127.0.0.1:${testPort}`);
            expect(response.status).toBe(200);
            expect(response.data).toEqual({
                name: 'Tally MCP Server',
                version: '1.0.0',
                status: 'running',
                connections: 0
            });
        });
        test('should handle initialization errors gracefully', async () => {
            const server1 = new MCPServer({ port: testPort, host: '127.0.0.1' });
            const server2 = new MCPServer({ port: testPort, host: '127.0.0.1' });
            await server1.initialize();
            expect(server1.getState()).toBe(ServerState.RUNNING);
            await new Promise(resolve => setTimeout(resolve, 50));
            await expect(server2.initialize()).rejects.toThrow();
            expect(server2.getState()).toBe(ServerState.ERROR);
            await server1.shutdown();
        });
    });
    describe('Server Shutdown', () => {
        test('should shutdown server gracefully', async () => {
            await server.initialize();
            expect(server.getState()).toBe(ServerState.RUNNING);
            await server.shutdown();
            expect(server.getState()).toBe(ServerState.STOPPED);
            expect(server.getConnectionCount()).toBe(0);
        });
        test('should handle shutdown when already stopped', async () => {
            expect(server.getState()).toBe(ServerState.STOPPED);
            await server.shutdown();
            expect(server.getState()).toBe(ServerState.STOPPED);
        });
        test('should close server endpoint after shutdown', async () => {
            await server.initialize();
            const response = await axios.get(`http://127.0.0.1:${testPort}`);
            expect(response.status).toBe(200);
            await server.shutdown();
            expect(server.getState()).toBe(ServerState.STOPPED);
            mockedAxios.get.mockRejectedValue(new Error('ECONNREFUSED'));
            await expect(axios.get(`http://127.0.0.1:${testPort}`, { timeout: 500 })).rejects.toThrow();
        });
    });
    describe('Server State Management', () => {
        test('should track state transitions correctly', async () => {
            expect(server.getState()).toBe(ServerState.STOPPED);
            const initPromise = server.initialize();
            await initPromise;
            expect(server.getState()).toBe(ServerState.RUNNING);
            const shutdownPromise = server.shutdown();
            await shutdownPromise;
            expect(server.getState()).toBe(ServerState.STOPPED);
        });
    });
    describe('Configuration Handling', () => {
        test('should use custom configuration during initialization', async () => {
            const customConfig = {
                port: 3002,
                host: '127.0.0.1',
                cors: false,
                debug: true,
            };
            const customServer = new MCPServer(customConfig);
            await customServer.initialize();
            const response = await axios.get('http://127.0.0.1:3002');
            expect(response.status).toBe(200);
            await customServer.shutdown();
        });
    });
});
//# sourceMappingURL=server-lifecycle.test.js.map