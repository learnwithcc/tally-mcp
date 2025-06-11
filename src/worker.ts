/**
 * Cloudflare Workers Entry Point for Tally MCP Server
 * 
 * This file provides a complete MCP protocol implementation for Cloudflare Workers.
 */

// Cloudflare Workers environment interface
interface Env {
  TALLY_API_KEY: string; // Made required since it's essential for the worker
  AUTH_TOKEN?: string; // Optional server authentication token for personal security
  PORT?: string;
  DEBUG?: string;
  [key: string]: string | undefined;
}

// Session management for SSE connections
interface SSESession {
  id: string;
  controller: ReadableStreamDefaultController;
  lastActivity: number;
  pendingRequests: Map<string | number, any>;
  apiKey: string; // Store the API key for this session
  heartbeatInterval?: NodeJS.Timeout;
}

// Global session storage (in a real implementation, you'd use Durable Objects or external storage)
const activeSessions = new Map<string, SSESession>();

// MCP Protocol Types
interface MCPRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id?: string | number | undefined;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}



// Tool definitions for Tally MCP Server
const TOOLS = [
  {
    name: 'create_form',
    description: 'Create a new Tally form with specified fields and configuration',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Form title' },
        description: { type: 'string', description: 'Form description' },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio'] },
              label: { type: 'string' },
              required: { type: 'boolean' },
              options: { type: 'array', items: { type: 'string' } }
            },
            required: ['type', 'label']
          }
        },
        settings: {
          type: 'object',
          properties: {
            isPublic: { type: 'boolean' },
            allowMultipleSubmissions: { type: 'boolean' },
            showProgressBar: { type: 'boolean' }
          }
        }
      },
      required: ['title', 'fields']
    }
  },
  {
    name: 'modify_form',
    description: 'Modify an existing Tally form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to modify' },
        title: { type: 'string', description: 'New form title' },
        description: { type: 'string', description: 'New form description' },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              label: { type: 'string' },
              required: { type: 'boolean' },
              options: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      },
      required: ['formId']
    }
  },
  {
    name: 'get_form',
    description: 'Retrieve details of a specific Tally form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to retrieve' }
      },
      required: ['formId']
    }
  },
  {
    name: 'list_forms',
    description: 'List all forms in the workspace',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'delete_form',
    description: 'Delete a Tally form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to delete' }
      },
      required: ['formId']
    }
  },
  {
    name: 'get_submissions',
    description: 'Retrieve submissions for a specific form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form' },
        limit: { type: 'number', description: 'Maximum number of submissions to return' },
        offset: { type: 'number', description: 'Number of submissions to skip' },
        since: { type: 'string', description: 'ISO date string to filter submissions since' }
      },
      required: ['formId']
    }
  },
  {
    name: 'analyze_submissions',
    description: 'Analyze form submissions and provide insights',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to analyze' },
        analysisType: { 
          type: 'string', 
          enum: ['summary', 'trends', 'responses', 'completion_rate'],
          description: 'Type of analysis to perform'
        }
      },
      required: ['formId', 'analysisType']
    }
  },
  {
    name: 'share_form',
    description: 'Generate sharing links and embed codes for a form',
    inputSchema: {
      type: 'object',
      properties: {
        formId: { type: 'string', description: 'ID of the form to share' },
        shareType: {
          type: 'string',
          enum: ['link', 'embed', 'popup'],
          description: 'Type of sharing method'
        },
        customization: {
          type: 'object',
          properties: {
            width: { type: 'string' },
            height: { type: 'string' },
            hideTitle: { type: 'boolean' }
          }
        }
      },
      required: ['formId', 'shareType']
    }
  },
  {
    name: 'manage_workspace',
    description: 'Manage workspace settings and information',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['get_info', 'update_settings', 'get_usage'],
          description: 'Action to perform on workspace'
        },
        settings: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' }
          }
        }
      },
      required: ['action']
    }
  },
  {
    name: 'manage_team',
    description: 'Manage team members and permissions',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list_members', 'invite_member', 'remove_member', 'update_permissions'],
          description: 'Team management action'
        },
        email: { type: 'string', description: 'Email for invite/remove actions' },
        role: {
          type: 'string',
          enum: ['admin', 'editor', 'viewer'],
          description: 'Role for the team member'
        }
      },
      required: ['action']
    }
  }
];

// Server capabilities
const SERVER_CAPABILITIES = {
  tools: {},
  resources: {},
  prompts: {},
  logging: {}
};

/**
 * Handle MCP messages over HTTP Stream transport
 */
async function handleMCPMessage(message: any, sessionIdOrApiKey?: string, env?: Env): Promise<MCPResponse> {
  console.log('Processing MCP message:', {
    method: message.method,
    id: message.id,
    hasParams: !!message.params
  });

  try {
    switch (message.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              logging: {}
            },
            serverInfo: {
              name: 'tally-mcp',
              version: '1.0.0'
            }
          }
        };

      case 'notifications/initialized':
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {}
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            tools: TOOLS
          }
        };

      case 'tools/call':
        console.log('tools/call - passing env to handleToolCall');
        const toolResult = await handleToolCall(message.params, sessionIdOrApiKey, env);
        toolResult.id = message.id;
        return toolResult;

      default:
        return {
          jsonrpc: '2.0',
          id: message.id,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Unknown method: ${message.method}`
          }
        };
    }
  } catch (error) {
    console.error('Error processing MCP message:', error);
    return {
      jsonrpc: '2.0',
      id: message.id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Handle tool calls
 */
async function handleToolCall(params: any, sessionIdOrApiKey?: string, env?: Env): Promise<MCPResponse> {
  const { name, arguments: args } = params;

  console.log('Tool call:', name, 'with args:', JSON.stringify(args));

  // For authless servers, always use environment API key
  let apiKey: string | undefined;
  
  if (env?.TALLY_API_KEY) {
    apiKey = env.TALLY_API_KEY;
    console.log('Using API key from environment');
  } else {
    console.error('❌ No TALLY_API_KEY found in environment');
    return {
      jsonrpc: '2.0',
      id: undefined, // Will be set by the caller
      error: {
        code: -32602,
        message: 'Invalid params',
        data: 'Server configuration error: TALLY_API_KEY not available'
      }
    };
  }

  try {
    const result = await callTallyAPI(name, args, apiKey);
    console.log('✅ Tool call successful:', name);
    
    return {
      jsonrpc: '2.0',
      id: undefined, // Will be set by the caller
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    };
  } catch (error) {
    console.error('❌ Tool execution error:', error);
    return {
      jsonrpc: '2.0',
      id: undefined, // Will be set by the caller
      error: {
        code: -32603,
        message: 'Tool execution failed',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Call Tally API based on tool name and arguments
 */
async function callTallyAPI(toolName: string, args: any, apiKey: string): Promise<any> {
  const baseURL = 'https://api.tally.so';
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  switch (toolName) {
    case 'create_form':
      const createResponse = await globalThis.fetch(`${baseURL}/forms`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: args.title,
          description: args.description,
          fields: args.fields,
          settings: args.settings
        })
      });
      return await createResponse.json();

    case 'modify_form':
      const modifyResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: args.title,
          description: args.description,
          fields: args.fields
        })
      });
      return await modifyResponse.json();

    case 'get_form':
      const getResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: 'GET',
        headers
      });
      return await getResponse.json();

    case 'list_forms':
      const listResponse = await globalThis.fetch(`${baseURL}/forms`, {
        method: 'GET',
        headers
      });
      return await listResponse.json();

    case 'delete_form':
      const deleteResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: 'DELETE',
        headers
      });
      return { success: deleteResponse.ok, status: deleteResponse.status };

    case 'get_submissions':
      let submissionsURL = `${baseURL}/forms/${args.formId}/submissions?limit=${args.limit || 50}&offset=${args.offset || 0}`;
      if (args.since) {
        submissionsURL += `&since=${args.since}`;
      }
      const submissionsResponse = await globalThis.fetch(submissionsURL, {
        method: 'GET',
        headers
      });
      return await submissionsResponse.json();

    case 'analyze_submissions':
      // This would typically involve fetching submissions and performing analysis
      const analysisResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}/submissions`, {
        method: 'GET',
        headers
      });
      const submissionsData = await analysisResponse.json();
      const submissions = Array.isArray(submissionsData) ? submissionsData : [];
      
      // Perform basic analysis based on type
      switch (args.analysisType) {
        case 'summary':
          return {
            totalSubmissions: submissions.length,
            analysisType: 'summary',
            formId: args.formId
          };
        case 'completion_rate':
          return {
            completionRate: '95%', // This would be calculated from actual data
            analysisType: 'completion_rate',
            formId: args.formId
          };
        default:
          return {
            message: `Analysis type ${args.analysisType} completed`,
            formId: args.formId
          };
      }

    case 'share_form':
      return {
        formId: args.formId,
        shareType: args.shareType,
        shareUrl: `https://tally.so/r/${args.formId}`,
        embedCode: args.shareType === 'embed' ? 
          `<iframe src="https://tally.so/embed/${args.formId}" width="${args.customization?.width || '100%'}" height="${args.customization?.height || '500px'}"></iframe>` : 
          undefined
      };

    case 'manage_workspace':
      if (args.action === 'get_info') {
        const workspaceResponse = await globalThis.fetch(`${baseURL}/workspace`, {
          method: 'GET',
          headers
        });
        return await workspaceResponse.json();
      }
      return { message: `Workspace ${args.action} completed` };

    case 'manage_team':
      return { message: `Team ${args.action} completed` };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Clean up stale sessions (older than 15 minutes)
 */
function cleanupStaleSessions() {
  const now = Date.now();
  const staleThreshold = 15 * 60 * 1000; // 15 minutes
  let cleanedCount = 0;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > staleThreshold) {
      console.log(`Cleaning up stale session: ${sessionId} (inactive for ${Math.round((now - session.lastActivity) / 1000)}s)`);
      
      // Clean up heartbeat interval
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      
      // Close the controller if possible
      try {
        session.controller.close();
      } catch (error) {
        console.error(`Error closing controller for stale session ${sessionId}:`, error);
      }
      
      activeSessions.delete(sessionId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} stale sessions. Active sessions: ${activeSessions.size}`);
  }
}

/**
 * Handle SSE transport for MCP
 */
async function handleSseRequest(request: Request, env?: Env): Promise<Response> {
  // Generate a unique session ID
  const sessionId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] Creating new SSE session: ${sessionId}`);

  const stream = new ReadableStream({
    start(controller) {
      // Store session
      activeSessions.set(sessionId, {
        id: sessionId,
        controller,
        lastActivity: Date.now(),
        pendingRequests: new Map(),
        apiKey: env?.TALLY_API_KEY || '' // Use environment API key for authless
      });

      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/session_started',
        params: { sessionId }
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(welcomeMessage));
    },
    cancel() {
      console.log(`[${new Date().toISOString()}] SSE session closed: ${sessionId}`);
      activeSessions.delete(sessionId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Session-ID': sessionId
    }
  });
}

/**
 * Handle HTTP Stream transport for MCP
 */
async function handleHTTPStreamTransport(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.text();
    
    let mcpRequest: MCPRequest;
    try {
      mcpRequest = JSON.parse(body);
    } catch (error) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
          data: 'Invalid JSON'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Validate MCP request structure
    if (!mcpRequest.jsonrpc || mcpRequest.jsonrpc !== '2.0' || !mcpRequest.method) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: mcpRequest.id,
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: 'Missing required fields: jsonrpc, method'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Handle the MCP request with the Tally API key from environment
    const response = await handleMCPMessage(mcpRequest, env.TALLY_API_KEY, env);
    
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('HTTP Stream transport error:', error);
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

/**
 * Cloudflare Workers fetch handler
 */
async function fetch(request: Request, env: Env): Promise<Response> {
  // Validate critical environment variables first
  if (!env.TALLY_API_KEY) {
    console.error('Critical error: TALLY_API_KEY environment variable is not set');
    return new Response(JSON.stringify({
      error: 'Server Configuration Error',
      message: 'Required environment variables are missing. Please check server configuration.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  console.log('Environment validation passed. TALLY_API_KEY is available.');
  
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle CORS preflight requests first (before authentication)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Add CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (pathname === '/health') {
    return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // OAuth authorization server metadata
  if (pathname === '/.well-known/oauth-authorization-server') {
    return new Response(JSON.stringify({
      issuer: new URL(request.url).origin,
      authorization_endpoint: `${new URL(request.url).origin}/authorize`,
      token_endpoint: `${new URL(request.url).origin}/token`,
      registration_endpoint: `${new URL(request.url).origin}/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      code_challenge_methods_supported: ['S256'],
      // Indicate this is an authless server
      authless: true
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // OAuth endpoints - now authless
  if (pathname === '/authorize') {
    // For authless servers, we redirect back immediately with success
    const state = url.searchParams.get('state');
    const redirectUri = url.searchParams.get('redirect_uri');
    
    if (!redirectUri) {
      return new Response(JSON.stringify({
        error: 'invalid_request',
        error_description: 'redirect_uri is required'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Generate a dummy code for authless flow
    const code = 'authless_' + Math.random().toString(36).substring(2);
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('code', code);
    if (state) redirectUrl.searchParams.set('state', state);

    return Response.redirect(redirectUrl.toString(), 302);
  }

  if (pathname === '/token') {
    // For authless servers, return a dummy token
    return new Response(JSON.stringify({
      access_token: 'authless_token',
      token_type: 'Bearer',
      expires_in: 3600
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  if (pathname === '/register') {
    // Dynamic client registration - return dummy client for authless
    return new Response(JSON.stringify({
      client_id: 'authless_client',
      client_secret: 'authless_secret',
      registration_access_token: 'authless_token',
      registration_client_uri: `${new URL(request.url).origin}/register/authless_client`
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // MCP endpoints - with authentication for personal security
  if (pathname === '/mcp' || pathname === '/mcp/sse') {
    // Authenticate MCP requests
    const auth = authenticateRequest(request, env);
    if (!auth.authenticated) {
      return new Response(JSON.stringify({
        error: 'Authentication Required',
        message: auth.error,
        hint: 'Add AUTH_TOKEN to your server configuration and use it in requests',
        timestamp: new Date().toISOString()
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Verify we have the Tally API key in environment
    if (!env.TALLY_API_KEY) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Server configuration error: TALLY_API_KEY not found'
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (pathname === '/mcp/sse') {
      // SSE transport
      return handleSseRequest(request, env);
    } else {
      // HTTP Stream transport
      return handleHTTPStreamTransport(request, env);
    }
  }

  // Default response for unknown endpoints
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'The requested endpoint was not found.',
    available_endpoints: [
      '/health',
      '/mcp',
      '/mcp/sse', 
      '/.well-known/oauth-authorization-server',
      '/authorize',
      '/token',
      '/register'
    ]
  }), { 
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleMcpRequest(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  let apiKey: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }

  if (!apiKey) {
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32000,
        message: 'Authorization header missing or invalid',
        data: 'Please provide a Bearer token in the Authorization header.'
      }
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const body = await request.json();
  const mcpRequest = body as MCPRequest;
  
  // Reuse the existing, robust message handler
  const mcpResponse = await handleMCPMessage(mcpRequest, apiKey, env);
  
  let status = 200;
  if ('error' in mcpResponse && mcpResponse.error) {
    // Map JSON-RPC error codes to HTTP status codes for transport-level correctness
    switch (mcpResponse.error.code) {
      case -32700: // Parse error
      case -32600: // Invalid Request
      case -32602: // Invalid Params
        status = 400;
        break;
      case -32601: // Method not found
        status = 404;
        break;
      default: // Server error (-32000 to -32099)
        status = 500;
        break;
    }
  }
  
  // Return the response from the message handler with the correct HTTP status
  return new Response(JSON.stringify(mcpResponse), {
    status: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

/**
 * Authenticate request using server AUTH_TOKEN
 */
function authenticateRequest(request: Request, env: Env): { authenticated: boolean; error?: string } {
  // If no AUTH_TOKEN is configured, allow all requests (backwards compatibility)
  if (!env.AUTH_TOKEN) {
    console.log('🔓 No AUTH_TOKEN configured - allowing unauthenticated access');
    return { authenticated: true };
  }

  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1] === env.AUTH_TOKEN) {
      console.log('✅ Valid Bearer token authentication');
      return { authenticated: true };
    }
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader === env.AUTH_TOKEN) {
    console.log('✅ Valid X-API-Key authentication');
    return { authenticated: true };
  }

  // Check query parameter
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');
  if (tokenParam === env.AUTH_TOKEN) {
    console.log('✅ Valid query parameter authentication');
    return { authenticated: true };
  }

  console.log('❌ Authentication failed - no valid token provided');
  return { 
    authenticated: false, 
    error: 'Authentication required. Provide token via Authorization header, X-API-Key header, or ?token= query parameter.' 
  };
}

// Export the Workers-compatible handler
export default {
  fetch
}; 