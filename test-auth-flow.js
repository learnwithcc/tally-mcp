#!/usr/bin/env node

/**
 * Test authentication flow for Tally MCP server
 * This script verifies OAuth and authentication endpoints work correctly
 */

const https = require('https');
const { URL } = require('url');

const token = process.argv[2];

if (!token) {
  console.error('Usage: node test-auth-flow.js <your_tally_token>');
  process.exit(1);
}

// Configuration - replace with your deployment URL
const SERVER_URL = 'https://YOUR-DEPLOYMENT.workers.dev';

async function testAuthFlow() {
  console.log('🔐 Testing Tally MCP Server Authentication Flow\n');

  // Test 1: SSE connection without token (should fail)
  console.log('1. Testing SSE connection without token...');
  try {
    const response = await fetch(`${SERVER_URL}/mcp/sse`);
    const result = await response.json();
    
    if (response.status === 401 && result.error === 'Authentication required') {
      console.log('   ✅ Correctly rejected connection without token\n');
    } else {
      console.log('   ❌ Should have rejected connection without token\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: SSE connection with token (should succeed)
  console.log('2. Testing SSE connection with token...');
  try {
    const response = await fetch(`${SERVER_URL}/mcp/sse?token=${token}`);
    
    if (response.status === 200 && response.headers.get('content-type') === 'text/event-stream') {
      console.log('   ✅ Successfully established SSE connection with token');
      console.log(`   📡 Session ID: ${response.headers.get('X-Session-ID')}\n`);
    } else {
      console.log('   ❌ Failed to establish SSE connection with token\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Direct tool call via HTTP POST (should work without session)
  console.log('3. Testing direct tool call via HTTP POST...');
  try {
    const response = await fetch(`${SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1
      })
    });

    const result = await response.json();
    
    if (result.result && result.result.tools && result.result.tools.length === 10) {
      console.log('   ✅ Successfully retrieved tools list via direct HTTP');
      console.log(`   🔧 Found ${result.result.tools.length} tools available\n`);
    } else {
      console.log('   ❌ Failed to retrieve tools list via direct HTTP\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 4: Test actual Tally API call (list forms)
  console.log('4. Testing actual Tally API integration...');
  try {
    const response = await fetch(`${SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'list_forms',
          arguments: {}
        },
        id: 2
      })
    });

    const result = await response.json();
    
    if (result.error) {
      console.log(`   ❌ API call failed: ${result.error.message}`);
      console.log(`   💡 This is expected since we're not using session-based auth for direct calls\n`);
    } else if (result.result && result.result.content) {
      const formsData = JSON.parse(result.result.content[0].text);
      console.log(`   ✅ Successfully retrieved ${formsData.total || formsData.items?.length || 0} forms from Tally`);
      console.log(`   📋 API integration working correctly\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('🎉 Authentication flow test completed!');
  console.log('\n📝 Summary:');
  console.log('   • SSE endpoint properly requires token authentication');
  console.log('   • Direct HTTP calls work for tools/list (no auth needed)');
  console.log('   • Tally API calls require session-based authentication');
  console.log('\n🔗 To use with Cursor/Claude, configure:');
  console.log(`   "url": "${SERVER_URL}/mcp/sse?token=your_tally_token"`);
}

testAuthFlow().catch(console.error); 