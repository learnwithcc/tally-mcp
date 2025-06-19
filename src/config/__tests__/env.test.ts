/**
 * Tests for Environment Configuration Module
 */

describe('Environment Configuration', () => {
  // Store original process.env
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // Clear module cache to get fresh imports
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  it('should successfully parse valid environment variables', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'production'
    };

    // Import after setting process.env
    const { env } = require('../env');

    expect(env).toEqual({
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'production'
    });
  });

  it('should use default NODE_ENV when not provided', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789'
      // NODE_ENV not provided
    };

    const { env } = require('../env');

    expect(env.NODE_ENV).toBe('development');
  });

  it('should accept test environment', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'test'
    };

    const { env } = require('../env');

    expect(env.NODE_ENV).toBe('test');
  });

  it('should accept development environment', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'development'
    };

    const { env } = require('../env');

    expect(env.NODE_ENV).toBe('development');
  });

  it('should throw error when TALLY_API_KEY is missing', () => {
    process.env = {
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'production'
    };

    expect(() => require('../env')).toThrow();
  });

  it('should throw error when TALLY_API_KEY is empty', () => {
    process.env = {
      TALLY_API_KEY: '',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'production'
    };

    expect(() => require('../env')).toThrow();
  });

  it('should throw error when CLOUDFLARE_ACCOUNT_ID is missing', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'production'
    };

    expect(() => require('../env')).toThrow();
  });

  it('should throw error when CLOUDFLARE_ACCOUNT_ID is empty', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: '',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'production'
    };

    expect(() => require('../env')).toThrow();
  });

  it('should throw error when CLOUDFLARE_API_TOKEN is missing', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      NODE_ENV: 'production'
    };

    expect(() => require('../env')).toThrow();
  });

  it('should throw error when CLOUDFLARE_API_TOKEN is empty', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: '',
      NODE_ENV: 'production'
    };

    expect(() => require('../env')).toThrow();
  });

  it('should throw error when NODE_ENV is invalid', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'invalid-env'
    };

    expect(() => require('../env')).toThrow();
  });

  it('should throw error when all required variables are missing', () => {
    process.env = {};

    expect(() => require('../env')).toThrow();
  });

  it('should handle extra environment variables gracefully', () => {
    process.env = {
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'production',
      // Extra variables that should be ignored
      EXTRA_VAR: 'extra-value',
      ANOTHER_VAR: 'another-value'
    };

    const { env } = require('../env');

    // Should only include the defined schema fields
    expect(env).toEqual({
      TALLY_API_KEY: 'test-api-key-123',
      CLOUDFLARE_ACCOUNT_ID: 'cf-account-456',
      CLOUDFLARE_API_TOKEN: 'cf-token-789',
      NODE_ENV: 'production'
    });

    // Extra variables should not be included
    expect(env).not.toHaveProperty('EXTRA_VAR');
    expect(env).not.toHaveProperty('ANOTHER_VAR');
  });
}); 