module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.e2e\\.test\\.ts$' // Exclude Playwright e2e tests
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
  ],
  moduleFileExtensions: ['ts', 'js'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000,
  maxWorkers: 1, // Run tests sequentially to avoid port conflicts
  forceExit: true, // Force Jest to exit after tests complete
  detectOpenHandles: true, // Help identify unclosed handles
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: 'reports',
      outputName: 'jest-junit.xml',
    } ]
  ],
  // Update snapshots in CI if UPDATE_SNAPSHOTS env var is set  
  updateSnapshot: process.env.UPDATE_SNAPSHOTS === 'true',
  globalSetup: '<rootDir>/jest.global-setup.js',
}; 