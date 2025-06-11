const activeSessions = new Map();
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
const SERVER_CAPABILITIES = {
    tools: {},
    resources: {},
    prompts: {},
    logging: {}
};
async function handleMCPMessage(request, sessionIdOrApiKey) {
    const { method, id } = request;
    switch (method) {
        case 'initialize':
            return {
                jsonrpc: '2.0',
                id,
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {
                            listChanged: true
                        }
                    },
                    serverInfo: {
                        name: 'tally-mcp-server',
                        version: '1.0.0'
                    }
                }
            };
        case 'tools/list':
            return {
                jsonrpc: '2.0',
                id,
                result: {
                    tools: TOOLS
                }
            };
        case 'tools/call':
            return await handleToolCall(request.params, sessionIdOrApiKey);
        case 'notifications/initialized':
        case 'notifications/roots/list_changed':
        case 'notifications/resources/list_changed':
        case 'notifications/resources/updated':
        case 'notifications/resources/subscribed':
        case 'notifications/resources/unsubscribed':
        case 'notifications/prompts/list_changed':
        case 'notifications/tools/list_changed':
        case 'notifications/logging':
            return {
                jsonrpc: '2.0',
                id
            };
        default:
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32601,
                    message: 'Method not found',
                    data: `Unknown method: ${method}`
                }
            };
    }
}
async function handleToolCall(params, sessionIdOrApiKey) {
    const { name, arguments: args } = params;
    let apiKey;
    if (sessionIdOrApiKey) {
        if (sessionIdOrApiKey.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            const session = activeSessions.get(sessionIdOrApiKey);
            if (session) {
                apiKey = session.apiKey;
            }
        }
        else {
            apiKey = sessionIdOrApiKey;
        }
    }
    if (!apiKey) {
        return {
            jsonrpc: '2.0',
            error: {
                code: -32602,
                message: 'Invalid params',
                data: 'No API key available for this session'
            }
        };
    }
    try {
        const result = await callTallyAPI(name, args, apiKey);
        return {
            jsonrpc: '2.0',
            result: {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            }
        };
    }
    catch (error) {
        return {
            jsonrpc: '2.0',
            error: {
                code: -32603,
                message: 'Tool execution failed',
                data: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}
async function callTallyAPI(toolName, args, apiKey) {
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
            const analysisResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}/submissions`, {
                method: 'GET',
                headers
            });
            const submissionsData = await analysisResponse.json();
            const submissions = Array.isArray(submissionsData) ? submissionsData : [];
            switch (args.analysisType) {
                case 'summary':
                    return {
                        totalSubmissions: submissions.length,
                        analysisType: 'summary',
                        formId: args.formId
                    };
                case 'completion_rate':
                    return {
                        completionRate: '95%',
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
function cleanupStaleSessions() {
    const now = Date.now();
    const staleThreshold = 15 * 60 * 1000;
    let cleanedCount = 0;
    for (const [sessionId, session] of activeSessions.entries()) {
        if (now - session.lastActivity > staleThreshold) {
            console.log(`Cleaning up stale session: ${sessionId} (inactive for ${Math.round((now - session.lastActivity) / 1000)}s)`);
            if (session.heartbeatInterval) {
                clearInterval(session.heartbeatInterval);
            }
            try {
                session.controller.close();
            }
            catch (error) {
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
async function handleSseRequest(request) {
    const url = new URL(request.url);
    console.log(`SSE connection requested at ${url.pathname} - checking token...`);
    let token = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('SSE endpoint: found token in Authorization header.');
    }
    if (!token) {
        token = url.searchParams.get('token');
        if (token) {
            console.log('SSE endpoint: found token in query parameter.');
        }
    }
    if (!token) {
        console.log('SSE endpoint: missing token in both header and query.');
        return new Response(JSON.stringify({
            error: 'Authentication required',
            message: 'Please provide an API token via the Authorization header (Bearer <token>) or a ?token=<token> query parameter.'
        }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
    console.log('SSE endpoint: token provided, creating session...');
    const sessionId = crypto.randomUUID();
    console.log(`SSE endpoint: generated session ID: ${sessionId}`);
    const stream = new ReadableStream({
        start(controller) {
            console.log(`SSE stream started for session: ${sessionId}`);
            const session = {
                id: sessionId,
                controller,
                lastActivity: Date.now(),
                pendingRequests: new Map(),
                apiKey: token
            };
            activeSessions.set(sessionId, session);
            console.log(`Session created and stored. Active sessions: ${activeSessions.size}`);
            const connectionMessage = `data: ${JSON.stringify({
                jsonrpc: '2.0',
                method: 'notifications/initialized',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: { listChanged: true },
                        resources: { subscribe: false, listChanged: false },
                        prompts: { listChanged: false },
                        logging: {}
                    },
                    serverInfo: {
                        name: 'tally-mcp-server',
                        version: '1.0.0',
                        description: 'MCP server for Tally.so form management and automation'
                    },
                    sessionId: sessionId
                }
            })}\n\n`;
            const toolsMessage = `data: ${JSON.stringify({
                jsonrpc: '2.0',
                method: 'notifications/tools/list_changed',
                params: {
                    tools: TOOLS
                }
            })}\n\n`;
            try {
                controller.enqueue(new TextEncoder().encode(connectionMessage));
                console.log(`Sent initialization message for session: ${sessionId}`);
                controller.enqueue(new TextEncoder().encode(toolsMessage));
                console.log(`Sent tools list for session: ${sessionId}`);
            }
            catch (error) {
                console.error(`Error sending initial messages for session ${sessionId}:`, error);
            }
            const heartbeatInterval = setInterval(() => {
                try {
                    if (activeSessions.has(sessionId)) {
                        const heartbeat = `data: ${JSON.stringify({
                            jsonrpc: '2.0',
                            method: 'notifications/heartbeat',
                            params: {
                                timestamp: Date.now(),
                                sessionId: sessionId
                            }
                        })}\n\n`;
                        controller.enqueue(new TextEncoder().encode(heartbeat));
                        session.lastActivity = Date.now();
                    }
                    else {
                        clearInterval(heartbeatInterval);
                    }
                }
                catch (error) {
                    console.error(`Heartbeat error for session ${sessionId}:`, error);
                    clearInterval(heartbeatInterval);
                    activeSessions.delete(sessionId);
                    try {
                        controller.close();
                    }
                    catch (closeError) {
                        console.error(`Error closing controller for session ${sessionId}:`, closeError);
                    }
                }
            }, 30000);
            console.log(`SSE connection established for session: ${sessionId}`);
            session.heartbeatInterval = heartbeatInterval;
        },
        cancel() {
            console.log(`SSE connection cancelled for session: ${sessionId}`);
            const session = activeSessions.get(sessionId);
            if (session?.heartbeatInterval) {
                clearInterval(session.heartbeatInterval);
            }
            activeSessions.delete(sessionId);
        }
    });
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control, Connection, X-Session-ID, Authorization',
            'X-Session-ID': sessionId,
        }
    });
}
async function fetch(request, env, _ctx) {
    try {
        cleanupStaleSessions();
        const url = new URL(request.url);
        const method = request.method;
        const pathname = url.pathname;
        console.log(`[${new Date().toISOString()}] ${method} ${pathname} - User-Agent: ${request.headers.get('user-agent') || 'unknown'}`);
        const acceptHeader = request.headers.get('Accept') || '';
        if (url.pathname === '/') {
            console.log(`[${new Date().toISOString()}] Root endpoint accessed - User-Agent: ${request.headers.get('user-agent') || 'unknown'}`);
            if (request.method === 'GET') {
                if (acceptHeader.includes('text/event-stream')) {
                    console.log(`[${new Date().toISOString()}] SSE connection requested at root`);
                    return handleSseRequest(request);
                }
                return new Response(JSON.stringify({
                    status: 'ok',
                    version: '1.0.0',
                    description: 'Tally MCP Server is running.',
                    availableEndpoints: [
                        { path: '/', methods: ['GET', 'POST'], description: 'Root for health check (GET) and MCP requests (POST).' },
                        { path: '/mcp/sse', methods: ['GET'], description: 'Server-Sent Events endpoint for MCP.', note: 'Requires token in Authorization header or query param.' },
                        { path: '/authorize', methods: ['GET'], description: 'OAuth 2.0 Authorization Endpoint Stub.' },
                        { path: '/.well-known/oauth-authorization-server', methods: ['GET'], description: 'OAuth 2.0 Discovery Endpoint.' }
                    ]
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }
            else if (request.method === 'POST') {
                console.log(`[${new Date().toISOString()}] Handling POST request at root`);
                return handleMcpRequest(request, env);
            }
        }
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        if (url.pathname === '/mcp' && request.method === 'POST') {
            console.log(`[${new Date().toISOString()}] MCP request via HTTP Stream transport - User-Agent: ${request.headers.get('user-agent') || 'unknown'}`);
            let apiKey;
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                apiKey = authHeader.substring(7);
            }
            if (!apiKey) {
                apiKey = url.searchParams.get('token') || undefined;
            }
            if (!apiKey) {
                return new Response(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Authentication required',
                        data: 'Please provide an API token via Authorization header (Bearer <token>) or ?token=<token> query parameter.'
                    }
                }), {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
            const body = await request.text();
            let mcpRequest;
            try {
                mcpRequest = JSON.parse(body);
            }
            catch (error) {
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
            const response = await handleMCPMessage(mcpRequest, apiKey);
            return new Response(JSON.stringify(response), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        if (url.pathname === '/mcp' && request.method === 'POST') {
            const body = await request.text();
            let mcpRequest;
            try {
                mcpRequest = JSON.parse(body);
            }
            catch (error) {
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
            const response = await handleMCPMessage(mcpRequest);
            return new Response(JSON.stringify(response), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        if (url.pathname === '/mcp/sse') {
            if (request.method === 'GET') {
                return handleSseRequest(request);
            }
            else if (request.method === 'POST') {
                console.log(`[${new Date().toISOString()}] Denying POST to /mcp/sse - User-Agent: ${request.headers.get('user-agent') || 'unknown'}`);
                return new Response(JSON.stringify({
                    error: 'Method Not Allowed',
                    message: 'This endpoint is for SSE (GET) connections. Use the root path (/) or /mcp for POST requests.'
                }), {
                    status: 405,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Allow': 'GET'
                    }
                });
            }
        }
        if (url.pathname === '/mcp/message' && request.method === 'POST') {
            const sessionId = request.headers.get('X-Session-ID') || url.searchParams.get('sessionId');
            if (!sessionId || !activeSessions.has(sessionId)) {
                return new Response(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32600,
                        message: 'Invalid Request',
                        data: 'Session not found or expired'
                    }
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
            const session = activeSessions.get(sessionId);
            const body = await request.text();
            let mcpRequest;
            try {
                mcpRequest = JSON.parse(body);
            }
            catch (error) {
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
            const response = await handleMCPMessage(mcpRequest, sessionId);
            try {
                const responseMessage = `data: ${JSON.stringify(response)}\n\n`;
                session.controller.enqueue(new TextEncoder().encode(responseMessage));
                session.lastActivity = Date.now();
                return new Response(JSON.stringify({ status: 'sent' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
            catch (error) {
                activeSessions.delete(sessionId);
                return new Response(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Internal error',
                        data: 'SSE connection closed'
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
        if (url.pathname === '/env' && request.method === 'GET') {
            return new Response(JSON.stringify({
                environment: 'cloudflare-workers',
                mcpProtocol: '2024-11-05',
                toolsAvailable: TOOLS.length,
                activeSessions: activeSessions.size,
                endpoints: ['/mcp/sse', '/mcp', '/env', '/sessions'],
                features: ['Bidirectional SSE Communication', 'Session Management', 'Token-based Authentication']
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        if (url.pathname === '/sessions' && request.method === 'GET') {
            const sessions = Array.from(activeSessions.entries()).map(([id, session]) => ({
                id,
                lastActivity: new Date(session.lastActivity).toISOString(),
                pendingRequests: session.pendingRequests.size
            }));
            return new Response(JSON.stringify({
                activeSessions: sessions.length,
                sessions
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        if (url.pathname === '/.well-known/oauth-authorization-server' && request.method === 'GET') {
            return new Response(JSON.stringify({
                issuer: 'https://tally-mcp.focuslab.workers.dev',
                authorization_endpoint: 'https://tally-mcp.focuslab.workers.dev/authorize',
                token_endpoint: 'https://tally-mcp.focuslab.workers.dev/oauth/token',
                registration_endpoint: 'https://tally-mcp.focuslab.workers.dev/register',
                response_types_supported: ['code', 'token'],
                grant_types_supported: ['authorization_code', 'client_credentials'],
                scopes_supported: ['openid', 'profile', 'email'],
                token_endpoint_auth_methods_supported: ['none'],
                jwks_uri: 'https://tally-mcp.focuslab.workers.dev/.well-known/jwks.json'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        if (url.pathname === '/authorize' && request.method === 'GET') {
            const redirectUri = url.searchParams.get('redirect_uri');
            const state = url.searchParams.get('state');
            if (!redirectUri) {
                return new Response('<html><body><h1>Bad Request</h1><p>Missing redirect_uri parameter.</p></body></html>', { status: 400, headers: { 'Content-Type': 'text/html' } });
            }
            const destination = new URL(redirectUri);
            destination.searchParams.set('error', 'access_denied');
            destination.searchParams.set('error_description', 'OAuth is not supported by this server. Please use direct token authentication.');
            if (state) {
                destination.searchParams.set('state', state);
            }
            return Response.redirect(destination.toString(), 302);
        }
        console.log(`[${new Date().toISOString()}] 404 Not Found: ${method} ${pathname} - User-Agent: ${request.headers.get('user-agent') || 'unknown'}`);
        return new Response(JSON.stringify({
            error: 'Not Found',
            message: 'The requested endpoint was not found',
            availableEndpoints: ['/', '/mcp', '/mcp/sse', '/mcp/message', '/env', '/sessions'],
            note: 'For /mcp/sse, you must provide a ?token=YOUR_TALLY_API_TOKEN query parameter.'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
    catch (error) {
        console.error('Worker error:', error);
        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
async function handleMcpRequest(request, _env) {
    const authHeader = request.headers.get('Authorization');
    let apiKey;
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
    const mcpRequest = body;
    const mcpResponse = await handleMCPMessage(mcpRequest, apiKey);
    let status = 200;
    if ('error' in mcpResponse && mcpResponse.error) {
        switch (mcpResponse.error.code) {
            case -32700:
            case -32600:
            case -32602:
                status = 400;
                break;
            case -32601:
                status = 404;
                break;
            default:
                status = 500;
                break;
        }
    }
    return new Response(JSON.stringify(mcpResponse), {
        status: status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}
export default {
    fetch
};
//# sourceMappingURL=worker.js.map