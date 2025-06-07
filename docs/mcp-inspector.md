# MCP Inspector Integration

This document explains how to use the MCP Inspector with the Tally MCP Server for debugging and testing.

## What is MCP Inspector?

The MCP Inspector is an official debugging tool maintained by the Model Context Protocol team. It provides an interactive web interface for testing and debugging MCP servers, allowing you to:

- 🔍 **Inspect Tools**: View available tools, test them with custom inputs, and see execution results
- 📄 **Browse Resources**: Explore resources, view metadata, and test content retrieval
- 💬 **Test Prompts**: Try prompt templates with different arguments and preview generated messages
- 📊 **Monitor Activity**: View logs, notifications, and real-time server activity
- 🔧 **Debug Issues**: Test edge cases, error handling, and connection problems

## Architecture

The MCP Inspector consists of two components:

1. **MCP Inspector Client (MCPI)**: React-based web UI (default port 6274)
2. **MCP Proxy (MCPP)**: Node.js bridge server (default port 6277)

The proxy acts as both an MCP client (connecting to your server) and an HTTP server (serving the web UI).

## Quick Start

### 1. Basic Usage

To start the Inspector with the Tally MCP server:

```bash
# Build the project first
npm run build

# Start Inspector with built server
npm run inspector
```

This will:
- Start the MCP Inspector Client UI at `http://localhost:6274`
- Start the MCP Proxy server on port 6277
- Connect to your Tally MCP server via stdio transport

### 2. Development Mode

For active development with hot reloading:

```bash
# Start Inspector with TypeScript source (no build required)
npm run inspector:dev
```

### 3. Test Connection

To verify Inspector connectivity:

```bash
# Run automated connectivity test
npm run inspector:test
```

## Configuration

### Environment Variables

Configure Inspector behavior via environment variables in your `.env` file:

```bash
# Inspector Client UI port (default: 6274)
CLIENT_PORT=6274

# Inspector Proxy server port (default: 6277)
SERVER_PORT=6277

# Auto-open browser when starting (default: true)
MCP_AUTO_OPEN_ENABLED=true

# Request timeout for MCP server calls (ms)
MCP_SERVER_REQUEST_TIMEOUT=10000

# Reset timeout on progress notifications
MCP_REQUEST_TIMEOUT_RESET_ON_PROGRESS=true

# Maximum total timeout for requests (ms)
MCP_REQUEST_MAX_TOTAL_TIMEOUT=60000

# Custom proxy address (if needed)
MCP_PROXY_FULL_ADDRESS=http://10.1.1.22:5577
```

### Custom Ports

If you need to use different ports:

```bash
# Start with custom ports
CLIENT_PORT=8080 SERVER_PORT=9000 npm run inspector
```

### Configuration Files

Create reusable configurations for different scenarios:

```json
{
  "mcpServers": {
    "tally-dev": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "DEBUG": "true",
        "LOG_LEVEL": "debug"
      }
    },
    "tally-prod": {
      "command": "node", 
      "args": ["dist/index.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Use with:
```bash
npx @modelcontextprotocol/inspector --config config.json --server tally-dev
```

## Usage Guide

### 1. Server Connection

When you open the Inspector UI:

1. **Check Connection Status**: Green indicator shows successful connection
2. **Verify Capabilities**: Review server capabilities in the connection pane
3. **View Metadata**: Check server version, name, and other metadata

### 2. Testing Tools

Navigate to the **Tools** tab to:

1. **Browse Available Tools**: See all registered Tally tools
2. **View Tool Schemas**: Examine input parameters and descriptions
3. **Test Tool Execution**: 
   - Select a tool (e.g., "create_form")
   - Enter test inputs in JSON format
   - Execute and view results
4. **Test Error Scenarios**: Try invalid inputs to test error handling

Example tool test:
```json
{
  "description": "Create a contact form with name, email, and message fields",
  "title": "Contact Us",
  "options": {
    "theme": "modern",
    "collectEmail": true
  }
}
```

### 3. Inspecting Resources

Use the **Resources** tab to:

1. **Browse Resources**: View all available form templates and data
2. **Check Metadata**: See MIME types, descriptions, and URIs
3. **Test Content Retrieval**: Fetch and view resource content
4. **Test Subscriptions**: Monitor resource changes (if supported)

### 4. Testing Prompts

In the **Prompts** tab:

1. **View Prompt Templates**: See available prompt templates
2. **Test with Arguments**: Provide different argument combinations
3. **Preview Messages**: See generated prompt messages
4. **Test Edge Cases**: Try missing or invalid arguments

### 5. Monitoring Activity

The **Notifications** pane shows:

1. **Server Logs**: Real-time logging output
2. **Error Messages**: Detailed error information
3. **Performance Metrics**: Request timing and resource usage
4. **Connection Events**: Connect/disconnect notifications

## Development Workflow

### 1. Initial Setup

```bash
# 1. Start development session
npm run inspector:dev

# 2. Open browser to http://localhost:6274

# 3. Verify connection and basic functionality
```

### 2. Iterative Development

```bash
# 1. Make changes to server code
# 2. The Inspector will automatically reconnect
# 3. Test changes in the UI
# 4. Monitor logs for issues
# 5. Repeat
```

### 3. Testing Workflow

1. **Unit Testing**: Test individual tools and functions
2. **Integration Testing**: Use Inspector to test complete workflows
3. **Error Testing**: Deliberately trigger errors to test handling
4. **Performance Testing**: Monitor response times and resource usage

## Troubleshooting

### Common Issues

#### Inspector Won't Start
```bash
# Check if ports are available
lsof -i :6274
lsof -i :6277

# Try different ports
CLIENT_PORT=8080 SERVER_PORT=9000 npm run inspector
```

#### Connection Failed
```bash
# Check server logs
npm run inspector:dev

# Verify server starts correctly
npm run build && node dist/index.js

# Test basic connectivity
npm run inspector:test
```

#### Tools Not Showing
1. Verify tools are properly registered in server
2. Check server logs for initialization errors
3. Confirm MCP tool interfaces are implemented correctly

#### Performance Issues
1. Check MCP timeout settings
2. Monitor memory usage
3. Review request/response sizes
4. Consider enabling request compression

### Debug Mode

Enable detailed debugging:

```bash
# Enable debug mode for both server and inspector
DEBUG=true MCP_SERVER_REQUEST_TIMEOUT=30000 npm run inspector:dev
```

### Logs Analysis

Key log patterns to watch for:

- ✅ `Inspector started successfully`
- ✅ `Inspector connected to MCP server`
- ❌ `Connection failed`
- ❌ `Request timeout`
- ⚠️ `Tool execution error`

## Advanced Usage

### CLI Mode

For automation and scripting:

```bash
# List available tools
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/list

# Call a specific tool
npx @modelcontextprotocol/inspector --cli node dist/index.js \
  --method tools/call \
  --tool-name create_form \
  --tool-arg description="Test form" \
  --tool-arg title="Test"

# List resources
npx @modelcontextprotocol/inspector --cli node dist/index.js --method resources/list
```

### Remote Debugging

Connect to remote servers:

```bash
# Connect to remote SSE endpoint
npx @modelcontextprotocol/inspector https://your-server.com/mcp

# Use with custom authentication
npx @modelcontextprotocol/inspector https://your-server.com/mcp \
  --header "Authorization: Bearer your-token"
```

### Performance Monitoring

Use Inspector to monitor:

- Request/response times
- Memory usage patterns
- Error rates
- Connection stability
- Tool execution performance

## Best Practices

### Development
1. **Always test with Inspector** before deploying changes
2. **Use structured logging** for better debugging
3. **Test error scenarios** regularly
4. **Monitor performance** during development

### Production Debugging
1. **Never expose Inspector** to production traffic
2. **Use configuration files** for consistent setups
3. **Enable only necessary logging** in production
4. **Test locally first** before remote debugging

### Security
1. **Protect sensitive data** in logs
2. **Use environment variables** for configuration
3. **Limit Inspector access** to development networks
4. **Sanitize inputs** when testing

## Integration with CI/CD

Add Inspector tests to your pipeline:

```yaml
# .github/workflows/test.yml
- name: Test MCP Inspector Connectivity
  run: npm run inspector:test
```

This ensures your MCP server maintains compatibility with debugging tools.

## Resources

- [Official MCP Inspector Documentation](https://modelcontextprotocol.io/docs/tools/inspector)
- [MCP Inspector GitHub Repository](https://github.com/modelcontextprotocol/inspector)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/docs/)
- [MCP Debugging Guide](https://modelcontextprotocol.io/docs/tools/debugging) 