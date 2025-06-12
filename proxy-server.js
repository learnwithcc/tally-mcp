#!/usr/bin/env node

/**
 * Tally MCP Proxy Server
 * 
 * This proxy allows Claude.ai to connect to your authenticated Tally MCP server
 * without needing to handle authentication directly.
 * 
 * The proxy:
 * - Accepts connections from Claude.ai (no auth required)
 * - Forwards requests to your authenticated Tally MCP server
 * - Handles authentication transparently
 */

const http = require('http');
const { spawn } = require('child_process');
const EventSource = require('eventsource');

// Configuration
const PROXY_PORT = process.env.PROXY_PORT || 3001;
const REMOTE_SERVER = process.env.REMOTE_SERVER || 'https://tally-mcp.focuslab.workers.dev/mcp';
const AUTH_TOKEN = process.env.AUTH_TOKEN || process.env.TALLY_AUTH_TOKEN;

if (!AUTH_TOKEN && !process.env.TALLY_API_KEY) {
  console.error('❌ Error: No authentication token found!');
  console.error('   Set AUTH_TOKEN or TALLY_API_KEY environment variable');
  process.exit(1);
}

/**
 * Create proxy server
 */
const server = http.createServer(async (req, res) => {
  // Enable CORS for Claude.ai
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    console.log(`📡 ${req.method} ${req.url}`);

    // Handle SSE connections for MCP
    if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
      // Forward SSE connection to remote server
      const eventSource = new EventSource(REMOTE_SERVER, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN || process.env.TALLY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      eventSource.onmessage = (event) => {
        res.write(`data: ${event.data}\n\n`);
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE Error:', error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: 'Connection error' })}\n\n`);
      };

      req.on('close', () => {
        eventSource.close();
      });

      return;
    }

    // Handle regular HTTP requests
    const proxyReq = http.request(REMOTE_SERVER, {
      method: req.method,
      headers: {
        ...req.headers,
        'Authorization': `Bearer ${AUTH_TOKEN || process.env.TALLY_API_KEY}`,
        'Host': new URL(REMOTE_SERVER).host
      }
    }, (proxyRes) => {
      // Forward response headers
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      
      res.writeHead(proxyRes.statusCode);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('❌ Proxy error:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Proxy Error',
        message: error.message
      }));
    });

    // Forward request body
    req.pipe(proxyReq);

  } catch (error) {
    console.error('❌ Server error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Server Error', 
      message: error.message
    }));
  }
});

/**
 * Start the proxy server
 */
server.listen(PROXY_PORT, () => {
  console.log(`🚀 Tally MCP Proxy Server running on http://localhost:${PROXY_PORT}`);
  console.log('');
  console.log('📋 Configuration:');
  console.log(`   Proxy: http://localhost:${PROXY_PORT}`);
  console.log(`   Remote: ${REMOTE_SERVER}`);
  console.log('   Authentication: None (handled by proxy)');
  console.log('');
  console.log('🔧 For Claude.ai, use:');
  console.log(`   URL: http://localhost:${PROXY_PORT}`);
  console.log('   Transport: http-stream');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down proxy server...');
  server.close(() => {
    console.log('✅ Proxy server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down proxy server...');
  server.close(() => {
    console.log('✅ Proxy server stopped');
    process.exit(0);
  });
}); 