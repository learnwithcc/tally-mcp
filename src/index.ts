/**
 * Tally MCP Server
 * 
 * Main entry point for the Model Context Protocol server that provides
 * tools for managing Tally.so forms through natural language commands.
 */

import { MCPServer, MCPServerConfig } from './server';

/**
 * Main function to start the server
 */
async function main() {
  console.log('Tally MCP Server starting...');

  // Create server configuration from environment variables
  const config: Partial<MCPServerConfig> = {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    debug: process.env.DEBUG === 'true',
  };

  // Create server instance
  const server = new MCPServer(config);

  console.log(`Server configured:`, server.getConfig());
  console.log(`Current state: ${server.getState()}`);
  console.log(`Active connections: ${server.getConnectionCount()}`);

  // Initialize the server
  await server.initialize();
  
  console.log('Server initialization completed successfully!');
  console.log('Server is now running and ready to accept connections.');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { MCPServer } from './server';
export default main; 