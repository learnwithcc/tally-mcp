# Tally MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with secure access to Tally form management capabilities.

## 🚀 Quick Start

### Option 1: Claude.ai Integration (Recommended) ⭐

Use the battle-tested [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) package for seamless Claude.ai integration:

**Claude Desktop Configuration** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tally-remote": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://YOUR-DEPLOYMENT.workers.dev/mcp",
        "--header",
        "Authorization: Bearer YOUR_AUTH_TOKEN"
      ],
      "env": {
        "AUTH_TOKEN": "YOUR_AUTH_TOKEN_HERE"
      }
    }
  }
}
```

**Configuration Variables:**
- `YOUR-DEPLOYMENT`: Replace with your Cloudflare Workers subdomain (e.g., `my-tally-mcp`)
- `YOUR_AUTH_TOKEN`: Replace with your personal server authentication token

### Option 2: Direct Integration (Cursor, etc.)

For clients that support custom headers:

```json
{
  "mcpServers": {
    "tally": {
      "url": "https://YOUR-DEPLOYMENT.workers.dev/mcp",
      "transport": "http-stream",
      "headers": {
        "Authorization": "Bearer YOUR_AUTH_TOKEN"
      }
    }
  }
}
```

### Option 3: Local Proxy (Alternative)

If you prefer to run a local proxy server that handles authentication:

1. **Start the local proxy**:
   ```bash
   # Set your environment variables
   export REMOTE_SERVER=https://YOUR-DEPLOYMENT.workers.dev/mcp
   export AUTH_TOKEN=YOUR_AUTH_TOKEN
   
   # Start proxy server
   npm run proxy
   ```

2. **Configure Claude.ai** with the local proxy:
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

**Proxy Benefits:**
- 🔐 Authentication handled locally
- 🚫 No credentials sent to Claude.ai
- 🛡️ Your tokens stay on your machine
- 🔄 Transparent request forwarding

## 🏗️ Self-Deployment

### 1. **Deploy Your Own Server**

**Prerequisites:**
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [Tally API key](https://developers.tally.so/)

**Setup Steps:**

1. **Clone and configure:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/tally-mcp.git
   cd tally-mcp
   npm install
   ```

2. **Configure deployment:**
   ```bash
   # Update wrangler.toml with your preferred subdomain
   # name = "your-tally-mcp"  # This becomes your-tally-mcp.workers.dev
   ```

3. **Set your secrets:**
   ```bash
   # Set your Tally API key
   echo "YOUR_TALLY_API_KEY" | npx wrangler secret put TALLY_API_KEY
   
   # Generate and set server auth token
   echo "your_unique_auth_token_$(date +%s)" | npx wrangler secret put AUTH_TOKEN
   ```

4. **Deploy:**
   ```bash
   npm run build:worker
   npx wrangler deploy
   ```

### 2. **Configure MCP Clients**

Use your deployed server URL in the configurations above, replacing:
- `YOUR-DEPLOYMENT` with your actual worker name
- `YOUR_AUTH_TOKEN` with the token you set in step 3

## 🔧 Configuration

The server requires these environment variables:

**In Cloudflare Workers (using wrangler secrets):**
- `TALLY_API_KEY`: Your [Tally API key](https://developers.tally.so/) 
- `AUTH_TOKEN`: Server authentication token (generate a unique value)

**Security Notes:**
- ✅ Never commit API keys to version control
- ✅ Use Cloudflare Workers secrets for sensitive data
- ✅ Generate unique AUTH_TOKEN for each deployment
- ✅ Rotate tokens periodically for enhanced security

## 🛡️ Security Architecture

Following [MCP security principles](https://spec.modelcontextprotocol.io/specification/2024-11-05/revisions/2024-11-05/):

- **🔐 Server-level authentication**: Only authorized users can access your data
- **🌉 Secure bridge**: mcp-remote handles authentication transparently  
- **🔒 Encrypted transport**: All communications use HTTPS
- **🎟️ Token-based auth**: Industry standard Bearer token approach
- **🛠️ Data anonymization**: No personal data exposed in public examples

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| **create_form** | Create new Tally forms with custom fields |
| **modify_form** | Update existing form configurations |
| **get_form** | Retrieve detailed form information |
| **list_forms** | Browse all your forms |
| **delete_form** | Remove forms you no longer need |
| **get_submissions** | Access form submission data |
| **analyze_submissions** | Get insights from form responses |
| **share_form** | Generate sharing links and embed codes |
| **manage_workspace** | Handle workspace settings |
| **manage_team** | Team member and permission management |

## 📱 Multi-Client Support

**Tested MCP Clients:**
- ✅ **Claude.ai** (via mcp-remote - recommended)
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

### Building & Deployment
```bash
npm run build:worker
npx wrangler deploy
```

## 🤔 Why mcp-remote?

According to the [Anthropic documentation](https://support.anthropic.com/en/articles/11503834-building-custom-integrations-via-remote-mcp-servers), Claude.ai requires either "authless" servers or OAuth with Dynamic Client Registration. Since this server uses Bearer token authentication for security, [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) acts as a perfect bridge:

**Benefits:**
- 🔄 **Transparent authentication**: Handles your tokens securely
- 📦 **Battle-tested**: 68,160+ weekly downloads
- 🎯 **Claude.ai compatible**: Works seamlessly with Claude's requirements
- 🚀 **Zero configuration**: Just add your URL and token

## 📚 Documentation

- **MCP Protocol**: [Model Context Protocol](https://spec.modelcontextprotocol.io/)
- **Tally API**: [Tally Developer Documentation](https://developers.tally.so/)
- **Cloudflare Workers**: [Workers Documentation](https://developers.cloudflare.com/workers/)
- **mcp-remote**: [NPM Package](https://www.npmjs.com/package/mcp-remote)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 🔒 Privacy & Security

This server follows data protection best practices:
- No personal data in public examples
- Secure token-based authentication
- HTTPS-only communication
- User data isolation per deployment

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details. 