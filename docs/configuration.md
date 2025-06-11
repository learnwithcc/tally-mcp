# Configuration

This document outlines the configuration for the Tally MCP server, including environment variables and deployment setup.

## Environment Variables

The following environment variables are required for the application to run correctly. These should be stored as Cloudflare Workers secrets for production deployment.

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `TALLY_API_KEY` | Your Tally API key from [Tally Developer Portal](https://developers.tally.so/) | `tally_abcd1234567890xyz` |
| `AUTH_TOKEN` | Server authentication token (generate unique value per deployment) | `your_auth_token_$(date +%s)` |

### Setting Secrets in Cloudflare Workers

```bash
# Set your Tally API key
echo "YOUR_ACTUAL_TALLY_API_KEY" | npx wrangler secret put TALLY_API_KEY

# Generate and set a unique auth token
echo "your_unique_auth_$(openssl rand -hex 16)" | npx wrangler secret put AUTH_TOKEN
```

### Local Development (Optional)

For local testing, you can use a `.env` file:

```env
TALLY_API_KEY=your_tally_api_key_here
AUTH_TOKEN=your_local_auth_token
NODE_ENV=development
```

**⚠️ Security Warning**: Never commit `.env` files or API keys to version control.

## Deployment Configuration

### `wrangler.toml`

Configure your Cloudflare Workers deployment:

```toml
name = "your-tally-mcp"  # Choose your subdomain: your-tally-mcp.workers.dev
compatibility_date = "2023-10-30"
node_compat = true

# Do NOT add secrets here - use wrangler secret commands instead
```

### Account Configuration

1. **Get your Cloudflare Account ID**:
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Copy your Account ID from the sidebar

2. **Update wrangler.toml** (if needed):
   ```toml
   account_id = "your_account_id_here"
   ```

3. **Login to Wrangler**:
   ```bash
   npx wrangler login
   ```

## Security Best Practices

### Token Generation

Generate cryptographically secure tokens:

```bash
# Option 1: Using OpenSSL
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Using date-based unique ID
echo "tally_auth_$(date +%s)_$(openssl rand -hex 8)"
```

### Token Rotation

Periodically rotate your authentication tokens:

```bash
# Generate new token
NEW_TOKEN="tally_auth_$(date +%s)_$(openssl rand -hex 8)"

# Update secret
echo "$NEW_TOKEN" | npx wrangler secret put AUTH_TOKEN

# Update your MCP client configurations with the new token
```

### Access Control

- ✅ Use unique AUTH_TOKEN per deployment
- ✅ Never share tokens in public repositories
- ✅ Use HTTPS-only communications
- ✅ Rotate tokens periodically (quarterly recommended)
- ✅ Monitor access logs for unusual activity

## Deployment Verification

After deployment, verify your configuration:

```bash
# Test server health
curl -s https://your-tally-mcp.workers.dev/ | jq .

# Test MCP endpoint (requires valid AUTH_TOKEN)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  https://your-tally-mcp.workers.dev/mcp
```

## Backup and Recovery

### Configuration Backup

Before making changes, backup your configuration:

```bash
# Backup wrangler.toml
cp wrangler.toml wrangler.toml.backup

# Document your secret values securely
# (Store in password manager, not version control)
```

### Rollback Procedures

To rollback a configuration change:

1. **Restore configuration**:
   ```bash
   cp wrangler.toml.backup wrangler.toml
   ```

2. **Restore secrets** (if needed):
   ```bash
   echo "PREVIOUS_TALLY_API_KEY" | npx wrangler secret put TALLY_API_KEY
   echo "PREVIOUS_AUTH_TOKEN" | npx wrangler secret put AUTH_TOKEN
   ```

3. **Redeploy**:
   ```bash
   npx wrangler deploy
   ```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" errors | Invalid or missing AUTH_TOKEN | Verify token is set correctly in secrets |
| "Server configuration error" | Missing TALLY_API_KEY | Ensure Tally API key is set in secrets |
| Deployment fails | Invalid account_id or login issues | Run `npx wrangler login` and verify account_id |

### Debug Commands

```bash
# List configured secrets
npx wrangler secret list

# Check deployment status
npx wrangler list

# View deployment logs
npx wrangler tail --format pretty
``` 