import { MCPServer } from './server';
async function main() {
    console.log('Tally MCP Server starting...');
    const config = {
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || '0.0.0.0',
        debug: process.env.DEBUG === 'true',
    };
    const server = new MCPServer(config);
    console.log(`Server configured:`, server.getConfig());
    console.log(`Current state: ${server.getState()}`);
    console.log(`Active connections: ${server.getConnectionCount()}`);
    await server.initialize();
    console.log('Server initialization completed successfully!');
    console.log('Server is now running and ready to accept connections.');
}
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
if (require.main === module) {
    main().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}
export { MCPServer } from './server';
export default main;
//# sourceMappingURL=index.js.map