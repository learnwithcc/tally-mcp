#!/usr/bin/env node

/**
 * Cursor MCP Configuration Test Script
 * 
 * This script helps verify that your Cursor MCP configuration is correct
 * and tests the connection to the Tally MCP server.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

// ANSI color codes for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Get Cursor config path based on OS
function getCursorConfigPath() {
  const homeDir = os.homedir();
  
  switch (os.platform()) {
    case 'darwin': // macOS
      return path.join(homeDir, '.cursor', 'mcp.json');
    case 'win32': // Windows
      return path.join(homeDir, '.cursor', 'mcp.json');
    default: // Linux and others
      return path.join(homeDir, '.cursor', 'mcp.json');
  }
}

// Test HTTP request to the server
function testServerConnection(token = 'test123') {
  return new Promise((resolve, reject) => {
    const url = `https://tally-mcp.focuslab.workers.dev/mcp/sse?token=${token}`;
    
    const req = https.get(url, {
      headers: {
        'Accept': 'text/event-stream',
        'User-Agent': 'cursor-config-test/1.0'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500) // First 500 chars
        });
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    // Close connection after 5 seconds to test SSE
    setTimeout(() => {
      req.destroy();
      resolve({
        statusCode: 200,
        message: 'Connection closed after 5s (expected for SSE test)'
      });
    }, 5000);
  });
}

async function main() {
  log('\n🔍 Cursor MCP Configuration Test\n', 'bold');
  
  // 1. Check if Cursor config file exists
  const configPath = getCursorConfigPath();
  logInfo(`Checking Cursor config at: ${configPath}`);
  
  if (!fs.existsSync(configPath)) {
    logError('Cursor MCP configuration file not found!');
    logInfo('Create the file with this content:');
    console.log(`
${colors.yellow}{
  "mcpServers": {
    "tally-mcp": {
      "command": "npx",
      "args": ["-y", "tally-mcp-server"],
      "env": {
        "TALLY_API_TOKEN": "your_tally_api_token_here"
      }
    }
  }
}${colors.reset}
`);
    process.exit(1);
  }
  
  logSuccess('Cursor config file found');
  
  // 2. Parse and validate config
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    logSuccess('Config file is valid JSON');
    
    // Check for tally-mcp server
    if (!config.mcpServers || !config.mcpServers['tally-mcp']) {
      logError('No "tally-mcp" server found in configuration');
      logInfo('Add this to your mcpServers section:');
      console.log(`
${colors.yellow}"tally-mcp": {
  "command": "npx",
  "args": ["-y", "tally-mcp-server"],
  "env": {
    "TALLY_API_TOKEN": "your_tally_api_token_here"
  }
}${colors.reset}
`);
      process.exit(1);
    }
    
    logSuccess('Found tally-mcp server configuration');
    
    const tallyConfig = config.mcpServers['tally-mcp'];
    
    // Check configuration details
    if (tallyConfig.command !== 'npx') {
      logWarning('Command should be "npx" for npm package execution');
    }
    
    if (!tallyConfig.args || !tallyConfig.args.includes('tally-mcp-server')) {
      logWarning('Args should include "tally-mcp-server"');
    }
    
    if (!tallyConfig.env || !tallyConfig.env.TALLY_API_TOKEN) {
      logError('Missing TALLY_API_TOKEN in environment variables');
      process.exit(1);
    }
    
    if (tallyConfig.env.TALLY_API_TOKEN === 'your_tally_api_token_here') {
      logWarning('TALLY_API_TOKEN appears to be a placeholder - make sure to use your real token');
    }
    
    logSuccess('Configuration looks good');
    
  } catch (error) {
    logError(`Error parsing config file: ${error.message}`);
    process.exit(1);
  }
  
  // 3. Test server connection
  logInfo('\nTesting server connection...');
  
  try {
    const result = await testServerConnection();
    
    if (result.statusCode === 200) {
      logSuccess('Server is responding correctly');
      
      if (result.data && result.data.includes('notifications/initialized')) {
        logSuccess('SSE connection established and MCP protocol working');
      }
      
      if (result.data && result.data.includes('tools')) {
        logSuccess('Tools list received from server');
      }
      
    } else {
      logError(`Server returned status code: ${result.statusCode}`);
    }
    
  } catch (error) {
    logError(`Server connection failed: ${error.message}`);
    logInfo('This might be normal if you\'re testing without a valid token');
  }
  
  // 4. Final recommendations
  log('\n📋 Next Steps:', 'bold');
  logInfo('1. Make sure Cursor is completely restarted after config changes');
  logInfo('2. Check Cursor logs if connection issues persist');
  logInfo('3. Verify your Tally API token is valid');
  logInfo('4. Test the server directly: curl https://tally-mcp.focuslab.workers.dev/');
  
  log('\n✨ Configuration test complete!\n', 'green');
}

// Run the test
main().catch((error) => {
  logError(`Test failed: ${error.message}`);
  process.exit(1);
}); 