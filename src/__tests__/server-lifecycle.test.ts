/**
 * Test file for MCPServer lifecycle management
 * Tests server initialization and shutdown functionality
 */

import { MCPServer, MCPServerConfig, ServerState } from '../server';
import axios from 'axios';

describe('MCPServer Lifecycle Management', () => {
  let server: MCPServer;
  const testPort = 3001; // Use different port to avoid conflicts

  beforeEach(() => {
    const config: Partial<MCPServerConfig> = {
      port: testPort,
      host: '127.0.0.1',
      debug: false,
    };
    server = new MCPServer(config);
  });

  afterEach(async () => {
    // Ensure server is stopped after each test
    if (server.getState() === ServerState.RUNNING) {
      await server.shutdown();
    }
  });

  describe('Server Initialization', () => {
    test('should initialize server successfully', async () => {
      expect(server.getState()).toBe(ServerState.STOPPED);
      
      await server.initialize();
      
      expect(server.getState()).toBe(ServerState.RUNNING);
      expect(server.getConnectionCount()).toBe(0);
    });

    test('should not allow initialization when not stopped', async () => {
      await server.initialize();
      expect(server.getState()).toBe(ServerState.RUNNING);

      await expect(server.initialize()).rejects.toThrow(
        'Cannot initialize server in state: running'
      );
    });

    test('should serve basic endpoint after initialization', async () => {
      await server.initialize();
      
      const response = await axios.get(`http://127.0.0.1:${testPort}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        name: 'Tally MCP Server',
        version: '1.0.0',
        status: 'running',
        connections: 0,
      });
    });

    test('should handle initialization errors gracefully', async () => {
      // Create server with invalid configuration (port already in use)
      const server1 = new MCPServer({ port: testPort, host: '127.0.0.1' });
      const server2 = new MCPServer({ port: testPort, host: '127.0.0.1' });

      await server1.initialize();
      expect(server1.getState()).toBe(ServerState.RUNNING);

      // Give the OS a moment to fully bind the port
      await new Promise(resolve => setTimeout(resolve, 50));

      // Second server should fail to initialize on same port
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
      
      // Should not throw error
      await server.shutdown();
      
      expect(server.getState()).toBe(ServerState.STOPPED);
    });

    test('should close server endpoint after shutdown', async () => {
      await server.initialize();
      
      // Verify server is responding
      const response = await axios.get(`http://127.0.0.1:${testPort}`);
      expect(response.status).toBe(200);
      
      await server.shutdown();
      
      // Give more time for the port to be fully released and OS to clean up
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Server should no longer be accessible
      await expect(
        axios.get(`http://127.0.0.1:${testPort}`, { timeout: 500 })
      ).rejects.toThrow();
    });
  });

  describe('Server State Management', () => {
    test('should track state transitions correctly', async () => {
      expect(server.getState()).toBe(ServerState.STOPPED);
      
      const initPromise = server.initialize();
      // State should be STARTING during initialization
      // Note: This might be too fast to catch in practice
      
      await initPromise;
      expect(server.getState()).toBe(ServerState.RUNNING);
      
      const shutdownPromise = server.shutdown();
      // State should be STOPPING during shutdown
      // Note: This might be too fast to catch in practice
      
      await shutdownPromise;
      expect(server.getState()).toBe(ServerState.STOPPED);
    });
  });

  describe('Configuration Handling', () => {
    test('should use custom configuration during initialization', async () => {
      const customConfig: Partial<MCPServerConfig> = {
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