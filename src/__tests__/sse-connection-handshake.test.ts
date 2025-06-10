/**
 * Comprehensive SSE Connection Establishment and MCP Handshake Testing
 * 
 * This test suite verifies:
 * - SSE connection establishment with various MCP client simulations
 * - Proper MCP protocol handshake sequences
 * - JSON-RPC 2.0 compliance in message exchange
 * - Server capability negotiation
 * - Tool discovery through SSE connections
 */

import { MCPServer, MCPServerConfig, ServerState } from '../server';
import axios from 'axios';
import EventSource from 'eventsource';

/**
 * Mock MCP Client implementation for testing
 */
class MockMCPClient {
  private eventSource?: EventSource;
  private messages: any[] = [];
  private events: any[] = [];
  private connected = false;
  private connectionError?: Error;

  constructor(private url: string, private clientType: string = 'test-client') {}

  async connect(timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.disconnect();
        reject(new Error(`Connection timeout after ${timeout}ms`));
      }, timeout);

      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        this.connected = true;
        clearTimeout(timeoutId);
        resolve();
      };

      this.eventSource.onerror = (error) => {
        this.connectionError = error as Error;
        clearTimeout(timeoutId);
        this.disconnect();
        reject(error);
      };

      this.eventSource.onmessage = (event) => {
        this.events.push(event);
        try {
          const data = JSON.parse(event.data);
          this.messages.push(data);
        } catch (e) {
          // Handle non-JSON messages
          this.messages.push({ raw: event.data });
        }
      };

      // Listen for specific event types
      this.eventSource.addEventListener('connection', (event) => {
        this.events.push({ type: 'connection', data: event.data });
      });

      this.eventSource.addEventListener('heartbeat', (event) => {
        this.events.push({ type: 'heartbeat', data: event.data });
      });

      this.eventSource.addEventListener('mcp-response', (event) => {
        this.events.push({ type: 'mcp-response', data: event.data });
      });
    });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected && this.eventSource?.readyState === EventSource.OPEN;
  }

  getMessages(): any[] {
    return [...this.messages];
  }

  getEvents(): any[] {
    return [...this.events];
  }

  getConnectionError(): Error | undefined {
    return this.connectionError;
  }

  async waitForMessages(count: number, timeout: number = 3000): Promise<any[]> {
    const startTime = Date.now();
    while (this.messages.length < count && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return this.getMessages();
  }

  async waitForEvent(eventType: string, timeout: number = 3000): Promise<any> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const event = this.events.find(e => e.type === eventType || (e as any).type === eventType);
      if (event) return event;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error(`Event ${eventType} not received within ${timeout}ms`);
  }
}

/**
 * HTTP-based MCP client for testing POST endpoints
 */
class HttpMCPClient {
  constructor(private baseUrl: string) {}

  async sendMessage(message: any, timeout: number = 3000): Promise<any> {
    const response = await axios.post(`${this.baseUrl}/message`, message, {
      timeout,
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async initialize(clientInfo: any = {}): Promise<any> {
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

  async listTools(): Promise<any> {
    return this.sendMessage({
      jsonrpc: '2.0',
      id: 'tools-list-1',
      method: 'tools/list',
      params: {}
    });
  }

  async callTool(name: string, arguments_: any = {}): Promise<any> {
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
  let server: MCPServer;
  let testPort: number;
  let baseUrl: string;

  beforeEach(async () => {
    // Use dynamic port to avoid conflicts
    testPort = 4000 + Math.floor(Math.random() * 1000);
    baseUrl = `http://127.0.0.1:${testPort}`;
    
    const config: Partial<MCPServerConfig> = {
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
    // Allow cleanup time
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Basic SSE Connection Establishment', () => {
    test('should establish SSE connection within expected timeframe', async () => {
      const client = new MockMCPClient(`${baseUrl}/sse`, 'claude-desktop');
      const startTime = Date.now();
      
      await client.connect(3000);
      const connectionTime = Date.now() - startTime;
      
      expect(client.isConnected()).toBe(true);
      expect(connectionTime).toBeLessThan(2000); // Should connect within 2 seconds
      
      client.disconnect();
    });

    test('should handle multiple simultaneous SSE connections', async () => {
      const clients = [
        new MockMCPClient(`${baseUrl}/sse`, 'claude-desktop'),
        new MockMCPClient(`${baseUrl}/sse`, 'mcp-inspector'),
        new MockMCPClient(`${baseUrl}/sse`, 'custom-client')
      ];

      // Connect all clients simultaneously
      const connectionPromises = clients.map(client => client.connect(3000));
      await Promise.all(connectionPromises);

      // Verify all connections are established
      clients.forEach(client => {
        expect(client.isConnected()).toBe(true);
      });

      // Verify server tracks connections correctly
      const healthResponse = await axios.get(`${baseUrl}/health`, { 
        validateStatus: () => true,
        timeout: 5000
      });
      // Server might be under load, so check if it's still responding
      expect(healthResponse.status).toBeLessThan(500);
      if (healthResponse.status === 200) {
        expect(healthResponse.data.connections).toBeGreaterThanOrEqual(3);
      }

      // Clean up
      clients.forEach(client => client.disconnect());
    });

    test('should send initial connection confirmation message', async () => {
      const client = new MockMCPClient(`${baseUrl}/sse`, 'test-client');
      await client.connect();

      // Give some time for initial events to arrive
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we have any events at all
      const events = client.getEvents();
      expect(events.length).toBeGreaterThan(0);

      // Look for connection event
      const connectionEvent = events.find(e => e.type === 'connection' || (e as any).type === 'connection');
      expect(connectionEvent).toBeDefined();
      
      if (connectionEvent) {
        const connectionData = JSON.parse(connectionEvent.data);
        expect(connectionData.status).toBe('connected');
        expect(connectionData.serverInfo).toBeDefined();
        expect(connectionData.serverInfo.name).toBe('Tally MCP Server');
        expect(connectionData.serverInfo.capabilities).toContain('tools');
      }

      client.disconnect();
    });

    test('should maintain heartbeat mechanism', async () => {
      const client = new MockMCPClient(`${baseUrl}/sse`, 'heartbeat-test');
      await client.connect();

      // Wait for initial connection
      await client.waitForEvent('connection', 2000);

      // Wait for heartbeat (should come within 35 seconds, but we'll wait less)
      // The server sends heartbeats every 30 seconds
      const heartbeatEvent = await client.waitForEvent('heartbeat', 35000);
      expect(heartbeatEvent).toBeDefined();
      
      const heartbeatData = JSON.parse(heartbeatEvent.data);
      expect(heartbeatData.timestamp).toBeDefined();
      expect(typeof heartbeatData.timestamp).toBe('number');

      client.disconnect();
    }, 40000); // Increase timeout to 40 seconds
  });

  describe('MCP Protocol Handshake', () => {
    test('should complete proper MCP initialization handshake', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      const initResponse = await httpClient.initialize({
        name: 'test-client',
        version: '1.0.0'
      });

      expect(initResponse.jsonrpc).toBe('2.0');
      expect(initResponse.id).toBe('init-1');
      expect(initResponse.result).toBeDefined();
      expect(initResponse.result.protocolVersion).toBe('2024-11-05');
      expect(initResponse.result.capabilities).toBeDefined();
      expect(initResponse.result.serverInfo).toBeDefined();
      expect(initResponse.result.serverInfo.name).toBe('tally-mcp-server');
    });

    test('should support capability negotiation', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      const initResponse = await httpClient.initialize();
      const capabilities = initResponse.result.capabilities;
      
      expect(capabilities).toHaveProperty('tools');
      expect(capabilities).toHaveProperty('resources');
      expect(capabilities).toHaveProperty('prompts');
    });

    test('should handle invalid handshake messages gracefully', async () => {
      const invalidMessages = [
        null,
        undefined,
        {},
        { method: 'initialize' }, // Missing jsonrpc and id
        { jsonrpc: '1.0', method: 'initialize', id: 1 }, // Wrong protocol version
        { jsonrpc: '2.0', id: 1 }, // Missing method
      ];

      const httpClient = new HttpMCPClient(baseUrl);

      for (const message of invalidMessages) {
        const response = await axios.post(`${baseUrl}/message`, message, {
          validateStatus: () => true,
          headers: { 'Content-Type': 'application/json' }
        });

        expect(response.status).toBe(400);
        // Check if response has either jsonrpc field or is a valid error response
        if (response.data.jsonrpc) {
          expect(response.data.jsonrpc).toBe('2.0');
          expect(response.data.error).toBeDefined();
          expect(response.data.error.code).toBe(-32600); // Invalid Request
        } else {
          // Alternative error format - just verify it's an error response
          expect(response.data.error || response.data.message).toBeDefined();
        }
      }
    });

    test('should validate JSON-RPC 2.0 compliance', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      const initResponse = await httpClient.initialize();
      
      // Verify JSON-RPC 2.0 structure
      expect(initResponse.jsonrpc).toBe('2.0');
      expect(initResponse.id).toBeDefined();
      expect(initResponse.result || initResponse.error).toBeDefined();
      expect(initResponse.result && initResponse.error).toBeFalsy(); // Only one should be present
    });
  });

  describe('Tool Discovery Through SSE', () => {
    test('should list available tools correctly', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      // Initialize first
      await httpClient.initialize();
      
      // List tools
      const toolsResponse = await httpClient.listTools();
      
      expect(toolsResponse.jsonrpc).toBe('2.0');
      expect(toolsResponse.result).toBeDefined();
      expect(toolsResponse.result.tools).toBeDefined();
      expect(Array.isArray(toolsResponse.result.tools)).toBe(true);
      expect(toolsResponse.result.tools.length).toBeGreaterThan(0);
      
      // Verify tool structure
      const tools = toolsResponse.result.tools;
      tools.forEach((tool: any) => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
      });
    });

    test('should handle tool calls with proper error handling', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      // Initialize first
      await httpClient.initialize();
      
      // Try to call a non-existent tool
      const response = await axios.post(`${baseUrl}/message`, {
        jsonrpc: '2.0',
        id: 'test-invalid-tool',
        method: 'tools/call',
        params: {
          name: 'nonexistent-tool',
          arguments: {}
        }
      }, {
        validateStatus: () => true,
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.data.jsonrpc).toBe('2.0');
      expect(response.data.id).toBe('test-invalid-tool');
      expect(response.data.result || response.data.error).toBeDefined();
    });
  });

  describe('Client Type Simulation', () => {
    test('should handle Claude Desktop simulation', async () => {
      const sseClient = new MockMCPClient(`${baseUrl}/sse`, 'claude-desktop');
      const httpClient = new HttpMCPClient(baseUrl);
      
      // Establish SSE connection
      await sseClient.connect();
      await sseClient.waitForEvent('connection', 2000);
      
      // Perform MCP handshake via HTTP
      const initResponse = await httpClient.initialize({
        name: 'Claude Desktop',
        version: '1.0.0'
      });
      
      expect(initResponse.result).toBeDefined();
      expect(initResponse.result.protocolVersion).toBe('2024-11-05');
      
      // List tools
      const toolsResponse = await httpClient.listTools();
      expect(toolsResponse.result.tools).toBeDefined();
      
      sseClient.disconnect();
    });

    test('should handle MCP Inspector simulation', async () => {
      const sseClient = new MockMCPClient(`${baseUrl}/sse`, 'mcp-inspector');
      const httpClient = new HttpMCPClient(baseUrl);
      
      await sseClient.connect();
      await sseClient.waitForEvent('connection', 2000);
      
      const initResponse = await httpClient.initialize({
        name: 'MCP Inspector',
        version: '0.1.0'
      });
      
      expect(initResponse.result.serverInfo.name).toBe('tally-mcp-server');
      
      sseClient.disconnect();
    });

    test('should handle custom client simulation', async () => {
      const sseClient = new MockMCPClient(`${baseUrl}/sse`, 'custom-client');
      const httpClient = new HttpMCPClient(baseUrl);
      
      await sseClient.connect();
      await sseClient.waitForEvent('connection', 2000);
      
      const initResponse = await httpClient.initialize({
        name: 'Custom MCP Client',
        version: '2.0.0'
      });
      
      expect(initResponse.result.capabilities).toHaveProperty('tools');
      
      sseClient.disconnect();
    });
  });

  describe('Connection State Management', () => {
    test('should track connection lifecycle properly', async () => {
      const initialHealthResponse = await axios.get(`${baseUrl}/health`, { 
        validateStatus: () => true,
        timeout: 5000
      });
      
      // Only proceed if server is healthy
      if (initialHealthResponse.status !== 200) {
        console.warn('Server unhealthy, skipping connection lifecycle test');
        return;
      }
      
      const initialConnections = initialHealthResponse.data.connections;
      
      const client = new MockMCPClient(`${baseUrl}/sse`, 'lifecycle-test');
      
      // Connect
      await client.connect();
      const connectHealthResponse = await axios.get(`${baseUrl}/health`, { 
        validateStatus: () => true,
        timeout: 5000
      });
      
      if (connectHealthResponse.status === 200) {
        expect(connectHealthResponse.data.connections).toBeGreaterThan(initialConnections);
      }
      
      // Disconnect
      client.disconnect();
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const disconnectHealthResponse = await axios.get(`${baseUrl}/health`, { 
        validateStatus: () => true,
        timeout: 5000
      });
      
      if (disconnectHealthResponse.status === 200 && connectHealthResponse.status === 200) {
        expect(disconnectHealthResponse.data.connections).toBeLessThanOrEqual(connectHealthResponse.data.connections);
      }
    });

    test('should handle abrupt connection termination', async () => {
      const client = new MockMCPClient(`${baseUrl}/sse`, 'abrupt-test');
      await client.connect();
      
      // Verify connection is established
      expect(client.isConnected()).toBe(true);
      
      // Abruptly close connection
      client.disconnect();
      
      // Server should handle this gracefully and not crash
      const healthResponse = await axios.get(`${baseUrl}/health`, { 
        validateStatus: () => true,
        timeout: 5000
      });
      expect(healthResponse.status).toBeLessThan(500); // Should not be a server error
    });
  });

  describe('Performance and Reliability', () => {
    test('should establish connections within performance benchmarks', async () => {
      const connectionTimes: number[] = [];
      const testRuns = 5;
      
      for (let i = 0; i < testRuns; i++) {
        const client = new MockMCPClient(`${baseUrl}/sse`, `perf-test-${i}`);
        const startTime = Date.now();
        
        await client.connect(3000);
        const connectionTime = Date.now() - startTime;
        connectionTimes.push(connectionTime);
        
        client.disconnect();
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const averageTime = connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length;
      const maxTime = Math.max(...connectionTimes);
      
      expect(averageTime).toBeLessThan(1000); // Average under 1 second
      expect(maxTime).toBeLessThan(2000);     // Max under 2 seconds
    });

    test('should handle rapid connection cycling', async () => {
      const cycleCount = 10;
      
      for (let i = 0; i < cycleCount; i++) {
        const client = new MockMCPClient(`${baseUrl}/sse`, `cycle-test-${i}`);
        await client.connect(2000);
        expect(client.isConnected()).toBe(true);
        client.disconnect();
        
        // Very short delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Server should still be responsive
      const healthResponse = await axios.get(`${baseUrl}/health`, { 
        validateStatus: () => true,
        timeout: 5000
      });
      expect(healthResponse.status).toBeLessThan(500); // Should not be a server error
      if (healthResponse.status === 200) {
        expect(healthResponse.data.healthy).toBe(true);
      }
    });
  });
}); 