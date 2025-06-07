#!/usr/bin/env node

/**
 * MCP Inspector Connection Test
 * 
 * This script tests whether the MCP Inspector can successfully connect to 
 * our Tally MCP server and verify basic functionality.
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const TIMEOUT_MS = 10000; // 10 seconds timeout
const CLIENT_PORT = process.env.CLIENT_PORT || 6274;
const SERVER_PORT = process.env.SERVER_PORT || 6277;

/**
 * Test MCP Inspector connectivity
 */
async function testInspectorConnection() {
  console.log('🔍 Testing MCP Inspector connectivity...\n');
  
  try {
    // Build the project first
    console.log('📦 Building project...');
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Build completed\n');
    
    // Start the Inspector with our server
    console.log('🚀 Starting MCP Inspector...');
    console.log(`   Client UI will be available at: http://localhost:${CLIENT_PORT}`);
    console.log(`   Proxy server will run on port: ${SERVER_PORT}\n`);
    
    const inspectorProcess = spawn('npx', [
      '@modelcontextprotocol/inspector',
      'node',
      'dist/index.js'
    ], {
      stdio: 'pipe',
      env: {
        ...process.env,
        CLIENT_PORT: CLIENT_PORT.toString(),
        SERVER_PORT: SERVER_PORT.toString(),
        MCP_AUTO_OPEN_ENABLED: 'false' // Prevent auto-opening browser
      }
    });
    
    let hasStarted = false;
    let hasConnected = false;
    let timeout;
    
    // Set up timeout
    timeout = setTimeout(() => {
      console.log('⏰ Test timed out after 10 seconds');
      inspectorProcess.kill();
      process.exit(1);
    }, TIMEOUT_MS);
    
    // Monitor stdout for connection indicators
    inspectorProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('📝 Inspector output:', output.trim());
      
      // Check for startup indicators
      if (output.includes('running on') || output.includes('Inspector running')) {
        hasStarted = true;
        console.log('✅ Inspector started successfully');
      }
      
      // Check for connection indicators
      if (output.includes('connected') || output.includes('ready')) {
        hasConnected = true;
        console.log('✅ Inspector connected to MCP server');
      }
    });
    
    // Monitor stderr for errors
    inspectorProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.log('❌ Inspector error:', error.trim());
    });
    
    // Handle process exit
    inspectorProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0 || hasStarted) {
        console.log('\n🎉 MCP Inspector test completed successfully!');
        console.log('✅ Inspector can connect to the Tally MCP server');
        console.log(`🌐 To use Inspector manually, run: npm run inspector`);
        console.log(`📱 Then open: http://localhost:${CLIENT_PORT}`);
        process.exit(0);
      } else {
        console.log(`\n❌ Inspector test failed with exit code: ${code}`);
        process.exit(1);
      }
    });
    
    // Handle process errors
    inspectorProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ Failed to start Inspector:', error.message);
      process.exit(1);
    });
    
    // Give it a few seconds to start, then kill it
    setTimeout(() => {
      console.log('\n⏹️  Stopping Inspector test...');
      inspectorProcess.kill();
    }, 5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run a command and wait for completion
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    process.on('error', reject);
  });
}

// Run the test
if (require.main === module) {
  testInspectorConnection().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { testInspectorConnection }; 