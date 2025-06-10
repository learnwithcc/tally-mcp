import { TallyApiClient, TallyApiClientConfig } from './TallyApiClient';
import { OAuth2Config } from './TokenManager';
import {
  AuthenticationError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  TallyApiError,
} from '../models';
import https from 'https';

/**
 * Specific authentication error types for better error handling
 */
export class InvalidApiKeyError extends AuthenticationError {
  constructor(message: string, public readonly keyFormat?: string) {
    super(message);
    this.name = 'InvalidApiKeyError';
  }
}

export class ExpiredTokenError extends AuthenticationError {
  constructor(message: string, public readonly expirationDate?: Date) {
    super(message);
    this.name = 'ExpiredTokenError';
  }
}

export class InsufficientPermissionsError extends AuthenticationError {
  constructor(message: string, public readonly requiredScopes?: string[]) {
    super(message);
    this.name = 'InsufficientPermissionsError';
  }
}

export class TokenRefreshError extends AuthenticationError {
  constructor(message: string, public readonly refreshToken?: string) {
    super(message);
    this.name = 'TokenRefreshError';
  }
}

export class ApiKeyFormatError extends Error {
  constructor(message: string, public readonly providedKey?: string) {
    super(message);
    this.name = 'ApiKeyFormatError';
  }
}

/**
 * Configuration for authentication validation
 */
export interface AuthenticationValidatorConfig {
  /**
   * Base URL for the Tally API (defaults to https://api.tally.so)
   */
  baseURL?: string;
  
  /**
   * Request timeout in milliseconds (defaults to 10 seconds for auth calls)
   */
  timeout?: number;
  
  /**
   * OAuth 2.0 configuration for token-based authentication
   */
  oauth2Config?: OAuth2Config;
  
  /**
   * Enable debug logging for authentication operations
   */
  debug?: boolean;
  
  /**
   * Maximum number of authentication attempts before giving up
   */
  maxAuthAttempts?: number;
  
  /**
   * Delay between authentication retry attempts in milliseconds
   */
  authRetryDelayMs?: number;
  
  /**
   * Authentication state management configuration
   */
  authStateConfig?: AuthStateConfig;
}

/**
 * Result of API key format validation
 */
export interface ApiKeyValidationResult {
  /**
   * Whether the API key format is valid
   */
  isValid: boolean;
  
  /**
   * Error message if validation failed
   */
  error?: string;
  
  /**
   * Additional validation details
   */
  details?: {
    hasCorrectPrefix: boolean;
    hasCorrectLength: boolean;
    hasValidCharacters: boolean;
  };
}

/**
 * Result of authentication test
 */
export interface AuthenticationTestResult {
  /**
   * Whether authentication was successful
   */
  isAuthenticated: boolean;
  
  /**
   * HTTP status code returned
   */
  statusCode?: number;
  
  /**
   * Error message if authentication failed
   */
  error?: string;
  
  /**
   * Response time in milliseconds
   */
  responseTimeMs?: number;
  
  /**
   * Additional response data
   */
  responseData?: any;
}

/**
 * Result of endpoint accessibility test
 */
export interface EndpointAccessibilityResult {
  /**
   * Whether the endpoint is accessible
   */
  isAccessible: boolean;
  
  /**
   * HTTP status code returned
   */
  statusCode?: number;
  
  /**
   * Error message if access failed
   */
  error?: string;
  
  /**
   * Response time in milliseconds
   */
  responseTimeMs?: number;
  
  /**
   * Whether the endpoint requires authentication
   */
  requiresAuthentication?: boolean;
  
  /**
   * Response data if successful
   */
  responseData?: any;
  
  /**
   * Whether the response format is valid
   */
  isValidFormat?: boolean;
  
  /**
   * Format validation errors if any
   */
  formatErrors?: string[];
}

/**
 * Batch endpoint testing result
 */
export interface BatchEndpointTestResult {
  /**
   * Overall success of batch testing
   */
  overallSuccess: boolean;
  
  /**
   * Individual endpoint results
   */
  endpointResults: Record<string, EndpointAccessibilityResult>;
  
  /**
   * Total testing time in milliseconds
   */
  totalTimeMs: number;
  
  /**
   * Summary statistics
   */
  summary: {
    total: number;
    successful: number;
    failed: number;
    requiresAuth: number;
  };
  
  /**
   * Any errors encountered during batch testing
   */
  errors: string[];
}

/**
 * Authentication scenario test configuration
 */
export interface AuthScenarioConfig {
  /**
   * Name of the scenario
   */
  name: string;
  
  /**
   * Access token to use (can be invalid/malformed for testing)
   */
  accessToken?: string;
  
  /**
   * Expected status code
   */
  expectedStatusCode: number;
  
  /**
   * Whether this scenario should succeed
   */
  shouldSucceed: boolean;
  
  /**
   * Description of what this scenario tests
   */
  description: string;
}

/**
 * Error categorization and recovery information
 */
export interface AuthErrorInfo {
  /**
   * Error category
   */
  category: 'format' | 'authentication' | 'authorization' | 'network' | 'rate_limit' | 'server' | 'unknown';
  
  /**
   * Error severity level
   */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /**
   * Whether this error is retryable
   */
  isRetryable: boolean;
  
  /**
   * Suggested retry delay in milliseconds
   */
  retryDelayMs?: number;
  
  /**
   * User-friendly error message
   */
  userMessage: string;
  
  /**
   * Technical error details for debugging
   */
  technicalDetails: string;
  
  /**
   * Suggested actions to resolve the error
   */
  suggestedActions: string[];
  
  /**
   * Related documentation or help links
   */
  helpLinks?: string[];
}

/**
 * Enhanced error result with categorization
 */
export interface CategorizedAuthError {
  /**
   * Original error
   */
  originalError: Error;
  
  /**
   * Error information and categorization
   */
  errorInfo: AuthErrorInfo;
  
  /**
   * HTTP status code if applicable
   */
  statusCode?: number;
  
  /**
   * Timestamp when error occurred
   */
  timestamp: Date;
  
  /**
   * Context information
   */
  context?: {
    endpoint?: string;
    method?: string;
    requestId?: string;
  };
}

/**
 * Result of connection testing
 */
export interface ConnectionTestResult {
  /**
   * Whether the connection was successful
   */
  isConnected: boolean;
  
  /**
   * Response time in milliseconds
   */
  responseTimeMs: number;
  
  /**
   * Error message if connection failed
   */
  error?: string;
  
  /**
   * SSL/TLS certificate information
   */
  sslInfo?: {
    valid: boolean;
    issuer?: string;
    subject?: string;
    validFrom?: Date;
    validTo?: Date;
    fingerprint?: string;
  };
  
  /**
   * Network details
   */
  networkInfo?: {
    hostname: string;
    port: number;
    protocol: string;
    ipAddress?: string;
  };
}

/**
 * SSL/TLS certificate validation result
 */
export interface SSLValidationResult {
  /**
   * Whether the SSL certificate is valid
   */
  isValid: boolean;
  
  /**
   * Certificate details
   */
  certificate?: {
    issuer: string;
    subject: string;
    validFrom: Date;
    validTo: Date;
    fingerprint: string;
    serialNumber: string;
  };
  
  /**
   * Validation errors if any
   */
  errors: string[];
  
  /**
   * Warnings about the certificate
   */
  warnings: string[];
}

/**
 * Comprehensive authentication validation results
 */
export interface ComprehensiveAuthValidationResult {
  /**
   * Overall validation success
   */
  isValid: boolean;
  
  /**
   * API key format validation result
   */
  apiKeyValidation: ApiKeyValidationResult;
  
  /**
   * Authentication test result
   */
  authenticationTest: AuthenticationTestResult;
  
  /**
   * Connection test result
   */
  connectionTest: ConnectionTestResult;
  
  /**
   * SSL validation result
   */
  sslValidation: SSLValidationResult;
  
  /**
   * Endpoint accessibility results
   */
  endpointTests: Record<string, EndpointAccessibilityResult>;
  
  /**
   * Total validation time in milliseconds
   */
  totalTimeMs: number;
  
  /**
   * Summary of any errors encountered
   */
  errors: string[];
}

/**
 * Authentication cache entry
 */
export interface AuthCacheEntry {
  /**
   * Access token
   */
  accessToken: string;
  
  /**
   * Token expiration timestamp
   */
  expiresAt: Date;
  
  /**
   * When this entry was cached
   */
  cachedAt: Date;
  
  /**
   * Token scopes if available
   */
  scopes?: string[];
  
  /**
   * Associated user info if available
   */
  userInfo?: {
    id: string;
    email?: string;
    name?: string;
  };
}

/**
 * Authentication state management configuration
 */
export interface AuthStateConfig {
  /**
   * Cache TTL in milliseconds (default: 1 hour)
   */
  cacheTtlMs?: number;
  
  /**
   * Whether to enable token refresh
   */
  enableTokenRefresh?: boolean;
  
  /**
   * Minimum time before expiry to attempt refresh (default: 5 minutes)
   */
  refreshThresholdMs?: number;
  
  /**
   * Whether to cache authentication results
   */
  enableCaching?: boolean;
}

/**
 * Environment validation result
 */
export interface EnvValidationResult {
  /**
   * Whether environment is properly configured
   */
  isValid: boolean;
  
  /**
   * Missing environment variables
   */
  missingVars: string[];
  
  /**
   * Invalid environment variables
   */
  invalidVars: { name: string; reason: string }[];
  
  /**
   * Warnings about environment setup
   */
  warnings: string[];
}

/**
 * AuthenticationValidator - Comprehensive authentication validation for Tally.so API
 * 
 * This class provides methods to validate API keys, test authentication flows,
 * and verify endpoint accessibility for the Tally.so integration.
 */
export class AuthenticationValidator {
  private apiClient: TallyApiClient;
  private config: Required<Omit<AuthenticationValidatorConfig, 'oauth2Config'>> & {
    oauth2Config?: OAuth2Config;
  };
  
  /**
   * Authentication cache
   */
  private authCache = new Map<string, AuthCacheEntry>();
  
  /**
   * Authentication state configuration
   */
  private authStateConfig: Required<AuthStateConfig>;

  /**
   * Create a new AuthenticationValidator instance
   * 
   * @param config - Configuration options for the validator
   */
  constructor(config: AuthenticationValidatorConfig = {}) {
    // Set default configuration values
    this.config = {
      baseURL: config.baseURL || 'https://api.tally.so',
      timeout: config.timeout || 10000, // 10 seconds for auth calls
      debug: config.debug || false,
      maxAuthAttempts: config.maxAuthAttempts || 3,
      authRetryDelayMs: config.authRetryDelayMs || 1000,
      authStateConfig: config.authStateConfig || {},
    };

    // Add oauth2Config only if provided
    if (config.oauth2Config) {
      this.config.oauth2Config = config.oauth2Config;
    }

    // Create the TallyApiClient with appropriate configuration
    const clientConfig: TallyApiClientConfig = {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      debug: this.config.debug,
      retryConfig: {
        maxAttempts: this.config.maxAuthAttempts,
        baseDelayMs: this.config.authRetryDelayMs,
        enableCircuitBreaker: false, // Disable circuit breaker for auth validation
      },
    };

    // Add oauth2Config only if it exists
    if (this.config.oauth2Config) {
      clientConfig.oauth2Config = this.config.oauth2Config;
    }

    this.apiClient = new TallyApiClient(clientConfig);

    // Initialize auth state configuration
    this.authStateConfig = {
      cacheTtlMs: 60 * 60 * 1000, // 1 hour
      enableTokenRefresh: true,
      refreshThresholdMs: 5 * 60 * 1000, // 5 minutes
      enableCaching: true,
      ...config.authStateConfig
    };

    if (this.config.debug) {
      console.log('AuthenticationValidator initialized with config:', {
        baseURL: this.config.baseURL,
        timeout: this.config.timeout,
        authStateConfig: this.authStateConfig
      });
    }
  }

  /**
   * Categorize and enhance authentication errors with recovery information
   * 
   * @param error - The error to categorize
   * @param context - Additional context about where the error occurred
   * @returns Categorized error with recovery information
   */
  public categorizeAuthError(error: Error, context?: { endpoint?: string; method?: string }): CategorizedAuthError {
    const timestamp = new Date();
    let errorInfo: AuthErrorInfo;

    if (error instanceof ApiKeyFormatError) {
      errorInfo = {
        category: 'format',
        severity: 'high',
        isRetryable: false,
        userMessage: 'The API key format is invalid',
        technicalDetails: error.message,
        suggestedActions: [
          'Verify that your API key starts with "tally_"',
          'Check that the API key contains only alphanumeric characters, underscores, and hyphens',
          'Ensure the API key length is between 10 and 100 characters',
          'Generate a new API key from your Tally dashboard if needed'
        ],
        helpLinks: ['https://tally.so/help/api-keys']
      };
    } else if (error instanceof InvalidApiKeyError) {
      errorInfo = {
        category: 'authentication',
        severity: 'high',
        isRetryable: false,
        userMessage: 'The API key is invalid or not recognized',
        technicalDetails: error.message,
        suggestedActions: [
          'Verify that you are using the correct API key',
          'Check that the API key has not been revoked',
          'Generate a new API key from your Tally dashboard',
          'Ensure you are using the API key for the correct environment'
        ],
        helpLinks: ['https://tally.so/help/api-keys']
      };
    } else if (error instanceof ExpiredTokenError) {
      errorInfo = {
        category: 'authentication',
        severity: 'medium',
        isRetryable: true,
        retryDelayMs: 0, // Immediate retry after refresh
        userMessage: 'The access token has expired',
        technicalDetails: error.message,
        suggestedActions: [
          'Refresh the access token using your refresh token',
          'Re-authenticate using the OAuth flow',
          'Check token expiration times in your application'
        ],
        helpLinks: ['https://tally.so/help/oauth']
      };
    } else if (error instanceof InsufficientPermissionsError) {
      errorInfo = {
        category: 'authorization',
        severity: 'medium',
        isRetryable: false,
        userMessage: 'Insufficient permissions to access this resource',
        technicalDetails: error.message,
        suggestedActions: [
          'Request additional permissions from the workspace owner',
          'Verify that your API key has the required scopes',
          'Check that you are accessing resources within your permitted workspaces'
        ],
        helpLinks: ['https://tally.so/help/permissions']
      };
    } else if (error instanceof RateLimitError) {
      errorInfo = {
        category: 'rate_limit',
        severity: 'low',
        isRetryable: true,
        retryDelayMs: 60000, // 1 minute default
        userMessage: 'Rate limit exceeded',
        technicalDetails: error.message,
        suggestedActions: [
          'Wait before making additional requests',
          'Implement exponential backoff in your application',
          'Consider upgrading your API plan for higher rate limits',
          'Optimize your API usage to reduce request frequency'
        ],
        helpLinks: ['https://tally.so/help/rate-limits']
      };
    } else if (error instanceof NetworkError) {
      errorInfo = {
        category: 'network',
        severity: 'medium',
        isRetryable: true,
        retryDelayMs: 5000, // 5 seconds
        userMessage: 'Network connection error',
        technicalDetails: error.message,
        suggestedActions: [
          'Check your internet connection',
          'Verify that api.tally.so is accessible from your network',
          'Check for firewall or proxy restrictions',
          'Try again in a few moments'
        ]
      };
    } else if (error instanceof TimeoutError) {
      errorInfo = {
        category: 'network',
        severity: 'medium',
        isRetryable: true,
        retryDelayMs: 3000, // 3 seconds
        userMessage: 'Request timed out',
        technicalDetails: error.message,
        suggestedActions: [
          'Check your network connection speed',
          'Increase the timeout value in your configuration',
          'Try again with a smaller request payload',
          'Contact support if timeouts persist'
        ]
      };
    } else if (error instanceof TallyApiError) {
      const statusCode = error.statusCode;
      if (statusCode !== undefined && statusCode >= 500) {
        errorInfo = {
          category: 'server',
          severity: 'high',
          isRetryable: true,
          retryDelayMs: 10000, // 10 seconds
          userMessage: 'Server error occurred',
          technicalDetails: error.message,
          suggestedActions: [
            'Try again in a few moments',
            'Check the Tally status page for service issues',
            'Contact support if the problem persists'
          ],
          helpLinks: ['https://status.tally.so']
        };
      } else if (statusCode === 401) {
        errorInfo = {
          category: 'authentication',
          severity: 'high',
          isRetryable: false,
          userMessage: 'Authentication failed',
          technicalDetails: error.message,
          suggestedActions: [
            'Verify your API key or access token',
            'Check that your credentials have not expired',
            'Re-authenticate if using OAuth'
          ]
        };
      } else if (statusCode === 403) {
        errorInfo = {
          category: 'authorization',
          severity: 'medium',
          isRetryable: false,
          userMessage: 'Access forbidden',
          technicalDetails: error.message,
          suggestedActions: [
            'Check that you have permission to access this resource',
            'Verify that your API key has the required scopes',
            'Contact the workspace owner for access'
          ]
        };
      } else {
        errorInfo = {
          category: 'unknown',
          severity: 'medium',
          isRetryable: false,
          userMessage: 'An API error occurred',
          technicalDetails: error.message,
          suggestedActions: [
            'Check the API documentation for this endpoint',
            'Verify your request parameters',
            'Contact support if the issue persists'
          ]
        };
      }
    } else {
      errorInfo = {
        category: 'unknown',
        severity: 'medium',
        isRetryable: false,
        userMessage: 'An unexpected error occurred',
        technicalDetails: error.message,
        suggestedActions: [
          'Try again in a few moments',
          'Check your network connection',
          'Contact support if the problem persists'
        ]
      };
    }

    return {
      originalError: error,
      errorInfo,
      ...(error instanceof TallyApiError && error.statusCode !== undefined ? { statusCode: error.statusCode } : {}),
      timestamp,
      ...(context ? { context } : {})
    };
  }

  /**
   * Create appropriate error based on API response
   * 
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param responseData - Response data if available
   * @returns Appropriate error instance
   */
  public createAuthError(statusCode: number, message: string, responseData?: any): Error {
    switch (statusCode) {
      case 401:
        if (message.toLowerCase().includes('expired')) {
          return new ExpiredTokenError(message);
        } else if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('key')) {
          return new InvalidApiKeyError(message);
        } else {
          return new AuthenticationError(message);
        }
      
      case 403:
        return new InsufficientPermissionsError(message);
      
      case 429:
        return new RateLimitError(message);
      
      case 408:
      case 504:
        return new TimeoutError(message);
      
      case 500:
      case 502:
      case 503:
        return new NetworkError(message);
      
      default:
        return new AuthenticationError(message);
    }
  }

  /**
   * Determine if an error should trigger a retry
   * 
   * @param error - The error to check
   * @param attemptNumber - Current attempt number
   * @param maxAttempts - Maximum number of attempts
   * @returns Whether to retry and suggested delay
   */
  public shouldRetryAuthError(
    error: Error, 
    attemptNumber: number, 
    maxAttempts: number
  ): { shouldRetry: boolean; delayMs: number } {
    if (attemptNumber >= maxAttempts) {
      return { shouldRetry: false, delayMs: 0 };
    }

    const categorizedError = this.categorizeAuthError(error);
    
    if (!categorizedError.errorInfo.isRetryable) {
      return { shouldRetry: false, delayMs: 0 };
    }

    const baseDelay = categorizedError.errorInfo.retryDelayMs || this.config.authRetryDelayMs;
    const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1);
    const maxDelay = 60000; // 1 minute max
    const delayMs = Math.min(exponentialDelay, maxDelay);

    return { shouldRetry: true, delayMs };
  }

  /**
   * Validate API key format according to Tally.so specifications
   * 
   * @param apiKey - The API key to validate
   * @returns Validation result with details
   */
  public validateApiKeyFormat(apiKey: string): ApiKeyValidationResult {
    if (!apiKey || typeof apiKey !== 'string') {
      return {
        isValid: false,
        error: 'API key must be a non-empty string',
        details: {
          hasCorrectPrefix: false,
          hasCorrectLength: false,
          hasValidCharacters: false,
        },
      };
    }

    const hasCorrectPrefix = apiKey.startsWith('tally_');
    const hasCorrectLength = apiKey.length >= 10 && apiKey.length <= 100; // Reasonable bounds
    const hasValidCharacters = /^[a-zA-Z0-9_-]+$/.test(apiKey);

    const isValid = hasCorrectPrefix && hasCorrectLength && hasValidCharacters;

    const result: ApiKeyValidationResult = {
      isValid,
      details: {
        hasCorrectPrefix,
        hasCorrectLength,
        hasValidCharacters,
      },
    };

    if (!isValid) {
      const errors: string[] = [];
      if (!hasCorrectPrefix) {
        errors.push('API key must start with "tally_" prefix');
      }
      if (!hasCorrectLength) {
        errors.push(`API key length must be between 10 and 100 characters (current: ${apiKey.length})`);
      }
      if (!hasValidCharacters) {
        errors.push('API key can only contain alphanumeric characters, underscores, and hyphens');
      }
      result.error = errors.join('; ');
    }

    return result;
  }

  /**
   * Generate OAuth 2.0 authorization URL for authentication flow
   * 
   * @param state - Optional state parameter for CSRF protection
   * @param scopes - Optional scopes to request (defaults to basic access)
   * @returns Authorization URL
   */
  public generateAuthorizationUrl(state?: string, scopes?: string[]): string {
    if (!this.config.oauth2Config) {
      throw new AuthenticationError('OAuth 2.0 configuration is required for authorization URL generation');
    }

    return this.apiClient.getAuthorizationUrl(state);
  }

  /**
   * Exchange authorization code for access token
   * 
   * @param authorizationCode - Authorization code received from OAuth callback
   * @returns Token exchange result
   */
  public async exchangeCodeForToken(authorizationCode: string): Promise<AuthenticationTestResult> {
    const startTime = Date.now();

    try {
      if (!this.config.oauth2Config) {
        throw new AuthenticationError('OAuth 2.0 configuration is required for token exchange');
      }

      const result = await this.apiClient.exchangeCodeForToken(authorizationCode);
      const responseTimeMs = Date.now() - startTime;

      return {
        isAuthenticated: true,
        statusCode: 200,
        responseTimeMs,
        responseData: result,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during token exchange';
      
      const result: AuthenticationTestResult = {
        isAuthenticated: false,
        error: errorMessage,
        responseTimeMs,
      };
      
      if (error instanceof TallyApiError) {
        result.statusCode = error.statusCode;
      }
      
      return result;
    }
  }

  /**
   * Test authentication with the provided access token
   * 
   * @param accessToken - OAuth 2.0 access token to test
   * @returns Authentication test result
   */
  public async testAuthentication(accessToken: string): Promise<AuthenticationTestResult> {
    const startTime = Date.now();

    try {
      // Set the access token for testing
      this.apiClient.setAccessToken(accessToken);

      // Try to authenticate and get user info or workspaces
      const isAuthenticated = await this.apiClient.isAuthenticated();
      const responseTimeMs = Date.now() - startTime;

      if (isAuthenticated) {
        // Try to get workspaces to verify the token works
        const workspaces = await this.apiClient.getWorkspaces({ limit: 1 });
        
        return {
          isAuthenticated: true,
          statusCode: 200,
          responseTimeMs,
          responseData: { workspacesCount: workspaces.workspaces?.length || 0 },
        };
      } else {
        return {
          isAuthenticated: false,
          statusCode: 401,
          error: 'Authentication failed - token may be invalid or expired',
          responseTimeMs,
        };
      }
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      let statusCode: number | undefined;
      let errorMessage: string;

      if (error instanceof AuthenticationError) {
        statusCode = 401;
        errorMessage = error.message;
      } else if (error instanceof RateLimitError) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded during authentication test';
      } else if (error instanceof NetworkError) {
        statusCode = 503;
        errorMessage = 'Network error during authentication test';
      } else if (error instanceof TimeoutError) {
        statusCode = 408;
        errorMessage = 'Timeout during authentication test';
      } else if (error instanceof TallyApiError) {
        statusCode = error.statusCode;
        errorMessage = error.message;
      } else {
        errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
      }

      const result: AuthenticationTestResult = {
        isAuthenticated: false,
        error: errorMessage,
        responseTimeMs,
      };
      
      if (statusCode !== undefined) {
        result.statusCode = statusCode;
      }
      
      return result;
    }
  }

  /**
   * Test accessibility of a specific API endpoint
   * 
   * @param endpoint - The endpoint to test (e.g., '/forms', '/workspaces')
   * @param accessToken - Optional access token for authenticated requests
   * @returns Endpoint accessibility result
   */
  public async testEndpointAccessibility(
    endpoint: string,
    accessToken?: string
  ): Promise<EndpointAccessibilityResult> {
    const startTime = Date.now();

    try {
      // Set access token if provided
      if (accessToken) {
        this.apiClient.setAccessToken(accessToken);
      } else {
        this.apiClient.setAccessToken(''); // Clear token for unauthenticated test
      }

      // Make a GET request to the endpoint
      const response = await this.apiClient.get(endpoint);
      const responseTimeMs = Date.now() - startTime;

      return {
        isAccessible: true,
        statusCode: response.status,
        responseTimeMs,
        requiresAuthentication: !!accessToken,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      let statusCode: number | undefined;
      let errorMessage: string;
      let requiresAuthentication = false;

      if (error instanceof AuthenticationError) {
        statusCode = 401;
        errorMessage = 'Endpoint requires authentication';
        requiresAuthentication = true;
      } else if (error instanceof TallyApiError) {
        statusCode = error.statusCode;
        errorMessage = error.message;
        requiresAuthentication = statusCode === 401 || statusCode === 403;
      } else if (error instanceof NetworkError) {
        statusCode = 503;
        errorMessage = 'Network error accessing endpoint';
      } else if (error instanceof TimeoutError) {
        statusCode = 408;
        errorMessage = 'Timeout accessing endpoint';
      } else {
        errorMessage = error instanceof Error ? error.message : 'Unknown error accessing endpoint';
      }

      return {
        isAccessible: false,
        statusCode,
        error: errorMessage,
        responseTimeMs,
        requiresAuthentication,
      };
    }
  }

  /**
   * Validate response format using appropriate Zod schema
   * 
   * @param endpoint - The endpoint that was called
   * @param responseData - The response data to validate
   * @returns Validation result
   */
  private validateResponseFormat(endpoint: string, responseData: any): { isValid: boolean; errors: string[] } {
    try {
      // Import schemas dynamically to avoid circular dependencies
      const { 
        TallyFormsResponseSchema, 
        TallyWorkspacesResponseSchema,
        TallySubmissionsResponseSchema 
      } = require('../models');

      let schema;
      if (endpoint.includes('/forms')) {
        schema = TallyFormsResponseSchema;
      } else if (endpoint.includes('/workspaces')) {
        schema = TallyWorkspacesResponseSchema;
      } else if (endpoint.includes('/submissions')) {
        schema = TallySubmissionsResponseSchema;
      } else {
        // No specific schema available, just check if it's an object
        return {
          isValid: typeof responseData === 'object' && responseData !== null,
          errors: typeof responseData !== 'object' ? ['Response is not an object'] : [],
        };
      }

      const validation = schema.safeParse(responseData);
      return {
        isValid: validation.success,
        errors: validation.success ? [] : validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  /**
   * Test accessibility of a specific API endpoint with enhanced validation
   * 
   * @param endpoint - The endpoint to test (e.g., '/forms', '/workspaces')
   * @param accessToken - Optional access token for authenticated requests
   * @param validateFormat - Whether to validate response format using Zod schemas
   * @returns Enhanced endpoint accessibility result
   */
  public async testEndpointAccessibilityEnhanced(
    endpoint: string,
    accessToken?: string,
    validateFormat: boolean = false
  ): Promise<EndpointAccessibilityResult> {
    const startTime = Date.now();

    try {
      // Set access token if provided
      if (accessToken) {
        this.apiClient.setAccessToken(accessToken);
      } else {
        this.apiClient.setAccessToken(''); // Clear token for unauthenticated test
      }

      // Make a GET request to the endpoint
      const response = await this.apiClient.get(endpoint);
      const responseTimeMs = Date.now() - startTime;

      const result: EndpointAccessibilityResult = {
        isAccessible: true,
        statusCode: response.status,
        responseTimeMs,
        requiresAuthentication: !!accessToken,
        responseData: response.data,
      };

      // Validate response format if requested
      if (validateFormat) {
        const formatValidation = this.validateResponseFormat(endpoint, response.data);
        result.isValidFormat = formatValidation.isValid;
        result.formatErrors = formatValidation.errors;
      }

      return result;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      let statusCode: number | undefined;
      let errorMessage: string;
      let requiresAuthentication = false;

      if (error instanceof AuthenticationError) {
        statusCode = 401;
        errorMessage = 'Endpoint requires authentication';
        requiresAuthentication = true;
      } else if (error instanceof TallyApiError) {
        statusCode = error.statusCode;
        errorMessage = error.message;
        requiresAuthentication = statusCode === 401 || statusCode === 403;
      } else if (error instanceof NetworkError) {
        statusCode = 503;
        errorMessage = 'Network error accessing endpoint';
      } else if (error instanceof TimeoutError) {
        statusCode = 408;
        errorMessage = 'Timeout accessing endpoint';
      } else {
        errorMessage = error instanceof Error ? error.message : 'Unknown error accessing endpoint';
      }

      return {
        isAccessible: false,
        statusCode,
        error: errorMessage,
        responseTimeMs,
        requiresAuthentication,
      };
    }
  }

  /**
   * Test the /forms endpoint specifically
   * 
   * @param accessToken - Access token for authentication
   * @param options - Query options for the forms endpoint
   * @returns Endpoint test result with forms-specific validation
   */
  public async testFormsEndpoint(
    accessToken: string,
    options: { page?: number; limit?: number; workspaceId?: string } = {}
  ): Promise<EndpointAccessibilityResult> {
    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.workspaceId) queryParams.append('workspaceId', options.workspaceId);
    
    const endpoint = `/forms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.testEndpointAccessibilityEnhanced(endpoint, accessToken, true);
  }

  /**
   * Test the /workspaces endpoint specifically
   * 
   * @param accessToken - Access token for authentication
   * @param options - Query options for the workspaces endpoint
   * @returns Endpoint test result with workspaces-specific validation
   */
  public async testWorkspacesEndpoint(
    accessToken: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<EndpointAccessibilityResult> {
    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    
    const endpoint = `/workspaces${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.testEndpointAccessibilityEnhanced(endpoint, accessToken, true);
  }

  /**
   * Test multiple endpoints in batch
   * 
   * @param endpoints - List of endpoints to test
   * @param accessToken - Access token for authentication
   * @param validateFormat - Whether to validate response formats
   * @returns Batch testing results
   */
  public async testEndpointsBatch(
    endpoints: string[],
    accessToken?: string,
    validateFormat: boolean = false
  ): Promise<BatchEndpointTestResult> {
    const startTime = Date.now();
    const endpointResults: Record<string, EndpointAccessibilityResult> = {};
    const errors: string[] = [];

    // Test each endpoint
    for (const endpoint of endpoints) {
      try {
        endpointResults[endpoint] = await this.testEndpointAccessibilityEnhanced(endpoint, accessToken, validateFormat);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        endpointResults[endpoint] = {
          isAccessible: false,
          error: errorMessage,
          responseTimeMs: 0,
        };
        errors.push(`${endpoint}: ${errorMessage}`);
      }
    }

    const totalTimeMs = Date.now() - startTime;
    const results = Object.values(endpointResults);
    const successful = results.filter(r => r.isAccessible).length;
    const failed = results.filter(r => !r.isAccessible).length;
    const requiresAuth = results.filter(r => r.requiresAuthentication).length;

    return {
      overallSuccess: failed === 0,
      endpointResults,
      totalTimeMs,
      summary: {
        total: endpoints.length,
        successful,
        failed,
        requiresAuth,
      },
      errors,
    };
  }

  /**
   * Test different authentication scenarios
   * 
   * @param endpoint - Endpoint to test
   * @param scenarios - Authentication scenarios to test
   * @returns Results for each scenario
   */
  public async testAuthenticationScenarios(
    endpoint: string,
    scenarios?: AuthScenarioConfig[]
  ): Promise<Record<string, EndpointAccessibilityResult & { scenarioConfig: AuthScenarioConfig }>> {
    const defaultScenarios: AuthScenarioConfig[] = [
      {
        name: 'valid_token',
        accessToken: 'tally_valid_test_token_12345',
        expectedStatusCode: 200,
        shouldSucceed: true,
        description: 'Test with a valid access token format',
      },
      {
        name: 'invalid_token',
        accessToken: 'tally_invalid_token_xyz',
        expectedStatusCode: 401,
        shouldSucceed: false,
        description: 'Test with an invalid access token',
      },
      {
        name: 'malformed_token',
        accessToken: 'not_a_tally_token',
        expectedStatusCode: 401,
        shouldSucceed: false,
        description: 'Test with a malformed token (wrong prefix)',
      },
      {
        name: 'empty_token',
        accessToken: '',
        expectedStatusCode: 401,
        shouldSucceed: false,
        description: 'Test with an empty token',
      },
      {
        name: 'no_token',
        accessToken: undefined,
        expectedStatusCode: 401,
        shouldSucceed: false,
        description: 'Test without any authentication token',
      },
    ];

    const testScenarios = scenarios || defaultScenarios;
    const results: Record<string, EndpointAccessibilityResult & { scenarioConfig: AuthScenarioConfig }> = {};

    for (const scenario of testScenarios) {
      try {
        const result = await this.testEndpointAccessibilityEnhanced(endpoint, scenario.accessToken);
        results[scenario.name] = {
          ...result,
          scenarioConfig: scenario,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results[scenario.name] = {
          isAccessible: false,
          error: errorMessage,
          responseTimeMs: 0,
          scenarioConfig: scenario,
        };
      }
    }

    return results;
  }

  /**
   * Test network connectivity to the Tally API server
   * 
   * @param hostname - Hostname to test (defaults to api.tally.so)
   * @param port - Port to test (defaults to 443 for HTTPS)
   * @returns Connection test result
   */
  public async testConnection(
    hostname: string = 'api.tally.so',
    port: number = 443
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const options = {
        hostname,
        port,
        method: 'HEAD',
        timeout: this.config.timeout,
        rejectUnauthorized: true, // Ensure SSL certificate validation
      };

      const req = https.request(options, (res) => {
        const responseTimeMs = Date.now() - startTime;
        const socket = res.socket as any;
        
        const sslInfo = socket.getPeerCertificate ? {
          valid: socket.authorized || false,
          issuer: socket.getPeerCertificate()?.issuer?.CN,
          subject: socket.getPeerCertificate()?.subject?.CN,
          validFrom: socket.getPeerCertificate()?.valid_from ? new Date(socket.getPeerCertificate().valid_from) : undefined,
          validTo: socket.getPeerCertificate()?.valid_to ? new Date(socket.getPeerCertificate().valid_to) : undefined,
          fingerprint: socket.getPeerCertificate()?.fingerprint,
        } : undefined;

        resolve({
          isConnected: true,
          responseTimeMs,
          sslInfo,
          networkInfo: {
            hostname,
            port,
            protocol: 'https',
            ipAddress: socket.remoteAddress,
          },
        });
      });

      req.on('error', (error) => {
        const responseTimeMs = Date.now() - startTime;
        resolve({
          isConnected: false,
          responseTimeMs,
          error: error.message,
          networkInfo: {
            hostname,
            port,
            protocol: 'https',
          },
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const responseTimeMs = Date.now() - startTime;
        resolve({
          isConnected: false,
          responseTimeMs,
          error: `Connection timeout after ${this.config.timeout}ms`,
          networkInfo: {
            hostname,
            port,
            protocol: 'https',
          },
        });
      });

      req.end();
    });
  }

  /**
   * Validate SSL/TLS certificate for the Tally API
   * 
   * @param hostname - Hostname to validate (defaults to api.tally.so)
   * @param port - Port to validate (defaults to 443)
   * @returns SSL validation result
   */
  public async validateSSLCertificate(
    hostname: string = 'api.tally.so',
    port: number = 443
  ): Promise<SSLValidationResult> {
    return new Promise((resolve) => {
      const options = {
        hostname,
        port,
        method: 'HEAD',
        timeout: this.config.timeout,
        rejectUnauthorized: true,
      };

      const req = https.request(options, (res) => {
        const socket = res.socket as any;
        const cert = socket.getPeerCertificate();
        
        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            isValid: false,
            errors: ['No SSL certificate found'],
            warnings: [],
          });
          return;
        }

        const now = new Date();
        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check certificate validity period
        if (now < validFrom) {
          errors.push('Certificate is not yet valid');
        }
        if (now > validTo) {
          errors.push('Certificate has expired');
        }

        // Check if certificate is expiring soon (within 30 days)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (validTo < thirtyDaysFromNow) {
          warnings.push('Certificate expires within 30 days');
        }

        // Check hostname match
        if (cert.subject?.CN !== hostname && !cert.subjectaltname?.includes(hostname)) {
          errors.push(`Certificate hostname mismatch: expected ${hostname}, got ${cert.subject?.CN}`);
        }

        // Check if certificate is self-signed
        if (cert.issuer?.CN === cert.subject?.CN) {
          warnings.push('Certificate appears to be self-signed');
        }

        const isValid = socket.authorized && errors.length === 0;

        resolve({
          isValid,
          certificate: {
            issuer: cert.issuer?.CN || 'Unknown',
            subject: cert.subject?.CN || 'Unknown',
            validFrom,
            validTo,
            fingerprint: cert.fingerprint || '',
            serialNumber: cert.serialNumber || '',
          },
          errors,
          warnings,
        });
      });

      req.on('error', (error) => {
        resolve({
          isValid: false,
          errors: [`SSL connection error: ${error.message}`],
          warnings: [],
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          isValid: false,
          errors: [`SSL validation timeout after ${this.config.timeout}ms`],
          warnings: [],
        });
      });

      req.end();
    });
  }

  /**
   * Test connection with retry logic and exponential backoff
   * 
   * @param hostname - Hostname to test
   * @param port - Port to test
   * @param maxRetries - Maximum number of retry attempts
   * @returns Connection test result with retry information
   */
  public async testConnectionWithRetry(
    hostname: string = 'api.tally.so',
    port: number = 443,
    maxRetries: number = 3
  ): Promise<ConnectionTestResult & { retryAttempts: number }> {
    let lastError: string = '';
    let totalResponseTime = 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.testConnection(hostname, port);
        
        if (result.isConnected) {
          return {
            ...result,
            responseTimeMs: totalResponseTime + result.responseTimeMs,
            retryAttempts: attempt,
          };
        }
        
        lastError = result.error || 'Connection failed';
        totalResponseTime += result.responseTimeMs;
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = this.config.authRetryDelayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (attempt < maxRetries) {
          const delay = this.config.authRetryDelayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      isConnected: false,
      responseTimeMs: totalResponseTime,
      error: `Failed after ${maxRetries + 1} attempts: ${lastError}`,
      retryAttempts: maxRetries + 1,
      networkInfo: {
        hostname,
        port,
        protocol: 'https',
      },
    };
  }

  /**
   * Perform comprehensive authentication validation
   * 
   * @param accessToken - Access token to validate
   * @param testEndpoints - List of endpoints to test accessibility
   * @returns Comprehensive validation results
   */
  public async performComprehensiveValidation(
    accessToken: string,
    testEndpoints: string[] = ['/workspaces', '/forms']
  ): Promise<ComprehensiveAuthValidationResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    // 1. Validate API key format
    const apiKeyValidation = this.validateApiKeyFormat(accessToken);
    if (!apiKeyValidation.isValid && apiKeyValidation.error) {
      errors.push(`API Key Format: ${apiKeyValidation.error}`);
    }

    // 2. Test connection
    const connectionTest = await this.testConnection();
    if (!connectionTest.isConnected && connectionTest.error) {
      errors.push(`Connection: ${connectionTest.error}`);
    }

    // 3. Validate SSL certificate
    const sslValidation = await this.validateSSLCertificate();
    if (!sslValidation.isValid) {
      errors.push(`SSL: ${sslValidation.errors.join(', ')}`);
    }

    // 4. Test authentication
    const authenticationTest = await this.testAuthentication(accessToken);
    if (!authenticationTest.isAuthenticated && authenticationTest.error) {
      errors.push(`Authentication: ${authenticationTest.error}`);
    }

    // 5. Test endpoint accessibility
    const endpointTests: Record<string, EndpointAccessibilityResult> = {};
    for (const endpoint of testEndpoints) {
      try {
        endpointTests[endpoint] = await this.testEndpointAccessibility(endpoint, accessToken);
        if (!endpointTests[endpoint].isAccessible && endpointTests[endpoint].error) {
          errors.push(`Endpoint ${endpoint}: ${endpointTests[endpoint].error}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        endpointTests[endpoint] = {
          isAccessible: false,
          error: errorMessage,
          responseTimeMs: 0,
        };
        errors.push(`Endpoint ${endpoint}: ${errorMessage}`);
      }
    }

    const totalTimeMs = Date.now() - startTime;
    const isValid = apiKeyValidation.isValid && 
                   connectionTest.isConnected &&
                   sslValidation.isValid &&
                   authenticationTest.isAuthenticated && 
                   Object.values(endpointTests).every(result => result.isAccessible);

    return {
      isValid,
      apiKeyValidation,
      connectionTest,
      sslValidation,
      authenticationTest,
      endpointTests,
      totalTimeMs,
      errors,
    };
  }

  /**
   * Get the underlying TallyApiClient instance
   * 
   * @returns TallyApiClient instance
   */
  public getApiClient(): TallyApiClient {
    return this.apiClient;
  }

  /**
   * Get the current configuration
   * 
   * @returns Current configuration
   */
  public getConfig(): Readonly<Required<AuthenticationValidatorConfig>> {
    return { ...this.config };
  }

  /**
   * Validate environment variables for authentication
   */
  public validateEnvironment(): EnvValidationResult {
    const result: EnvValidationResult = {
      isValid: true,
      missingVars: [],
      invalidVars: [],
      warnings: []
    };

    // Check for API key
    const apiKey = process.env.TALLY_API_KEY;
    if (!apiKey) {
      result.missingVars.push('TALLY_API_KEY');
      result.isValid = false;
    } else {
      const validation = this.validateApiKeyFormat(apiKey);
      if (!validation.isValid) {
        result.invalidVars.push({
          name: 'TALLY_API_KEY',
          reason: validation.error || 'Invalid format'
        });
        result.isValid = false;
      }
    }

    // Check OAuth configuration if enabled
    if (this.config.oauth2Config) {
      const requiredOAuthVars = ['TALLY_CLIENT_ID', 'TALLY_CLIENT_SECRET'];
      for (const varName of requiredOAuthVars) {
        if (!process.env[varName]) {
          result.missingVars.push(varName);
          result.isValid = false;
        }
      }

      const redirectUri = process.env.TALLY_REDIRECT_URI;
      if (!redirectUri) {
        result.warnings.push('TALLY_REDIRECT_URI not set - OAuth flow may not work correctly');
      } else if (!redirectUri.startsWith('https://') && !redirectUri.startsWith('http://localhost')) {
        result.warnings.push('TALLY_REDIRECT_URI should use HTTPS in production');
      }
    }

    // Check optional configuration
    const baseUrl = process.env.TALLY_API_BASE_URL;
    if (baseUrl && !baseUrl.startsWith('https://')) {
      result.warnings.push('TALLY_API_BASE_URL should use HTTPS');
    }

    this.logAuthentication('info', 'Environment validation completed', {
      isValid: result.isValid,
      missingVars: result.missingVars,
      invalidVars: result.invalidVars.length,
      warnings: result.warnings.length
    });

    return result;
  }

  /**
   * Cache authentication result
   */
  private cacheAuthResult(
    accessToken: string, 
    expiresInSeconds?: number, 
    userInfo?: AuthCacheEntry['userInfo']
  ): void {
    if (!this.authStateConfig.enableCaching) {
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiresInSeconds ? expiresInSeconds * 1000 : this.authStateConfig.cacheTtlMs));

    const cacheEntry: AuthCacheEntry = {
      accessToken,
      expiresAt,
      cachedAt: now,
      userInfo
    };

    this.authCache.set(accessToken, cacheEntry);

    this.logAuthentication('debug', 'Authentication result cached', {
      expiresAt: expiresAt.toISOString(),
      hasUserInfo: !!userInfo
    });

    // Clean up expired entries
    this.cleanupExpiredCache();
  }

  /**
   * Get cached authentication result
   */
  private getCachedAuth(accessToken: string): AuthCacheEntry | null {
    if (!this.authStateConfig.enableCaching) {
      return null;
    }

    const entry = this.authCache.get(accessToken);
    if (!entry) {
      return null;
    }

    const now = new Date();
    if (now >= entry.expiresAt) {
      this.authCache.delete(accessToken);
      this.logAuthentication('debug', 'Cached authentication expired', {
        accessToken: accessToken.substring(0, 10) + '...',
        expiredAt: entry.expiresAt.toISOString()
      });
      return null;
    }

    return entry;
  }

  /**
   * Check if token needs refresh
   */
  private needsTokenRefresh(cacheEntry: AuthCacheEntry): boolean {
    if (!this.authStateConfig.enableTokenRefresh) {
      return false;
    }

    const now = new Date();
    const refreshThreshold = new Date(cacheEntry.expiresAt.getTime() - this.authStateConfig.refreshThresholdMs);
    
    return now >= refreshThreshold;
  }

  /**
   * Refresh authentication token
   */
  public async refreshAuthToken(refreshToken: string): Promise<AuthenticationTestResult> {
    const startTime = Date.now();
    
    this.logAuthentication('info', 'Attempting token refresh', {
      refreshToken: refreshToken.substring(0, 10) + '...'
    });

    try {
      if (!this.config.oauth2Config) {
        throw new Error('OAuth configuration required for token refresh');
      }

      const refreshData = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.oauth2Config.clientId,
        client_secret: this.config.oauth2Config.clientSecret
      };

      const response = await this.apiClient.makeRequest({
        method: 'POST',
        endpoint: '/oauth/token',
        data: refreshData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        const tokenData = response.data;
        
        // Cache the new token
        this.cacheAuthResult(
          tokenData.access_token, 
          tokenData.expires_in,
          tokenData.user
        );

        this.logAuthentication('info', 'Token refresh successful', {
          responseTime,
          expiresIn: tokenData.expires_in
        });

        return {
          isAuthenticated: true,
          statusCode: response.status,
          responseTimeMs: responseTime,
          responseData: tokenData
        };
      } else {
        const error = new TokenRefreshError(`Token refresh failed: ${response.data?.error || 'Unknown error'}`, refreshToken);
        this.logAuthentication('error', 'Token refresh failed', {
          statusCode: response.status,
          error: error.message,
          responseTime
        });
        
        return {
          isAuthenticated: false,
          statusCode: response.status,
          error: error.message,
          responseTimeMs: responseTime
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const authError = new TokenRefreshError(`Token refresh error: ${error.message}`, refreshToken);
      
      this.logAuthentication('error', 'Token refresh error', {
        error: error.message,
        responseTime
      });

      return {
        isAuthenticated: false,
        error: authError.message,
        responseTimeMs: responseTime
      };
    }
  }

  /**
   * Enhanced authentication test with caching and refresh
   */
  public async testAuthenticationWithCache(accessToken: string, forceRefresh: boolean = false): Promise<AuthenticationTestResult> {
    this.logAuthentication('info', 'Starting authentication test with cache', {
      accessToken: accessToken.substring(0, 10) + '...',
      forceRefresh
    });

    // Check cache first
    const cachedAuth = this.getCachedAuth(accessToken);
    if (cachedAuth && !forceRefresh) {
      if (this.needsTokenRefresh(cachedAuth)) {
        this.logAuthentication('info', 'Token needs refresh', {
          expiresAt: cachedAuth.expiresAt.toISOString()
        });
        // TODO: Implement refresh logic when refresh token is available
      } else {
        this.logAuthentication('info', 'Using cached authentication', {
          cachedAt: cachedAuth.cachedAt.toISOString(),
          expiresAt: cachedAuth.expiresAt.toISOString()
        });

        return {
          isAuthenticated: true,
          statusCode: 200,
          responseTimeMs: 0, // Cache hit
          responseData: cachedAuth.userInfo
        };
      }
    }

    // Perform actual authentication test
    const result = await this.testAuthentication(accessToken);

    // Cache successful result
    if (result.isAuthenticated && result.responseData) {
      this.cacheAuthResult(accessToken, undefined, result.responseData);
    }

    return result;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = new Date();
    let removedCount = 0;

    for (const [token, entry] of this.authCache.entries()) {
      if (now >= entry.expiresAt) {
        this.authCache.delete(token);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logAuthentication('debug', 'Cleaned up expired cache entries', {
        removedCount,
        remainingCount: this.authCache.size
      });
    }
  }

  /**
   * Clear authentication cache
   */
  public clearAuthCache(): void {
    const cacheSize = this.authCache.size;
    this.authCache.clear();
    
    this.logAuthentication('info', 'Authentication cache cleared', {
      clearedEntries: cacheSize
    });
  }

  /**
   * Get authentication cache stats
   */
  public getAuthCacheStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const now = new Date();
    let validEntries = 0;
    let expiredEntries = 0;
    let oldestEntry: Date | undefined;
    let newestEntry: Date | undefined;

    for (const entry of this.authCache.values()) {
      if (now < entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }

      if (!oldestEntry || entry.cachedAt < oldestEntry) {
        oldestEntry = entry.cachedAt;
      }
      if (!newestEntry || entry.cachedAt > newestEntry) {
        newestEntry = entry.cachedAt;
      }
    }

    return {
      totalEntries: this.authCache.size,
      validEntries,
      expiredEntries,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Comprehensive logging for authentication events
   */
  private logAuthentication(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, any>
  ): void {
    if (!this.config.debug && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      component: 'AuthenticationValidator',
      message,
      ...context
    };

    // Use console for now, but this could be replaced with a proper logger
    const logMethod = console[level] || console.log;
    logMethod(`[${timestamp}] [${level.toUpperCase()}] AuthenticationValidator: ${message}`, context || '');

    // In a production environment, you might want to:
    // - Send logs to a logging service (e.g., Winston, Bunyan)
    // - Include correlation IDs for request tracing
    // - Implement log sampling for high-volume scenarios
    // - Add structured logging with consistent fields
  }
} 