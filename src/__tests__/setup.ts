/**
 * Jest test setup and configuration
 * Handles global test environment setup and teardown
 */

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
  // Only show errors during tests
  console.log = () => {};
  console.warn = () => {};
  // Keep errors visible for debugging
  console.error = originalConsoleError;
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