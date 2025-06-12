# Tally MCP Proxy Server

The proxy server provides an alternative way to integrate your authenticated Tally MCP server with Claude.ai and other MCP clients that don't support custom authentication headers.

## How It Works

```
Claude.ai → Local Proxy (localhost:3001) → Your Authenticated Server (https://your-worker.workers.dev/mcp)
```

The proxy:
- ✅ Accepts unauthenticated connections from Claude.ai
- ✅ Adds your authentication token automatically  
- ✅ Forwards all requests to your remote server
- ✅ Handles both HTTP and Server-Sent Events (SSE)
- ✅ Keeps your credentials local and secure

## Quick Setup

### 1. Configure Environment Variables

Create a `.env` file or set environment variables:

```bash
# Required: Your remote server URL
REMOTE_SERVER=https://your-tally-mcp.workers.dev/mcp

# Required: Your authentication token
AUTH_TOKEN=your_auth_token_here

# Optional: Proxy port (default: 3001)
PROXY_PORT=3001
```

### 2. Start the Proxy

```bash
# Using npm script
npm run proxy

# Or directly with node
node proxy-server.js

# For development with auto-restart
npm run proxy:dev
```

### 3. Configure Claude.ai

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "tally-proxy": {
      "url": "http://localhost:3001",
      "transport": "http-stream"
    }
  }
}
```

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROXY_PORT` | `3001` | Port for the proxy server |
| `REMOTE_SERVER` | `https://tally-mcp.focuslab.workers.dev/mcp` | Your deployed server URL |
| `AUTH_TOKEN` | - | Your server authentication token |
| `TALLY_AUTH_TOKEN` | - | Alternative variable name for auth token |
| `TALLY_API_KEY` | - | Falls back to this if AUTH_TOKEN not set |

### Command Line Usage

```bash
# Basic usage
npm run proxy

# Custom port
PROXY_PORT=8080 npm run proxy

# Custom server
REMOTE_SERVER=https://my-server.workers.dev/mcp npm run proxy

# All options
PROXY_PORT=8080 REMOTE_SERVER=https://my-server.workers.dev/mcp AUTH_TOKEN=my-token npm run proxy
```

## Troubleshooting

### Common Issues

**❌ "No authentication token found"**
```bash
# Solution: Set your authentication token
export AUTH_TOKEN=your_token_here
npm run proxy
```

**❌ "Connection refused" or proxy errors**
- Verify your `REMOTE_SERVER` URL is correct
- Check that your deployed server is running
- Ensure your `AUTH_TOKEN` is valid

**❌ Claude.ai can't connect**
- Verify the proxy is running on the correct port
- Check Claude Desktop configuration points to `http://localhost:3001`
- Restart Claude Desktop after configuration changes

### Debug Mode

Run with additional logging:

```bash
# Enable detailed request logging
DEBUG=* npm run proxy

# Or check proxy logs in the console
npm run proxy
# You should see: 📡 GET /tools/list, etc.
```

## Security Considerations

### ✅ Secure Practices

- **Local authentication**: Your tokens never leave your machine
- **HTTPS upstream**: All communication to your server is encrypted  
- **No persistent storage**: Proxy doesn't store any credentials
- **Process isolation**: Proxy runs in its own process

### ⚠️ Security Notes

- The proxy runs on `localhost` and is only accessible from your machine
- Always use HTTPS for your remote server URL
- Don't share your `AUTH_TOKEN` or commit it to version control
- Consider rotating your tokens periodically

## When to Use the Proxy

**✅ Use the proxy when:**
- Claude.ai is your primary MCP client
- You want maximum control over authentication
- You prefer running services locally
- You need to debug MCP communications

**❌ Consider alternatives when:**
- You only use clients with built-in auth support (like Cursor)
- You prefer zero-maintenance solutions
- You want to minimize local dependencies

## Alternative: mcp-remote

For a zero-maintenance solution, consider using [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) instead:

```json
{
  "mcpServers": {
    "tally-remote": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-server.workers.dev/mcp", "--header", "Authorization: Bearer YOUR_TOKEN"]
    }
  }
}
```

## Technical Details

### HTTP Handling
- Forwards all HTTP methods (GET, POST, OPTIONS, etc.)
- Preserves request/response headers
- Adds authentication headers automatically
- Handles CORS for browser-based clients

### SSE (Server-Sent Events) Support
- Maintains persistent connections for real-time updates
- Forwards all SSE events transparently
- Handles connection cleanup on client disconnect
- Preserves event data and formatting

### Error Handling
- Graceful handling of network errors
- Proper HTTP status code forwarding
- JSON error responses for debugging
- Connection retry logic for SSE streams 