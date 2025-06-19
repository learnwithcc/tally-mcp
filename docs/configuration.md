# Configuration

This document outlines the configuration for the Tally MCP server, including environment variables and the `wrangler.toml` file.

## Environment Variables

The following environment variables are required for the application to run correctly. These should be stored in a `.env` file for local development and as secrets in your deployment environment.

| Variable | Description | Example |
|---|---|---|
| `TALLY_API_KEY` | Your Tally API key. | `tally_1234567890` |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID. | `1234567890abcdef1234567890abcdef` |
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token. | `1234567890abcdef1234567890abcdef` |

### Optional Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | The Node.js environment. | `development` |

## `wrangler.toml`

The `wrangler.toml` file is used to configure the Cloudflare Workers deployment. Here is an example configuration:

```toml
name = "tally-mcp-server"
compatibility_date = "2023-10-30"
node_compat = true

[vars]
TALLY_API_KEY = "your-tally-api-key"

[[kv_namespaces]]
binding = "TALLY_KV"
id = "1234567890abcdef1234567890abcdef"
```

**Important**: Do not store secrets directly in the `wrangler.toml` file. Use secrets for sensitive information.

## Backup and Rollback Procedures

### Backup

Before making any changes to the configuration, it is recommended to back up the following files:

*   `.env`
*   `wrangler.toml`

Store these files in a secure location.

### Rollback

To rollback a configuration change, simply restore the backup versions of the files and redeploy the application. 