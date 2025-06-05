import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Configuration interface for type-safe access to environment variables
 */
export interface Config {
  // Tally.so API Configuration
  tally: {
    apiKey: string;
    apiBaseUrl: string;
    oauth: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
  };

  // MCP Server Configuration
  server: {
    port: number;
    host: string;
    logLevel: string;
  };

  // Security Configuration
  security: {
    jwtSecret: string;
    sessionSecret: string;
  };

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // Development Configuration
  development: {
    nodeEnv: string;
    debug: boolean;
  };
}

/**
 * Get a required environment variable or throw an error
 */
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Get an environment variable as a number
 */
function getEnvVarAsNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
}

/**
 * Get an environment variable as a boolean
 */
function getEnvVarAsBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Application configuration object with type-safe access to all settings
 */
export const config: Config = {
  tally: {
    apiKey: getRequiredEnvVar('TALLY_API_KEY'),
    apiBaseUrl: getOptionalEnvVar('TALLY_API_BASE_URL', 'https://api.tally.so/v1'),
    oauth: {
      clientId: getRequiredEnvVar('TALLY_OAUTH_CLIENT_ID'),
      clientSecret: getRequiredEnvVar('TALLY_OAUTH_CLIENT_SECRET'),
      redirectUri: getOptionalEnvVar('TALLY_OAUTH_REDIRECT_URI', 'http://localhost:3000/auth/callback'),
    },
  },

  server: {
    port: getEnvVarAsNumber('MCP_SERVER_PORT', 3000),
    host: getOptionalEnvVar('MCP_SERVER_HOST', 'localhost'),
    logLevel: getOptionalEnvVar('MCP_LOG_LEVEL', 'info'),
  },

  security: {
    jwtSecret: getRequiredEnvVar('JWT_SECRET'),
    sessionSecret: getRequiredEnvVar('SESSION_SECRET'),
  },

  rateLimit: {
    windowMs: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    maxRequests: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  development: {
    nodeEnv: getOptionalEnvVar('NODE_ENV', 'development'),
    debug: getEnvVarAsBoolean('DEBUG', false),
  },
};

/**
 * Validate that all required configuration is present
 */
export function validateConfig(): void {
  try {
    // Access all required properties to trigger validation
    config.tally.apiKey;
    config.tally.oauth.clientId;
    config.tally.oauth.clientSecret;
    config.security.jwtSecret;
    config.security.sessionSecret;
    
    console.log('✅ Configuration validation successful');
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    process.exit(1);
  }
}

export default config; 