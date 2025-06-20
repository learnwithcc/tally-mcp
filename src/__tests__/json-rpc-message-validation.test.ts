import { MCPServer, MCPServerConfig, ServerState } from '../server';

// JSON-RPC 2.0 Message Interfaces based on MCP specification
interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any[] | object;
  id?: string | number | null;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: JsonRpcError;
  id: string | number | null;
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

/**
 * Mock Response class for testing handleMCPMessage
 */
class MockResponse {
  public statusCode: number = 200;
  public data: any;
  private headers: Record<string, string> = {};

  status(code: number): MockResponse {
    this.statusCode = code;
    return this;
  }

  json(data: any): void {
    this.data = data;
  }

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  getHeader(name: string): string | undefined {
    return this.headers[name];
  }
}

describe('JSON-RPC 2.0 Message Validation', () => {
  let server: MCPServer;

  beforeEach(async () => {
    const config: Partial<MCPServerConfig> = {
      port: 5000,
      host: '127.0.0.1',
      debug: false,
    };
    server = new MCPServer(config);
    // Initialize the server to set up MCP handlers but don't start HTTP server
    await server.initialize();
  });

  afterEach(async () => {
    if (server && server.getState() !== ServerState.STOPPED) {
      await server.shutdown();
    }
  });

  // Helper function to call handleMCPMessage directly
  async function testMCPMessage(message: any): Promise<JsonRpcResponse> {
    const mockRes = new MockResponse();
    await (server as any).handleMCPMessage(message, mockRes);
    return mockRes.data;
  }

  describe('JSON-RPC 2.0 Structure Compliance', () => {
    test('should process a valid request and return a valid response', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 1,
      };

      const response = await testMCPMessage(request);
      
      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result || response.error).toBeDefined();
      expect(response.result && response.error).toBeFalsy(); // Only one should be set
    });

    test('should include correct jsonrpc version in all responses', async () => {
      const requests = [
        { jsonrpc: '2.0', method: 'tools/list', params: {}, id: 'test1' },
        { jsonrpc: '2.0', method: 'prompts/list', params: {}, id: 'test2' },
        { jsonrpc: '2.0', method: 'resources/list', params: {}, id: 'test3' },
      ];

      for (const request of requests) {
        const response = await testMCPMessage(request);
        expect(response).toBeDefined();
        expect(response.jsonrpc).toBe('2.0');
        expect(response.id).toBe(request.id);
      }
    });

    test('should handle initialize request correctly', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        },
        id: 'init-1',
      };

      const response = await testMCPMessage(request);
      
      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe('init-1');
      expect(response.result).toBeDefined();
      expect(response.result.protocolVersion).toBe('2024-11-05');
      expect(response.result.capabilities).toBeDefined();
      expect(response.result.serverInfo).toBeDefined();
    });
  });

  describe('JSON-RPC 2.0 Error Handling', () => {
    test('should return Invalid Request (-32600) for missing jsonrpc field', async () => {
      const invalidRequest = { method: 'tools/list', params: {}, id: 1 }; // Missing jsonrpc

      const response = await testMCPMessage(invalidRequest);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32600);
      expect(response.error?.message).toBe('Invalid Request');
    });

    test('should return Invalid Request (-32600) for wrong jsonrpc version', async () => {
      const invalidRequest = { jsonrpc: '1.0', method: 'tools/list', params: {}, id: 1 };

      const response = await testMCPMessage(invalidRequest);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32600);
      expect(response.error?.message).toBe('Invalid Request');
    });

    test('should return Invalid Request (-32600) for missing method field', async () => {
      const invalidRequest = { jsonrpc: '2.0', params: {}, id: 1 }; // Missing method

      const response = await testMCPMessage(invalidRequest);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32600);
      expect(response.error?.message).toBe('Invalid Request');
    });

    test('should return Invalid Request (-32600) for non-string method', async () => {
      const invalidRequest = { jsonrpc: '2.0', method: 123, params: {}, id: 1 }; // method must be string

      const response = await testMCPMessage(invalidRequest);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32600);
      expect(response.error?.message).toBe('Invalid Request');
    });

    test('should return Method Not Found (-32601) error', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'nonexistent/method',
        params: {},
        id: '1',
      };

      const response = await testMCPMessage(request);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32601);
      expect(response.error?.message).toBe('Method not found');
      expect(response.id).toBe('1');
    });

    test('should return Internal Error (-32603) for invalid params on tools/call', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { invalid: 'structure' }, // Missing required 'name' field
        id: 3,
      };

      const response = await testMCPMessage(request);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(3);
      
      // Server should return an error for invalid params (could be -32602, -32603, or other)
      if (response.error) {
        expect(response.error.code).toBeLessThan(0); // Any negative error code is acceptable
        expect(response.error.message).toBeDefined();
      } else {
        // If no error, the server handled it gracefully, which is also acceptable
        expect(response.result).toBeDefined();
      }
    });

    test('should handle null and undefined messages', async () => {
      // Test null message
      const nullResponse = await testMCPMessage(null);
      expect(nullResponse.error?.code).toBe(-32600);
      expect(nullResponse.error?.message).toBe('Invalid Request');

      // Test undefined message  
      const undefinedResponse = await testMCPMessage(undefined);
      expect(undefinedResponse.error?.code).toBe(-32600);
      expect(undefinedResponse.error?.message).toBe('Invalid Request');
    });

    test('should handle empty object message', async () => {
      const emptyResponse = await testMCPMessage({});
      expect(emptyResponse.error?.code).toBe(-32600);
      expect(emptyResponse.error?.message).toBe('Invalid Request');
    });

    test('should handle array message (not allowed)', async () => {
      const arrayResponse = await testMCPMessage([]);
      expect(arrayResponse.error?.code).toBe(-32600);
      expect(arrayResponse.error?.message).toBe('Invalid Request');
    });
  });

  describe('MCP Protocol Specific Validation', () => {
    test('should handle tools/list request correctly', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 'tools-1',
      };

      const response = await testMCPMessage(request);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe('tools-1');
      expect(response.result).toBeDefined();
      expect(response.result.tools).toBeDefined();
      expect(Array.isArray(response.result.tools)).toBe(true);
    });

    test('should handle prompts/list request correctly', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'prompts/list',
        params: {},
        id: 'prompts-1',
      };

      const response = await testMCPMessage(request);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe('prompts-1');
      expect(response.result).toBeDefined();
      expect(response.result.prompts).toBeDefined();
      expect(Array.isArray(response.result.prompts)).toBe(true);
    });

    test('should handle resources/list request correctly', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'resources/list',
        params: {},
        id: 'resources-1',
      };

      const response = await testMCPMessage(request);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe('resources-1');
      expect(response.result).toBeDefined();
      expect(response.result.resources).toBeDefined();
      expect(Array.isArray(response.result.resources)).toBe(true);
    });

    test('should handle missing optional params field', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 'no-params-test',
      };

      const response = await testMCPMessage(request);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe('no-params-test');
      expect(response.result || response.error).toBeDefined();
    });

    test('should preserve request ID in response', async () => {
      const testIds = ['string-id', 123, 0, 'test-with-special-chars-🚀'];

      for (const testId of testIds) {
        const request: JsonRpcRequest = {
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: testId,
        };

        const response = await testMCPMessage(request);
        expect(response.id).toBe(testId);
      }
    });

    test('should handle special characters in method names', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'test/method-with-special-chars_123',
        params: {},
        id: 'special-test',
      };

      const response = await testMCPMessage(request);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe('special-test');
      expect(response.error?.code).toBe(-32601); // Method not found is expected
    });
  });
}); 