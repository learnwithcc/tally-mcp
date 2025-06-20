# Security Setup Guide

## AUTH_TOKEN Configuration

The AUTH_TOKEN was accidentally committed to git and should be considered compromised. Here's how to set it up securely:

### 1. Set GitHub Repository Secret

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add a new repository secret:
   - Name: `AUTH_TOKEN`
   - Value: `tally_auth_60c2wtf1627_sfqtmyhs7k` (or generate a new one)

### 2. Update Claude Desktop Configuration

Update your Claude Desktop config file at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

Change the AUTH_TOKEN value:
```json
{
  "mcpServers": {
    "tally-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://tally-mcp.focuslab.workers.dev/mcp",
        "--header",
        "Authorization: Bearer ${AUTH_TOKEN}"
      ],
      "env": {
        "AUTH_TOKEN": "tally_auth_60c2wtf1627_sfqtmyhs7k"
      }
    }
  }
}
```

### 3. Deploy

The GitHub Actions workflow will automatically:
- Use the GitHub secret for AUTH_TOKEN
- Set it as a Cloudflare Worker secret during deployment
- Keep it secure and not expose it in logs

### 4. Generate New Tokens

To generate a new AUTH_TOKEN:
```bash
node -e "console.log('tally_auth_' + Math.random().toString(36).substring(2, 15) + '_' + Math.random().toString(36).substring(2, 15))"
```

## Security Best Practices

- Never commit secrets to git
- Use environment variables and secrets management
- Rotate tokens regularly
- Use least-privilege access principles