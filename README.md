# Tally MCP Server

![Version](https://img.shields.io/badge/version-1.0.0-blue) 

### A Model Context Protocol (MCP) server that provides AI assistants with secure access to Tally.so form management capabilities.


> **New to Tally?**  
> [![Get 50% Off Tally.so](https://img.shields.io/badge/-Get%2050%25_Off%20Tally.so-orange)](https://tally.cello.so/gRzFb4pxX90)  
> Use the badge above to **save 50% for 3 months**.  
> I'll earn a small commission (at no extra cost to you) which helps fund ongoing maintenance of this open‑source project.


## About

**Tally MCP Server** brings the power of Tally.so form management directly into your AI workflow. Instead of context-switching between your AI assistant and Tally's web interface, simply describe what you need in natural language and let the AI handle all the API interactions. 



### Why This Exists

Form creation and management shouldn't break your flow. Whether you're a developer creating test forms, a content creator building registration pages, or anyone who finds themselves constantly jumping between tools, this MCP server keeps you in the conversation.

### Key Features

**🎯 Natural Language Form Management**
- Create forms by describing what you need: "Build a client intake form with name, email, and project details"
- Update existing forms without opening the Tally interface
- Clone successful forms as templates for future use

**🛡️ Safety-First Bulk Operations**  
- Delete multiple forms using pattern matching ("all forms starting with 'E2E Test'")
- Mandatory preview → confirm → execute workflow prevents accidents
- Granular exclusion controls ("delete all test forms except these 3 templates")

**📊 Complete Form Lifecycle**
- Real-time response analytics and completion rates
- Export submissions to CSV/JSON
- Team management and permission controls
- Workspace organization tools

**⚡ Developer Experience**
- Built in TypeScript with full type safety
- Deployed on Cloudflare Workers for global speed
- 90% test coverage
- Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible client

### Perfect For

- **Developers** who create lots of test forms and need easy cleanup
- **Content creators** building registration forms for workshops and events  
- **Teams** managing multiple form projects across workspaces
- **Anyone** tired of clicking through form builders when they could just describe what they want

Transform form management from a context-breaking chore into a seamless part of your AI-powered workflow.

## 🚀 Quick Start

### Step 0 – Create a discounted Tally account (optional)

If you don't already have a Tally account, grab the 50% builder's discount before continuing. You'll support this repo while saving money—win‑win!

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

### Continuous Integration

In your CI (e.g., GitHub Actions), run:

```bash
npm ci
npm run test:coverage
```

Jest enforces a >90% coverage threshold via `jest.config.js`, causing the build to fail if coverage is below this level.

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

---

*Built by [Chris Cameron](https://learnwith.cc) • [LearnWith.cc](https://learnwith.cc)*
