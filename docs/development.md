# Development Guide

## Setting Up Your Development Environment

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/tally-mcp.git
cd tally-mcp
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values:
# - Add your Tally API key
# - Optionally change PORT if needed
```

### 3. Development Workflow

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Branching Strategy

- **main**: Stable branch for public sharing
- **develop**: Primary development branch
- **feature/***: Individual feature branches

```bash
# Create a new feature branch
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# When ready, merge back to develop
git checkout develop
git merge feature/your-feature-name
git push origin develop
```

## Personal Configuration

For your personal development setup, create a `.env.local` file (gitignored) with:

```bash
# Your personal Cloudflare Worker URL
WORKER_URL=https://your-worker-name.your-subdomain.workers.dev/mcp

# Your personal Tally API key
TALLY_API_KEY=your_actual_api_key

# Any other personal settings
```

## Testing Your Deployment

### Local Testing
```bash
npm run dev
# Test at http://localhost:3000
```

### Production Testing
```bash
npm run deploy
# Test your Cloudflare Worker URL
```

## MCP Client Configuration

### For Cursor
Add to your `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "tally": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "TALLY_API_KEY": "your_api_key"
      }
    }
  }
}
```

### For Claude.ai
Use your deployed Cloudflare Worker URL:
```
https://your-worker.workers.dev/mcp
``` 