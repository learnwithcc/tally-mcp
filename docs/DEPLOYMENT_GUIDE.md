# Tally MCP Server Deployment Guide

This guide walks you through deploying your own secure Tally MCP server on Cloudflare Workers.

## 🎯 Prerequisites

Before you begin, ensure you have:

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Tally API key](https://developers.tally.so/) 
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/) for cloning the repository

## 📋 Step-by-Step Deployment

### 1. **Clone and Setup**

```bash
# Clone the repository
git clone https://github.com/your-username/tally-mcp.git
cd tally-mcp

# Install dependencies
npm install
```

### 2. **Get Your Tally API Key**

1. Visit [Tally Developer Portal](https://developers.tally.so/)
2. Sign in to your Tally account
3. Create or copy your API key
4. Keep it secure - you'll need it in step 4

### 3. **Configure Cloudflare Workers**

```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Login to Cloudflare
npx wrangler login
```

### 4. **Set Environment Secrets**

⚠️ **Security Note**: Never commit API keys to Git. Use Cloudflare Workers secrets instead.

```bash
# Set your Tally API key (replace with your actual key)
echo "YOUR_ACTUAL_TALLY_API_KEY" | npx wrangler secret put TALLY_API_KEY

# Generate and set a unique authentication token
echo "tally_auth_$(date +%s)_$(openssl rand -hex 8)" | npx wrangler secret put AUTH_TOKEN
```

**Save your AUTH_TOKEN** - you'll need it to configure MCP clients!

### 5. **Customize Deployment Name** (Optional)

Edit `wrangler.toml` to customize your subdomain:

```toml
name = "my-tally-mcp"  # This becomes: my-tally-mcp.workers.dev
```

### 6. **Build and Deploy**

```bash
# Build the worker
npm run build:worker

# Deploy to Cloudflare Workers
npx wrangler deploy
```

🎉 **Success!** Your server is now live at: `https://your-name.workers.dev`

### 7. **Verify Deployment**

Test your deployment:

```bash
# Replace with your actual deployment URL
curl -s https://your-deployment.workers.dev/ | jq .

# Test with authentication (replace YOUR_AUTH_TOKEN)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  https://your-deployment.workers.dev/mcp
```

## 🔌 Configure MCP Clients

### Claude.ai (Recommended)

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tally-remote": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-deployment.workers.dev/mcp",
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

**Replace**:
- `your-deployment.workers.dev` with your actual URL
- `YOUR_AUTH_TOKEN` with the token from step 4

### Cursor

**.cursor/mcp.json**:

```json
{
  "mcpServers": {
    "tally": {
      "url": "https://your-deployment.workers.dev/mcp",
      "transport": "http-stream",
      "headers": {
        "Authorization": "Bearer YOUR_AUTH_TOKEN"
      }
    }
  }
}
```

### Other MCP Clients

For any MCP client supporting HTTP Stream transport:

- **URL**: `https://your-deployment.workers.dev/mcp`
- **Transport**: `http-stream`
- **Authentication**: Bearer token in Authorization header

## 🔒 Security Best Practices

### Token Management

1. **Generate Strong Tokens**:
   ```bash
   # Option 1: Time-based unique token
   echo "tally_auth_$(date +%s)_$(openssl rand -hex 8)"
   
   # Option 2: Cryptographically secure random
   openssl rand -hex 32
   ```

2. **Rotate Tokens Regularly**:
   ```bash
   # Generate new token
   NEW_TOKEN="tally_auth_$(date +%s)_$(openssl rand -hex 8)"
   
   # Update secret
   echo "$NEW_TOKEN" | npx wrangler secret put AUTH_TOKEN
   
   # Update all MCP client configurations with new token
   ```

3. **Secure Storage**:
   - ✅ Store tokens in password manager
   - ✅ Use environment variables for development
   - ❌ Never commit tokens to version control
   - ❌ Never share tokens in screenshots or logs

### Access Control

- Each deployment has isolated authentication
- Only users with your AUTH_TOKEN can access your Tally data
- HTTPS encryption for all communications
- Cloudflare Workers built-in DDoS protection

## 🔧 Maintenance

### Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild and redeploy
npm run build:worker
npx wrangler deploy
```

### Monitoring

```bash
# View deployment logs
npx wrangler tail --format pretty

# List configured secrets
npx wrangler secret list

# Check deployment status
npx wrangler list
```

## 🐛 Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| `Unauthorized` errors | Missing/wrong AUTH_TOKEN | Verify token in MCP client config |
| `Server configuration error` | Missing TALLY_API_KEY | Check: `npx wrangler secret list` |
| Deployment fails | Authentication issues | Run: `npx wrangler login` |
| Tools don't appear | Wrong MCP endpoint | Use `/mcp` not `/` in URL |

### Debug Commands

```bash
# Test server health
curl -s https://your-deployment.workers.dev/

# Test authentication
curl -X POST \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  https://your-deployment.workers.dev/mcp

# Check logs
npx wrangler tail --format pretty
```

### Getting Help

1. **Check the logs** using `npx wrangler tail`
2. **Verify secrets** with `npx wrangler secret list`
3. **Test endpoints** using the curl commands above
4. **Review configuration** files for typos

## 🌟 Usage Examples

Once deployed, you can ask Claude or other MCP clients to:

- "List all my Tally forms"
- "Create a new contact form"
- "Show me the submissions for my newsletter signup"
- "Generate a sharing link for my survey"
- "Analyze the responses to my feedback form"

## 📚 Additional Resources

- [Tally API Documentation](https://developers.tally.so/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [mcp-remote Package](https://www.npmjs.com/package/mcp-remote)

---

🎉 **Congratulations!** You now have your own secure, production-ready Tally MCP server! 