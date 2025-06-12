# Tally MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with secure access to Tally form management capabilities.

## 🚀 Quick Start

### Option 1: Claude.ai Integration (Recommended)

Use the battle-tested [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) package:

**Claude Desktop Configuration** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tally-remote": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://tally-mcp.focuslab.workers.dev/mcp",
        "--header",
        "Authorization: Bearer YOUR_AUTH_TOKEN"
      ]
    }
  }
}
```

Replace `YOUR_AUTH_TOKEN` with your personal server authentication token.

### Option 2: Direct Integration (Cursor, etc.)

For clients that support custom headers:

```json
{
  "mcpServers": {
    "tally": {
      "url": "https://tally-mcp.focuslab.workers.dev/mcp",
      "transport": "http-stream",
      "headers": {
        "Authorization": "Bearer YOUR_AUTH_TOKEN"
      }
    }
  }
}
```

### Option 3: Local Proxy (Alternative)

If you prefer a custom solution:

1. **Start the local proxy**:
   ```bash
   npm run proxy
   ```

2. **Configure Claude.ai**:
   - Server URL: `http://localhost:3001/mcp`
   - Transport: `http-stream`
   - Authentication: None

## 🔧 Configuration

The server uses your personal authentication token to securely access your Tally data.

**Required Environment Variables**:
- `TALLY_API_KEY`: Your Tally API key (configured in Cloudflare Workers)
- `AUTH_TOKEN`: Server authentication token (configured in Cloudflare Workers)

## 🛡️ Security

- ✅ **Server-level authentication**: Only authorized users can access your data
- ✅ **Secure bridge**: mcp-remote handles authentication transparently
- ✅ **Encrypted transport**: All communications use HTTPS
- ✅ **Token-based auth**: Industry standard Bearer token approach

## 🛠️ Available Tools

- **create_form**: Create new Tally forms with custom fields
- **modify_form**: Update existing form configurations  
- **get_form**: Retrieve detailed form information
- **list_forms**: Browse all your forms
- **delete_form**: Remove forms you no longer need
- **get_submissions**: Access form submission data
- **analyze_submissions**: Get insights from form responses
- **share_form**: Generate sharing links and embed codes
- **manage_workspace**: Handle workspace settings
- **manage_team**: Team member and permission management

## 📱 Multi-Client Support

**Supported MCP Clients**:
- ✅ **Claude.ai** (via mcp-remote)
- ✅ **Cursor** (direct authenticated or via mcp-remote)
- ✅ **Windsurf** (via mcp-remote)
- ✅ **Any MCP client** supporting HTTP Stream transport

## 🔄 Development

### Local Development
```bash
npm install
npm run dev
```

### Testing
```bash
npm test
npm run test:coverage
```

### Deployment
```bash
npm run build:worker
npx wrangler deploy
```

## 📚 Documentation

- **MCP Protocol**: [Model Context Protocol](https://spec.modelcontextprotocol.io/)
- **Tally API**: [Tally Developer Documentation](https://developers.tally.so/)
- **Cloudflare Workers**: [Workers Documentation](https://developers.cloudflare.com/workers/)
- **mcp-remote**: [NPM Package](https://www.npmjs.com/package/mcp-remote)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details. 