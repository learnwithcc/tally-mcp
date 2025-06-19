# Tally MCP Server Deployment Guide

This guide covers deploying the Tally MCP server to Cloudflare Workers for use with Claude.ai and other MCP clients.

## Quick Setup

### 1. Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
# Edit .env with your actual Tally API key
```

### 2. Local Development

```bash
npm install
npm run dev
```

The server will start on `http://localhost:3000` by default.

### 3. Production Deployment

For Cloudflare Workers deployment, see the sections below.

## Development vs Production

### Development
- Use `.env` file for local configuration
- Test with local server on `localhost:3000`
- Use `npm run dev` for hot reloading

### Production (Cloudflare Workers)
- Use Cloudflare Workers secrets for sensitive data
- Deploy with `npm run deploy`
- Configure MCP clients with your worker URL 