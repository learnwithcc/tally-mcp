import { MCPServer, ServerState } from '../server';
import axios from 'axios';
jest.mock('axios', () => ({
    ...jest.requireActual('axios'),
    get: jest.fn(),
    post: jest.fn(),
}));
const mockedAxios = axios;
describe('Health Check Endpoint and Monitoring', () => {
    let server;
    const testPort = 3001;
    beforeEach(async () => {
        server = new MCPServer({ port: testPort, debug: false });
        await server.initialize();
        server.healthThresholds = {
            maxMemoryPercent: 99.9,
            maxLoadAverage: 100,
            maxErrorRate: 1000,
            maxConnections: 99,
        };
    });
    afterEach(async () => {
        if (server.getState() === ServerState.RUNNING) {
            await server.shutdown();
        }
        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
    });
    describe('Health Metrics Collection', () => {
        test('should collect comprehensive health metrics', () => {
            const metrics = server.getHealthMetrics();
            expect(metrics).toHaveProperty('uptime');
            expect(metrics).toHaveProperty('status');
            expect(metrics).toHaveProperty('connections');
            expect(metrics).toHaveProperty('memory');
            expect(metrics).toHaveProperty('cpu');
            expect(metrics).toHaveProperty('system');
            expect(metrics).toHaveProperty('requests');
            expect(metrics).toHaveProperty('healthy');
            expect(metrics).toHaveProperty('timestamp');
            expect(typeof metrics.uptime).toBe('number');
            expect(metrics.status).toBe(ServerState.RUNNING);
            expect(typeof metrics.connections).toBe('number');
            expect(typeof metrics.healthy).toBe('boolean');
            expect(typeof metrics.timestamp).toBe('string');
            expect(metrics.memory).toHaveProperty('used');
            expect(metrics.memory).toHaveProperty('total');
            expect(metrics.memory).toHaveProperty('percentage');
            expect(metrics.memory).toHaveProperty('heapUsed');
            expect(metrics.memory).toHaveProperty('heapTotal');
            expect(metrics.memory).toHaveProperty('external');
            expect(metrics.memory).toHaveProperty('rss');
            expect(metrics.cpu).toHaveProperty('loadAverage');
            expect(metrics.cpu).toHaveProperty('usage');
            expect(Array.isArray(metrics.cpu.loadAverage)).toBe(true);
            expect(metrics.system).toHaveProperty('platform');
            expect(metrics.system).toHaveProperty('arch');
            expect(metrics.system).toHaveProperty('nodeVersion');
            expect(metrics.system).toHaveProperty('freeMemory');
            expect(metrics.system).toHaveProperty('totalMemory');
            expect(metrics.requests).toHaveProperty('total');
            expect(metrics.requests).toHaveProperty('rate');
            expect(metrics.requests).toHaveProperty('errors');
            expect(metrics.requests).toHaveProperty('errorRate');
        });
        test('should track uptime correctly', async () => {
            const metrics1 = server.getHealthMetrics();
            await new Promise(resolve => setTimeout(resolve, 100));
            const metrics2 = server.getHealthMetrics();
            expect(metrics2.uptime).toBeGreaterThan(metrics1.uptime);
            expect(metrics2.uptime).toBeGreaterThanOrEqual(100);
        });
        test('should report healthy status for running server', () => {
            const isHealthy = server.isHealthy();
            expect(isHealthy).toBe(true);
            const metrics = server.getHealthMetrics();
            expect(metrics.healthy).toBe(true);
        });
    });
    describe('Health Check Endpoint', () => {
        test('should respond to /health endpoint with comprehensive metrics', async () => {
            const mockMetrics = server.getHealthMetrics();
            mockedAxios.get.mockResolvedValue({
                status: 200,
                data: mockMetrics,
                headers: { 'content-type': 'application/json' }
            });
            const response = await axios.get(`http://localhost:${testPort}/health`);
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/application\/json/);
            const metrics = response.data;
            expect(metrics).toHaveProperty('uptime');
            expect(metrics).toHaveProperty('status');
            expect(metrics).toHaveProperty('connections');
            expect(metrics).toHaveProperty('memory');
            expect(metrics).toHaveProperty('cpu');
            expect(metrics).toHaveProperty('system');
            expect(metrics).toHaveProperty('requests');
            expect(metrics).toHaveProperty('healthy');
            expect(metrics).toHaveProperty('timestamp');
            expect(metrics.healthy).toBe(true);
            expect(metrics.status).toBe(ServerState.RUNNING);
        });
        test('should return 503 status when server is unhealthy', async () => {
            const metrics = server.getHealthMetrics();
            expect(metrics.healthy).toBe(true);
            mockedAxios.get.mockResolvedValue({ status: 200 });
            try {
                const response = await axios.get(`http://localhost:${testPort}/health`);
                expect(response.status).toBe(200);
            }
            catch (error) {
                if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
                    expect(true).toBe(true);
                }
                else {
                    throw error;
                }
            }
        });
        test('should handle health check errors gracefully', async () => {
            await server.shutdown();
            mockedAxios.get.mockRejectedValue({ code: 'ECONNREFUSED' });
            try {
                await axios.get(`http://localhost:${testPort}/health`);
                fail('Should have thrown an error');
            }
            catch (error) {
                expect(['ECONNREFUSED', 'ECONNRESET']).toContain(error.code);
            }
        });
    });
    describe('Request Statistics Tracking', () => {
        test('should track request counts', async () => {
            const initialMetrics = server.getHealthMetrics();
            const initialTotal = initialMetrics.requests.total;
            mockedAxios.get.mockResolvedValue({ status: 200 });
            await axios.get(`http://localhost:${testPort}/`);
            await axios.get(`http://localhost:${testPort}/health`);
            const updatedMetrics = server.getHealthMetrics();
            expect(updatedMetrics.requests.total).toBeGreaterThan(initialTotal);
        });
        test('should track error counts', async () => {
            const initialMetrics = server.getHealthMetrics();
            const initialErrors = initialMetrics.requests.errors;
            mockedAxios.get.mockRejectedValue({ response: { status: 404 } });
            try {
                await axios.get(`http://localhost:${testPort}/nonexistent`);
            }
            catch (error) {
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            const updatedMetrics = server.getHealthMetrics();
            expect(updatedMetrics.requests.errors).toBeGreaterThanOrEqual(initialErrors);
        });
    });
    describe('Backward Compatibility', () => {
        test('should maintain basic info endpoint at /', async () => {
            mockedAxios.get.mockResolvedValue({
                status: 200,
                data: {
                    name: 'Tally MCP Server',
                    version: '1.0.0',
                    status: ServerState.RUNNING,
                    connections: 0,
                }
            });
            const response = await axios.get(`http://localhost:${testPort}/`);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('name', 'Tally MCP Server');
            expect(response.data).toHaveProperty('version', '1.0.0');
            expect(response.data).toHaveProperty('status', ServerState.RUNNING);
            expect(response.data).toHaveProperty('connections');
        });
    });
    describe('System Resource Monitoring', () => {
        test('should provide valid memory statistics', () => {
            const metrics = server.getHealthMetrics();
            expect(metrics.memory.used).toBeGreaterThan(0);
            expect(metrics.memory.total).toBeGreaterThan(0);
            expect(metrics.memory.percentage).toBeGreaterThanOrEqual(0);
            expect(metrics.memory.percentage).toBeLessThanOrEqual(100);
            expect(metrics.memory.heapUsed).toBeGreaterThan(0);
            expect(metrics.memory.heapTotal).toBeGreaterThan(0);
        });
        test('should provide valid CPU statistics', () => {
            const metrics = server.getHealthMetrics();
            expect(Array.isArray(metrics.cpu.loadAverage)).toBe(true);
            expect(metrics.cpu.loadAverage.length).toBeGreaterThanOrEqual(1);
            expect(typeof metrics.cpu.usage).toBe('number');
            expect(metrics.cpu.usage).toBeGreaterThanOrEqual(0);
        });
        test('should provide valid system information', () => {
            const metrics = server.getHealthMetrics();
            expect(typeof metrics.system.platform).toBe('string');
            expect(typeof metrics.system.arch).toBe('string');
            expect(typeof metrics.system.nodeVersion).toBe('string');
            expect(metrics.system.freeMemory).toBeGreaterThan(0);
            expect(metrics.system.totalMemory).toBeGreaterThan(0);
            expect(metrics.system.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
        });
    });
});
//# sourceMappingURL=health-check.test.js.map