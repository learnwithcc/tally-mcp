/**
 * Jest test setup and configuration
 * Handles global test environment setup and teardown
 */

// Set up test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.USE_MOCK_API = 'true';
process.env.TALLY_API_KEY = process.env.TALLY_API_KEY || 'test_api_key';
process.env.TALLY_BASE_URL = process.env.TALLY_BASE_URL || 'https://api.tally.so';

// Increase timeout for async operations
jest.setTimeout(10000);

// Global test cleanup
afterAll(async () => {
  // Give processes time to clean up
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Mock console methods during tests to reduce noise
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  // Only mock console methods for non-logger tests
  if (!process.env.JEST_WORKER_ID || !global.isLoggerTest) {
    console.log = () => {};
    console.warn = () => {};
    // Keep errors visible for debugging
    console.error = originalConsoleError;
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Provide a custom serializer to handle circular references
expect.addSnapshotSerializer({
  test: (val: any) => {
    // Test for objects that might have circular references
    return val && typeof val === 'object' && 
           (val.constructor?.name === 'IncomingMessage' || 
            val.constructor?.name === 'ServerResponse' ||
            val.constructor?.name === 'Socket');
  },
  print: (val: any) => {
    // Return a simple string representation instead of trying to serialize
    return `[${val.constructor?.name || 'Object'}]`;
  }
}); 