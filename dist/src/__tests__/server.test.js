import { MCPServer, DEFAULT_CONFIG, ServerState } from '../server';
describe('MCPServer Class Structure', () => {
    let server;
    beforeEach(() => {
        server = new MCPServer();
    });
    afterEach(() => {
    });
    test('should instantiate with default configuration', () => {
        expect(server).toBeInstanceOf(MCPServer);
        expect(server.getState()).toBe(ServerState.STOPPED);
        expect(server.getConnectionCount()).toBe(0);
    });
    test('should accept custom configuration', () => {
        const customConfig = {
            port: 4000,
            host: '127.0.0.1',
            debug: true,
        };
        const customServer = new MCPServer(customConfig);
        const config = customServer.getConfig();
        expect(config.port).toBe(4000);
        expect(config.host).toBe('127.0.0.1');
        expect(config.debug).toBe(true);
        expect(config.cors).toBe(DEFAULT_CONFIG.cors);
    });
    test('should merge custom config with defaults', () => {
        const partialConfig = {
            port: 5000,
        };
        const serverWithPartialConfig = new MCPServer(partialConfig);
        const config = serverWithPartialConfig.getConfig();
        expect(config.port).toBe(5000);
        expect(config.host).toBe(DEFAULT_CONFIG.host);
        expect(config.cors).toBe(DEFAULT_CONFIG.cors);
        expect(config.requestTimeout).toBe(DEFAULT_CONFIG.requestTimeout);
        expect(config.maxConnections).toBe(DEFAULT_CONFIG.maxConnections);
        expect(config.debug).toBe(DEFAULT_CONFIG.debug);
    });
    test('should have correct initial state', () => {
        expect(server.getState()).toBe(ServerState.STOPPED);
        expect(server.getConnectionCount()).toBe(0);
    });
    test('should handle server lifecycle methods', async () => {
        expect(server.getState()).toBe(ServerState.STOPPED);
        await server.initialize();
        expect(server.getState()).toBe(ServerState.RUNNING);
        await server.shutdown();
        expect(server.getState()).toBe(ServerState.STOPPED);
    });
    test('should return immutable config copy', () => {
        const config1 = server.getConfig();
        const config2 = server.getConfig();
        expect(config1).toEqual(config2);
        expect(config1).not.toBe(config2);
        config1.port = 9999;
        expect(server.getConfig().port).toBe(DEFAULT_CONFIG.port);
    });
});
describe('Default Configuration', () => {
    test('should have sensible defaults', () => {
        expect(DEFAULT_CONFIG.port).toBe(3000);
        expect(DEFAULT_CONFIG.host).toBe('0.0.0.0');
        expect(DEFAULT_CONFIG.cors).toBe(true);
        expect(DEFAULT_CONFIG.requestTimeout).toBe(30000);
        expect(DEFAULT_CONFIG.maxConnections).toBe(100);
        expect(DEFAULT_CONFIG.debug).toBe(false);
    });
});
describe('ServerState Enum', () => {
    test('should have all expected states', () => {
        expect(ServerState.STOPPED).toBe('stopped');
        expect(ServerState.STARTING).toBe('starting');
        expect(ServerState.RUNNING).toBe('running');
        expect(ServerState.STOPPING).toBe('stopping');
        expect(ServerState.ERROR).toBe('error');
    });
});
//# sourceMappingURL=server.test.js.map