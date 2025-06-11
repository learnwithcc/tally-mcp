import { MCPServer, MCPServerConfig, ServerState } from '../server';
import { JsonRpcRequest, JsonRpcResponse } from '../types/json-rpc';
import axios from 'axios';
import EventSource from 'eventsource';
import { EventEmitter } from 'events';

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  get: jest.fn(),
  post: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

class MockMCPClient {
  private eventSource: EventSource | null = null;
  private connected = false;
  private events: { type: string; data: string }[] = [];
  private messages: any[] = [];
  private eventEmitter = new EventEmitter();

  constructor(private serverUrl: string, private clientId: string = 'test-client') {}

  isConnected(): boolean {
    return this.connected;
  }

  getEvents(): { type: string; data: string }[] {
    return this.events;
  }

  getMessages(): any[] {
    return this.messages;
  }

  async connect(timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.disconnect();
        reject(new Error(`Connection timeout after ${timeout}ms`));
      }, timeout);

      this.eventSource = new EventSource(`${this.serverUrl}?clientId=${this.clientId}`);

      this.eventSource.onopen = () => {
        this.connected = true;
        this.events.push({ type: 'open', data: '' });
        this.eventEmitter.emit('open');
        clearTimeout(timeoutId);
        resolve();
      };

      this.eventSource.onerror = (errorEvent: MessageEvent) => {
        this.connected = false;
        const error = new Error('SSE connection error');
        (error as any).event = errorEvent;
        this.events.push({ type: 'error', data: JSON.stringify(errorEvent) });
        this.eventEmitter.emit('error', error);
        reject(error);
      };

      this.eventSource.onmessage = (event: MessageEvent) => {
        this.events.push({ type: 'message', data: event.data });
        this.eventEmitter.emit('message', event);
        try {
          const data = JSON.parse(event.data);
          this.messages.push(data);
        } catch (e) {
          this.messages.push({ raw: event.data });
        }
      };

      this.eventSource.addEventListener('connection', (event: MessageEvent) => {
        this.events.push({ type: 'connection', data: event.data });
        this.eventEmitter.emit('connection', event);
      });

      this.eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
        this.events.push({ type: 'heartbeat', data: event.data });
        this.eventEmitter.emit('heartbeat', event);
      });

      this.eventSource.addEventListener('mcp-response', (event: MessageEvent) => {
        this.events.push({ type: 'mcp-response', data: event.data });
        this.eventEmitter.emit('mcp-response', event);
      });
    });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connected = false;
    }
  }

  async waitForEvent(eventType: string, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for event ${eventType}`));
      }, timeout);

      const handler = (event: any) => {
        clearTimeout(timeoutId);
        resolve(event);
      };

      this.eventEmitter.once(eventType, handler);
    });
  }
}

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
        capabilities: clientInfo.capabilities || {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
          ...clientInfo
        }
      }
    });
  }
}

describe('MCP Capability Negotiation', () => {
  let server: MCPServer;
  let baseUrl: string;
  const testPort = 5000;

  beforeEach(async () => {
    baseUrl = `http://127.0.0.1:${testPort}`;
    const config: Partial<MCPServerConfig> = {
      port: testPort,
      host: '127.0.0.1',
      debug: false,
    };
    server = new MCPServer(config);
    await server.initialize();
  });

  afterEach(async () => {
    if (server && server.getState() !== ServerState.STOPPED) {
      await server.shutdown();
    }
    jest.clearAllMocks();
  });

  describe('Protocol Version Negotiation', () => {
    test('should accept matching protocol version', async () => {
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
      expect(initResponse.result.protocolVersion).toBe('2024-11-05');
    });

    test('should reject unsupported protocol version', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      const response = await httpClient.sendMessage({
        jsonrpc: '2.0',
        id: 'init-unsupported',
        method: 'initialize',
        params: {
          protocolVersion: '2023-01-01',
          capabilities: {}
        }
      });

      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32600);
      expect(response.error.message).toContain('Unsupported protocol version');
    });

    test('should handle missing protocol version', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      const response = await httpClient.sendMessage({
        jsonrpc: '2.0',
        id: 'init-no-version',
        method: 'initialize',
        params: {
          capabilities: {}
        }
      });

      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32602);
      expect(response.error.message).toContain('Protocol version is required');
    });
  });

  describe('Capability Discovery', () => {
    test('should advertise supported capabilities in SSE connection', async () => {
      const client = new MockMCPClient(`${baseUrl}/sse`);
      await client.connect();

      const connectionEvent = await client.waitForEvent('connection', 5000);
      const connectionData = JSON.parse(connectionEvent.data);
      
      expect(connectionData.serverInfo.capabilities).toContain('tools');
      expect(connectionData.serverInfo.capabilities).toContain('resources');
      expect(connectionData.serverInfo.capabilities).toContain('prompts');

      client.disconnect();
    });

    test('should include full capability details in initialization response', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: {
          jsonrpc: '2.0',
          id: 'init-1',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: true },
              resources: { subscribe: false, listChanged: false },
              prompts: { listChanged: false },
              logging: {}
            }
          }
        }
      });

      const initResponse = await httpClient.initialize();
      const capabilities = initResponse.result.capabilities;
      
      expect(capabilities.tools).toBeDefined();
      expect(capabilities.tools.listChanged).toBe(true);
      expect(capabilities.resources).toBeDefined();
      expect(capabilities.resources.subscribe).toBe(false);
      expect(capabilities.prompts).toBeDefined();
      expect(capabilities.logging).toBeDefined();
    });
  });

  describe('Capability Negotiation', () => {
    test('should handle client requesting unsupported capability', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      const initResponse = await httpClient.initialize({
        capabilities: {
          unsupportedFeature: { enabled: true }
        }
      });

      expect(initResponse.result.capabilities.unsupportedFeature).toBeUndefined();
    });

    test('should respect client capability preferences', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: {
          jsonrpc: '2.0',
          id: 'init-1',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false },
              prompts: { listChanged: false }
            }
          }
        }
      });

      const initResponse = await httpClient.initialize({
        capabilities: {
          tools: { listChanged: false }
        }
      });

      expect(initResponse.result.capabilities.tools.listChanged).toBe(false);
    });

    test('should handle missing client capabilities gracefully', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: {
          jsonrpc: '2.0',
          id: 'init-1',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: true },
              resources: { subscribe: false },
              prompts: { listChanged: false }
            }
          }
        }
      });

      const initResponse = await httpClient.initialize({
        capabilities: undefined
      });

      expect(initResponse.result.capabilities).toBeDefined();
      expect(initResponse.result.capabilities.tools).toBeDefined();
    });
  });

  describe('Capability Updates', () => {
    test('should notify clients when tool list changes', async () => {
      const client = new MockMCPClient(`${baseUrl}/sse`);
      await client.connect();

      // Wait for initial tools list notification
      const toolsEvent = await client.waitForEvent('mcp-response', 5000);
      const toolsData = JSON.parse(toolsEvent.data);
      
      expect(toolsData.method).toBe('notifications/tools/list_changed');
      expect(toolsData.params.tools).toBeDefined();

      client.disconnect();
    });

    test('should maintain capability state across reconnections', async () => {
      const client = new MockMCPClient(`${baseUrl}/sse`);
      await client.connect();

      const firstConnection = await client.waitForEvent('connection', 5000);
      const firstCapabilities = JSON.parse(firstConnection.data).serverInfo.capabilities;
      
      client.disconnect();

      // Reconnect
      await client.connect();
      
      const secondConnection = await client.waitForEvent('connection', 5000);
      const secondCapabilities = JSON.parse(secondConnection.data).serverInfo.capabilities;

      expect(secondCapabilities).toEqual(firstCapabilities);

      client.disconnect();
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed capability objects', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      const response = await httpClient.sendMessage({
        jsonrpc: '2.0',
        id: 'init-malformed',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: 'invalid'
        }
      });

      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32602);
      expect(response.error.message).toContain('Invalid capabilities format');
    });

    test('should handle invalid capability values', async () => {
      const httpClient = new HttpMCPClient(baseUrl);
      
      const response = await httpClient.sendMessage({
        jsonrpc: '2.0',
        id: 'init-invalid-values',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: 'invalid',
            resources: null,
            prompts: 123
          }
        }
      });

      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32602);
      expect(response.error.message).toContain('Invalid capability values');
    });
  });
}); 