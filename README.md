# Tally MCP Server

A Model Context Protocol (MCP) server that provides tools for managing Tally.so forms through natural language commands. This server enables AI assistants to create, modify, analyze, and manage Tally forms seamlessly.

## 🚀 Quick Start

### For Claude Desktop

Add this to your Claude Desktop MCP configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "tally-mcp": {
      "command": "npx",
      "args": ["-y", "tally-mcp-server"],
      "env": {
        "TALLY_API_TOKEN": "your_tally_api_token_here"
      }
    }
  }
}
```

### For Cursor

Add this to your Cursor MCP configuration (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "tally-mcp": {
      "command": "npx",
      "args": ["-y", "tally-mcp-server"],
      "env": {
        "TALLY_API_TOKEN": "your_tally_api_token_here"
      }
    }
  }
}
```

### Using the Deployed Cloudflare Workers Version

For both Claude Desktop and Cursor, you can also use the deployed version:

**Claude Desktop Configuration:**
```json
{
  "mcpServers": {
    "tally-mcp": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"],
      "env": {
        "MCP_SERVER_URL": "https://tally-mcp.focuslab.workers.dev/mcp/sse?token=your_tally_api_token"
      }
    }
  }
}
```

**Cursor Configuration:**
```json
{
  "mcpServers": {
    "tally-mcp": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"],
      "env": {
        "MCP_SERVER_URL": "https://tally-mcp.focuslab.workers.dev/mcp/sse?token=your_tally_api_token"
      }
    }
  }
}
```

## 🔧 Debugging Connection Issues

### Cloudflare Workers Deployment

The server is deployed at: `https://tally-mcp.focuslab.workers.dev`

**Test the deployment:**
```bash
# Health check
curl https://tally-mcp.focuslab.workers.dev/

# Test SSE endpoint
curl -H "Accept: text/event-stream" "https://tally-mcp.focuslab.workers.dev/mcp/sse?token=your_token" --max-time 30

# Check active sessions
curl https://tally-mcp.focuslab.workers.dev/sessions

# Environment info
curl https://tally-mcp.focuslab.workers.dev/env
```

### Common Issues and Solutions

#### 1. Cursor Not Connecting (No Server Logs)

**Symptoms:** Cursor shows connection errors but no logs appear in Cloudflare Workers.

**Solutions:**
1. **Check Cursor MCP Configuration Location:**
   ```bash
   # macOS
   ls -la ~/.cursor/mcp.json
   
   # Windows
   dir %USERPROFILE%\.cursor\mcp.json
   
   # Linux
   ls -la ~/.cursor/mcp.json
   ```

2. **Verify Configuration Format:**
   ```json
   {
     "mcpServers": {
       "tally-mcp": {
         "command": "npx",
         "args": ["-y", "tally-mcp-server"],
         "env": {
           "TALLY_API_TOKEN": "your_actual_token_here"
         }
       }
     }
   }
   ```

3. **Restart Cursor Completely:**
   - Close all Cursor windows
   - Kill any remaining Cursor processes
   - Restart Cursor

4. **Check Cursor Logs:**
   ```bash
   # macOS
   tail -f ~/Library/Logs/Cursor/main.log
   
   # Windows
   type %USERPROFILE%\AppData\Roaming\Cursor\logs\main.log
   ```

#### 2. Claude Desktop Connection Timeout

**Symptoms:** Connection established but then canceled after ~10 seconds.

**Status:** ✅ **FIXED** - The timeout issue has been resolved in the latest deployment.

**Verification:**
```bash
# This should now work without premature cancellation
curl -H "Accept: text/event-stream" "https://tally-mcp.focuslab.workers.dev/mcp/sse?token=test" --max-time 30
```

#### 3. Authentication Issues

**Symptoms:** 401 errors or "Authentication required" messages.

**Solutions:**
1. **Verify Token Format:**
   - Tally API tokens should be obtained from your Tally account settings
   - Format: Usually starts with `tally_` or similar prefix

2. **Test Token Directly:**
   ```bash
   curl -H "Authorization: Bearer your_token" https://api.tally.so/forms
   ```

### Enhanced Logging

The server now includes comprehensive logging for debugging:

- ✅ Request logging with timestamps and user agents
- ✅ SSE connection lifecycle tracking
- ✅ Session creation and cleanup monitoring
- ✅ Heartbeat and error tracking
- ✅ Detailed error messages with context

**View logs in Cloudflare Workers:**
1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select `tally-mcp`
4. Click on "Logs" tab
5. Enable "Real-time logs"

## 📋 Available Tools

The server provides the following tools for managing Tally forms:

- `create_form` - Create a new Tally form with specified fields and configuration
- `modify_form` - Modify an existing Tally form
- `get_form` - Retrieve details of a specific Tally form
- `list_forms` - List all forms in the workspace
- `delete_form` - Delete a Tally form
- `get_submissions` - Retrieve submissions for a specific form
- `analyze_submissions` - Analyze form submissions and provide insights
- `share_form` - Generate sharing links and embed codes for a form
- `manage_workspace` - Manage workspace settings and information
- `manage_team` - Manage team members and permissions

## 🔗 API Endpoints

- `GET /` - Health check and server information
- `GET /mcp/sse?token=<your_token>` - SSE endpoint for MCP protocol
- `POST /mcp` - HTTP POST endpoint for MCP protocol
- `POST /mcp/message` - Message endpoint for SSE sessions
- `GET /sessions` - Debug endpoint showing active sessions
- `GET /env` - Environment and configuration information

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Or using wrangler directly
npx wrangler deploy
```

## 📝 License

MIT License - see LICENSE file for details. 