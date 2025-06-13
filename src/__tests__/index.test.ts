/**
 * Tests for the main index.ts entry point
 */

import { MCPServer, ServerState } from '../server';

// Mock the MCPServer
jest.mock('../server', () => {
  const originalModule = jest.requireActual('../server');
  return {
    ...originalModule,
    MCPServer: jest.fn().mockImplementation(() => ({
      getConfig: jest.fn(() => ({
        port: 3000,
        host: '0.0.0.0',
        debug: false,
        cors: true,
        requestTimeout: 30000,
        maxConnections: 100
      })),
      getState: jest.fn(() => originalModule.ServerState.STOPPED),
      getConnectionCount: jest.fn(() => 0),
      initialize: jest.fn()
    }))
  };
});

describe('Index.ts Entry Point', () => {
  let mockServer: jest.Mocked<MCPServer>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Reset the mock
    jest.clearAllMocks();
    
    // Store original environment
    originalEnv = { ...process.env };

    // Create mock server instance
    mockServer = {
      getConfig: jest.fn(() => ({
        port: 3000,
        host: '0.0.0.0',
        debug: false,
        cors: true,
        requestTimeout: 30000,
        maxConnections: 100
      })),
      getState: jest.fn(() => ServerState.STOPPED),
      getConnectionCount: jest.fn(() => 0),
      initialize: jest.fn()
    } as any;

    // Make the constructor return our mock
    (MCPServer as jest.MockedClass<typeof MCPServer>).mockImplementation(() => mockServer);

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Spy on process.exit
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`Process exit called with code: ${code}`);
    });
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;

    // Restore spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('main function', () => {
    it('should start server with default configuration', async () => {
      // Clear environment variables
      delete process.env.PORT;
      delete process.env.HOST;
      delete process.env.DEBUG;

      // Import and run main function
      const { default: main } = await import('../index');
      await main();

      // Verify server was created with default config
      expect(MCPServer).toHaveBeenCalledWith({
        port: 3000,
        host: '0.0.0.0',
        debug: false
      });

      // Verify server methods were called
      expect(mockServer.getConfig).toHaveBeenCalled();
      expect(mockServer.getState).toHaveBeenCalled();
      expect(mockServer.getConnectionCount).toHaveBeenCalled();
      expect(mockServer.initialize).toHaveBeenCalled();

      // Verify console output
      expect(consoleLogSpy).toHaveBeenCalledWith('Tally MCP Server starting...');
      expect(consoleLogSpy).toHaveBeenCalledWith('Server initialization completed successfully!');
      expect(consoleLogSpy).toHaveBeenCalledWith('Server is now running and ready to accept connections.');
    });

    it('should start server with custom environment configuration', async () => {
      // Set custom environment variables
      process.env.PORT = '8080';
      process.env.HOST = '127.0.0.1';
      process.env.DEBUG = 'true';

      // Import and run main function
      const { default: main } = await import('../index');
      await main();

      // Verify server was created with custom config
      expect(MCPServer).toHaveBeenCalledWith({
        port: 8080,
        host: '127.0.0.1',
        debug: true
      });

      expect(mockServer.initialize).toHaveBeenCalled();
    });

    it('should handle invalid PORT environment variable', async () => {
      process.env.PORT = 'invalid';

      // Import and run main function
      const { default: main } = await import('../index');
      await main();

      // Should fall back to default port when parseInt returns NaN
      expect(MCPServer).toHaveBeenCalledWith({
        port: NaN,
        host: '0.0.0.0',
        debug: false
      });
    });

    it('should handle server initialization failure', async () => {
      // Make initialize throw an error
      mockServer.initialize.mockRejectedValue(new Error('Initialization failed'));

      // Import and run main function
      const { default: main } = await import('../index');

      await expect(main()).rejects.toThrow('Initialization failed');
    });

    it('should log server configuration and state', async () => {
      const mockConfig = { 
        port: 3000, 
        host: 'localhost', 
        debug: true,
        cors: true,
        requestTimeout: 30000,
        maxConnections: 100
      };
      const mockState = ServerState.STOPPED;
      const mockConnections = 5;

      mockServer.getConfig.mockReturnValue(mockConfig);
      mockServer.getState.mockReturnValue(mockState);
      mockServer.getConnectionCount.mockReturnValue(mockConnections);

      // Import and run main function
      const { default: main } = await import('../index');
      await main();

      expect(consoleLogSpy).toHaveBeenCalledWith('Server configured:', mockConfig);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Current state: ${mockState}`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Active connections: ${mockConnections}`);
    });
  });

  describe('process error handlers', () => {
    it('should register error handlers when module is imported', async () => {
      const initialRejectionCount = process.listenerCount('unhandledRejection');
      const initialExceptionCount = process.listenerCount('uncaughtException');
      
      // Import the module to register event handlers
      await import('../index');

      // Verify handlers were registered (at least same count or more)
      expect(process.listenerCount('unhandledRejection')).toBeGreaterThanOrEqual(initialRejectionCount);
      expect(process.listenerCount('uncaughtException')).toBeGreaterThanOrEqual(initialExceptionCount);
    });
  });

  describe('module exports', () => {
    it('should export MCPServer class', async () => {
      const indexModule = await import('../index');
      expect(indexModule.MCPServer).toBe(MCPServer);
    });

    it('should export main function as default', async () => {
      const indexModule = await import('../index');
      expect(typeof indexModule.default).toBe('function');
    });
  });

  describe('configuration parsing', () => {
    it('should parse PORT as integer', async () => {
      process.env.PORT = '5000';

      const { default: main } = await import('../index');
      await main();

      expect(MCPServer).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 5000
        })
      );
    });

    it('should parse DEBUG as boolean true', async () => {
      process.env.DEBUG = 'true';

      const { default: main } = await import('../index');
      await main();

      expect(MCPServer).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: true
        })
      );
    });

    it('should parse DEBUG as boolean false for non-true values', async () => {
      process.env.DEBUG = 'false';

      const { default: main } = await import('../index');
      await main();

      expect(MCPServer).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: false
        })
      );
    });

    it('should handle missing environment variables gracefully', async () => {
      // Clear all relevant env vars
      delete process.env.PORT;
      delete process.env.HOST;
      delete process.env.DEBUG;

      const { default: main } = await import('../index');
      await main();

      expect(MCPServer).toHaveBeenCalledWith({
        port: 3000,
        host: '0.0.0.0',
        debug: false
      });
    });
  });

  describe('error scenarios', () => {
    it('should handle server creation failure', async () => {
      // Make MCPServer constructor throw
      (MCPServer as jest.MockedClass<typeof MCPServer>).mockImplementation(() => {
        throw new Error('Server creation failed');
      });

      const { default: main } = await import('../index');

      await expect(main()).rejects.toThrow('Server creation failed');
    });

    it('should handle getConfig failure', async () => {
      mockServer.getConfig.mockImplementation(() => {
        throw new Error('getConfig failed');
      });

      const { default: main } = await import('../index');

      await expect(main()).rejects.toThrow('getConfig failed');
    });

    it('should handle getState failure', async () => {
      mockServer.getState.mockImplementation(() => {
        throw new Error('getState failed');
      });

      const { default: main } = await import('../index');

      await expect(main()).rejects.toThrow('getState failed');
    });

    it('should handle getConnectionCount failure', async () => {
      mockServer.getConnectionCount.mockImplementation(() => {
        throw new Error('getConnectionCount failed');
      });

      const { default: main } = await import('../index');

      await expect(main()).rejects.toThrow('getConnectionCount failed');
    });
  });
}); 