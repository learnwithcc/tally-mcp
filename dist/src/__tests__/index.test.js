import { jest } from '@jest/globals';
const mockMCPServer = {
    getConfig: jest.fn(() => ({ port: 3000, host: '0.0.0.0', debug: false })),
    getState: jest.fn(() => 'initialized'),
    getConnectionCount: jest.fn(() => 0),
    initialize: jest.fn(() => Promise.resolve())
};
const MockMCPServerClass = jest.fn(() => mockMCPServer);
jest.mock('../server', () => ({
    MCPServer: MockMCPServerClass
}));
describe('Index Module', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        mockMCPServer.getConfig.mockImplementation(() => ({ port: 3000, host: '0.0.0.0', debug: false }));
        mockMCPServer.getState.mockImplementation(() => 'initialized');
        mockMCPServer.getConnectionCount.mockImplementation(() => 0);
        mockMCPServer.initialize.mockImplementation(() => Promise.resolve());
    });
    afterEach(() => {
        process.env = originalEnv;
    });
    describe('Environment Configuration', () => {
        it('should parse environment variables correctly', async () => {
            process.env.PORT = '8080';
            process.env.HOST = 'localhost';
            process.env.DEBUG = 'true';
            const { default: main } = await import('../index');
            await main();
            expect(MockMCPServerClass).toHaveBeenCalledWith({
                port: 8080,
                host: 'localhost',
                debug: true
            });
        });
        it('should use default values when environment variables are missing', async () => {
            delete process.env.PORT;
            delete process.env.HOST;
            delete process.env.DEBUG;
            const { default: main } = await import('../index');
            await main();
            expect(MockMCPServerClass).toHaveBeenCalledWith({
                port: 3000,
                host: '0.0.0.0',
                debug: false
            });
        });
        it('should handle invalid PORT value', async () => {
            process.env.PORT = 'invalid';
            const { default: main } = await import('../index');
            await main();
            expect(MockMCPServerClass).toHaveBeenCalledWith({
                port: NaN,
                host: '0.0.0.0',
                debug: false
            });
        });
        it('should parse DEBUG as false for non-true values', async () => {
            process.env.DEBUG = 'false';
            const { default: main } = await import('../index');
            await main();
            expect(MockMCPServerClass).toHaveBeenCalledWith(expect.objectContaining({ debug: false }));
        });
    });
    describe('Server Initialization', () => {
        it('should create MCPServer instance and call required methods', async () => {
            const { default: main } = await import('../index');
            await main();
            expect(MockMCPServerClass).toHaveBeenCalledTimes(1);
            expect(mockMCPServer.getConfig).toHaveBeenCalled();
            expect(mockMCPServer.getState).toHaveBeenCalled();
            expect(mockMCPServer.getConnectionCount).toHaveBeenCalled();
            expect(mockMCPServer.initialize).toHaveBeenCalled();
        });
        it('should handle server initialization failure', async () => {
            mockMCPServer.initialize.mockRejectedValue(new Error('Init failed'));
            const { default: main } = await import('../index');
            await expect(main()).rejects.toThrow('Init failed');
        });
        it('should handle getConfig method failure', async () => {
            mockMCPServer.getConfig.mockImplementation(() => {
                throw new Error('getConfig failed');
            });
            const { default: main } = await import('../index');
            await expect(main()).rejects.toThrow('getConfig failed');
        });
    });
    describe('Module Exports', () => {
        it('should export MCPServer class', () => {
            const indexModule = require('../index');
            expect(indexModule.MCPServer).toBeDefined();
            expect(indexModule.MCPServer).toBe(MockMCPServerClass);
        });
        it('should export main function as default', () => {
            const indexModule = require('../index');
            expect(indexModule.default).toBeDefined();
            expect(typeof indexModule.default).toBe('function');
        });
    });
    describe('Process Error Handlers', () => {
        it('should register event listeners when module is loaded', () => {
            const beforeUnhandled = process.listenerCount('unhandledRejection');
            const beforeUncaught = process.listenerCount('uncaughtException');
            require('../index');
            const afterUnhandled = process.listenerCount('unhandledRejection');
            const afterUncaught = process.listenerCount('uncaughtException');
            expect(afterUnhandled).toBeGreaterThanOrEqual(beforeUnhandled);
            expect(afterUncaught).toBeGreaterThanOrEqual(beforeUncaught);
        });
    });
    describe('Configuration Parsing', () => {
        it('should correctly parse numeric port values', async () => {
            const testPorts = ['3000', '8080', '5432', '1337'];
            for (const port of testPorts) {
                jest.clearAllMocks();
                process.env.PORT = port;
                const { default: main } = await import('../index');
                await main();
                expect(MockMCPServerClass).toHaveBeenCalledWith(expect.objectContaining({ port: parseInt(port) }));
            }
        });
        it('should handle various DEBUG string values', async () => {
            const truthyValues = ['true'];
            const falsyValues = ['false', 'FALSE', '0', '', 'no', 'off'];
            for (const value of truthyValues) {
                jest.clearAllMocks();
                process.env.DEBUG = value;
                const { default: main } = await import('../index');
                await main();
                expect(MockMCPServerClass).toHaveBeenCalledWith(expect.objectContaining({ debug: true }));
            }
            for (const value of falsyValues) {
                jest.clearAllMocks();
                process.env.DEBUG = value;
                const { default: main } = await import('../index');
                await main();
                expect(MockMCPServerClass).toHaveBeenCalledWith(expect.objectContaining({ debug: false }));
            }
        });
    });
    describe('Error Handling', () => {
        it('should handle server method call failures gracefully', async () => {
            const methods = ['getConfig', 'getState', 'getConnectionCount'];
            for (const method of methods) {
                jest.clearAllMocks();
                mockMCPServer[method].mockImplementation(() => {
                    throw new Error(`${method} failed`);
                });
                const { default: main } = await import('../index');
                await expect(main()).rejects.toThrow(`${method} failed`);
                mockMCPServer[method].mockImplementation(() => method === 'getConfig' ? { port: 3000, host: '0.0.0.0', debug: false } :
                    method === 'getState' ? 'initialized' : 0);
            }
        });
    });
});
//# sourceMappingURL=index.test.js.map