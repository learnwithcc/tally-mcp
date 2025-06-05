import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { z } from 'zod';
import { TokenManager, OAuth2Config, TokenStorage } from './TokenManager';
import {
  TallyApiError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  createErrorFromResponse,
} from '../models';
import {
  TallySubmissionsResponseSchema,
  TallyFormsResponseSchema,
  TallyWorkspacesResponseSchema,
  TallyFormSchema,
  TallySubmissionSchema,
  TallyWorkspaceSchema,
  validateTallyResponse,
  safeParseTallyResponse,
  type TallySubmissionsResponse,
  type TallyFormsResponse,
  type TallyWorkspacesResponse,
  type TallyForm,
  type TallySubmission,
  type TallyWorkspace,
} from '../models';

/**
 * Retry configuration for rate limiting and error handling
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts (defaults to 3)
   */
  maxAttempts?: number;
  
  /**
   * Base delay in milliseconds for exponential backoff (defaults to 1000ms)
   */
  baseDelayMs?: number;
  
  /**
   * Maximum delay in milliseconds to prevent excessively long waits (defaults to 30000ms)
   */
  maxDelayMs?: number;
  
  /**
   * Exponential backoff base multiplier (defaults to 2)
   */
  exponentialBase?: number;
  
  /**
   * Jitter factor to add randomness and prevent thundering herd (defaults to 0.1)
   */
  jitterFactor?: number;
  
  /**
   * Enable circuit breaker pattern to prevent excessive retries during outages (defaults to true)
   */
  enableCircuitBreaker?: boolean;
  
  /**
   * Number of consecutive failures before opening circuit breaker (defaults to 5)
   */
  circuitBreakerThreshold?: number;
  
  /**
   * Time in milliseconds to wait before attempting to close circuit breaker (defaults to 60000ms)
   */
  circuitBreakerTimeout?: number;
}

/**
 * Configuration options for the TallyApiClient
 */
export interface TallyApiClientConfig {
  /**
   * Base URL for the Tally API (defaults to https://api.tally.so)
   */
  baseURL?: string;
  
  /**
   * Request timeout in milliseconds (defaults to 30 seconds)
   */
  timeout?: number;
  
  /**
   * Additional default headers to include with requests
   */
  defaultHeaders?: Record<string, string>;
  
  /**
   * OAuth 2.0 access token for authentication (for manual token management)
   */
  accessToken?: string;
  
  /**
   * OAuth 2.0 configuration for automatic token management
   */
  oauth2Config?: OAuth2Config;
  
  /**
   * Custom token storage implementation
   */
  tokenStorage?: TokenStorage;
  
  /**
   * Enable request/response logging for debugging
   */
  debug?: boolean;
  
  /**
   * Retry configuration for rate limiting and error handling
   */
  retryConfig?: RetryConfig;
}



/**
 * Standard HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * TallyApiClient - API client for interacting with Tally.so API with OAuth 2.0 support
 * 
 * This class provides a foundation for making HTTP requests to the Tally.so API
 * with proper configuration, OAuth 2.0 authentication, error handling, and type safety.
 */
/**
 * Circuit breaker states
 */
enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, rejecting requests
  HALF_OPEN = 'HALF_OPEN' // Testing if circuit can be closed
}

export class TallyApiClient {
  private axiosInstance: AxiosInstance;
  private config: Omit<Required<TallyApiClientConfig>, 'oauth2Config' | 'tokenStorage'> & {
    oauth2Config?: OAuth2Config;
    tokenStorage?: TokenStorage;
  };
  private tokenManager?: TokenManager;
  
  // Circuit breaker state
  private circuitBreakerState: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private consecutiveFailures: number = 0;
  private lastFailureTime?: Date;

  /**
   * Create a new TallyApiClient instance
   * 
   * @param config - Configuration options for the client
   */
  constructor(config: TallyApiClientConfig = {}) {
    // Set default configuration values
    this.config = {
      baseURL: config.baseURL || 'https://api.tally.so',
      timeout: config.timeout || 30000, // 30 seconds
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.defaultHeaders,
      },
      accessToken: config.accessToken || '',
      debug: config.debug || false,
      retryConfig: {
        maxAttempts: config.retryConfig?.maxAttempts ?? 3,
        baseDelayMs: config.retryConfig?.baseDelayMs ?? 1000,
        maxDelayMs: config.retryConfig?.maxDelayMs ?? 30000,
        exponentialBase: config.retryConfig?.exponentialBase ?? 2,
        jitterFactor: config.retryConfig?.jitterFactor ?? 0.1,
        enableCircuitBreaker: config.retryConfig?.enableCircuitBreaker ?? true,
        circuitBreakerThreshold: config.retryConfig?.circuitBreakerThreshold ?? 5,
        circuitBreakerTimeout: config.retryConfig?.circuitBreakerTimeout ?? 60000,
      },
    };

    // Add optional properties only if they are provided
    if (config.oauth2Config) {
      this.config.oauth2Config = config.oauth2Config;
    }
    if (config.tokenStorage) {
      this.config.tokenStorage = config.tokenStorage;
    }

    // Initialize TokenManager if OAuth2 config is provided
    if (this.config.oauth2Config) {
      this.tokenManager = new TokenManager(this.config.oauth2Config, this.config.tokenStorage);
    }

    // Initialize Axios instance with configuration
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.defaultHeaders,
      responseType: 'json',
    });

    // Add Authorization header if access token is provided
    if (this.config.accessToken) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    // Setup request/response interceptors
    this.setupInterceptors();
  }

  /**
   * Initialize OAuth 2.0 authentication flow
   * Returns the authorization URL that users should visit to grant permission
   * 
   * @param state - Optional state parameter for CSRF protection
   * @returns Authorization URL
   */
  public getAuthorizationUrl(state?: string): string {
    if (!this.tokenManager) {
      throw new Error('OAuth 2.0 configuration is required to get authorization URL');
    }
    return this.tokenManager.getAuthorizationUrl(state);
  }

  /**
   * Exchange authorization code for access token
   * This should be called after the user grants permission and you receive the authorization code
   * 
   * @param code - Authorization code from OAuth 2.0 callback
   * @returns Promise resolving to the token data
   */
  public async exchangeCodeForToken(code: string) {
    if (!this.tokenManager) {
      throw new AuthenticationError('OAuth 2.0 configuration is required to exchange code for token');
    }

    try {
      const token = await this.tokenManager.exchangeCodeForToken(code);
      // Update the axios instance with the new token
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
      return token;
    } catch (error) {
      throw new AuthenticationError('Failed to exchange code for token', undefined, undefined, undefined, error as Error);
    }
  }

  /**
   * Check if the client is authenticated
   * 
   * @returns Promise resolving to true if authenticated, false otherwise
   */
  public async isAuthenticated(): Promise<boolean> {
    if (this.config.accessToken) {
      return true; // Manual token is set
    }

    if (this.tokenManager) {
      return await this.tokenManager.hasValidToken();
    }

    return false;
  }

  /**
   * Refresh the access token
   * 
   * @returns Promise resolving to the new token data
   */
  public async refreshToken() {
    if (!this.tokenManager) {
      throw new AuthenticationError('OAuth 2.0 configuration is required to refresh token');
    }

    try {
      const token = await this.tokenManager.refreshToken();
      // Update the axios instance with the new token
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
      return token;
    } catch (error) {
      throw new AuthenticationError('Failed to refresh token', undefined, undefined, undefined, error as Error);
    }
  }

  /**
   * Clear the stored authentication token
   */
  public async clearAuthentication(): Promise<void> {
    if (this.tokenManager) {
      await this.tokenManager.clearToken();
    }
    this.config.accessToken = '';
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  /**
   * Update the access token for authentication (manual token management)
   * 
   * @param token - New access token
   */
  public setAccessToken(token: string): void {
    this.config.accessToken = token;
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get the current access token
   * 
   * @returns The current access token or empty string if not set
   */
  public getAccessToken(): string {
    return this.config.accessToken;
  }

  /**
   * Get the current token information (if using OAuth 2.0)
   */
  public async getCurrentToken() {
    if (!this.tokenManager) {
      return null;
    }
    return await this.tokenManager.getCurrentToken();
  }

  /**
   * Make a GET request to the specified endpoint
   * 
   * @param url - The endpoint URL (relative to base URL)
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the API response
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * Make a POST request to the specified endpoint
   * 
   * @param url - The endpoint URL (relative to base URL)
   * @param data - Request payload
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the API response
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * Make a PUT request to the specified endpoint
   * 
   * @param url - The endpoint URL (relative to base URL)
   * @param data - Request payload
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the API response
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * Make a DELETE request to the specified endpoint
   * 
   * @param url - The endpoint URL (relative to base URL)
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the API response
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Make a PATCH request to the specified endpoint
   * 
   * @param url - The endpoint URL (relative to base URL)
   * @param data - Request payload
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the API response
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  // ===============================
  // Type-Safe API Methods with Zod Validation
  // ===============================

  /**
   * Get form submissions with type-safe validation
   * 
   * @param formId - The form ID to get submissions for
   * @param options - Query parameters for filtering and pagination
   * @returns Promise resolving to validated submissions response
   */
  public async getSubmissions(
    formId: string,
    options: {
      page?: number;
      limit?: number;
      status?: 'all' | 'completed' | 'partial';
    } = {}
  ): Promise<TallySubmissionsResponse> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.status) params.append('status', options.status);

    const query = params.toString();
    const url = `/forms/${formId}/submissions${query ? `?${query}` : ''}`;
    
    const response = await this.get(url);
    return validateTallyResponse(TallySubmissionsResponseSchema, response.data);
  }

  /**
   * Get a specific submission with type-safe validation
   * 
   * @param formId - The form ID
   * @param submissionId - The submission ID
   * @returns Promise resolving to validated submission
   */
  public async getSubmission(formId: string, submissionId: string): Promise<TallySubmission> {
    const url = `/forms/${formId}/submissions/${submissionId}`;
    const response = await this.get(url);
    return validateTallyResponse(TallySubmissionSchema, response.data);
  }

  /**
   * Get all forms with type-safe validation
   * 
   * @param options - Query parameters for filtering and pagination
   * @returns Promise resolving to validated forms response
   */
  public async getForms(options: {
    page?: number;
    limit?: number;
    workspaceId?: string;
  } = {}): Promise<TallyFormsResponse> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.workspaceId) params.append('workspaceId', options.workspaceId);

    const query = params.toString();
    const url = `/forms${query ? `?${query}` : ''}`;
    
    const response = await this.get(url);
    return validateTallyResponse(TallyFormsResponseSchema, response.data);
  }

  /**
   * Get a specific form with type-safe validation
   * 
   * @param formId - The form ID
   * @returns Promise resolving to validated form
   */
  public async getForm(formId: string): Promise<TallyForm> {
    const url = `/forms/${formId}`;
    const response = await this.get(url);
    return validateTallyResponse(TallyFormSchema, response.data);
  }

  /**
   * Get workspaces with type-safe validation
   * 
   * @param options - Query parameters for filtering and pagination
   * @returns Promise resolving to validated workspaces response
   */
  public async getWorkspaces(options: {
    page?: number;
    limit?: number;
  } = {}): Promise<TallyWorkspacesResponse> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const query = params.toString();
    const url = `/workspaces${query ? `?${query}` : ''}`;
    
    const response = await this.get(url);
    return validateTallyResponse(TallyWorkspacesResponseSchema, response.data);
  }

  /**
   * Get a specific workspace with type-safe validation
   * 
   * @param workspaceId - The workspace ID
   * @returns Promise resolving to validated workspace
   */
  public async getWorkspace(workspaceId: string): Promise<TallyWorkspace> {
    const url = `/workspaces/${workspaceId}`;
    const response = await this.get(url);
    return validateTallyResponse(TallyWorkspaceSchema, response.data);
  }

  /**
   * Safely parse and validate any Tally API response using a provided schema
   * 
   * @param schema - Zod schema to validate against
   * @param data - Raw response data to validate
   * @returns Safe parse result with success/error information
   */
  public validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): z.SafeParseReturnType<unknown, T> {
    return safeParseTallyResponse(schema, data);
  }

  /**
   * Make a type-safe request that validates the response against a schema
   * 
   * @param method - HTTP method
   * @param url - The endpoint URL
   * @param schema - Zod schema to validate response against
   * @param data - Request payload (for POST, PUT, PATCH)
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to validated response data
   */
  public async requestWithValidation<T>(
    method: HttpMethod,
    url: string,
    schema: z.ZodSchema<T>,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.request(method, url, data, config);
    return validateTallyResponse(schema, response.data);
  }

    /**
   * Make a generic HTTP request with interceptor-based authentication and error handling
   * 
   * @param method - HTTP method
   * @param url - The endpoint URL (relative to base URL)
   * @param data - Request payload (for POST, PUT, PATCH)
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to the API response
   */
  private async request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const requestConfig: AxiosRequestConfig = {
      method,
      url,
      data,
      ...config,
    };

    // The interceptors will handle authentication and error handling
    const response: AxiosResponse<T> = await this.axiosInstance.request(requestConfig);

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  }

  /**
   * Ensure the client is authenticated before making requests
   */
  private async ensureAuthenticated(): Promise<void> {
    // If manual token is set, we're good
    if (this.config.accessToken) {
      return;
    }

    // If we have a token manager, get the current token
    if (this.tokenManager) {
      const accessToken = await this.tokenManager.getAccessToken();
      if (accessToken) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return;
      }
    }

    // No valid authentication found
    throw new AuthenticationError('No valid authentication found. Please authenticate first.', 401, 'Unauthorized');
  }

  /**
   * Get the underlying Axios instance for advanced usage
   * 
   * @returns The configured Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Get the current client configuration
   * 
   * @returns The current configuration object
   */
  public getConfig(): Readonly<Omit<Required<TallyApiClientConfig>, 'oauth2Config' | 'tokenStorage'> & {
    oauth2Config?: OAuth2Config;
    tokenStorage?: TokenStorage;
  }> {
    return { ...this.config };
  }

  /**
   * Get the token manager instance (if configured)
   */
  public getTokenManager(): TokenManager | undefined {
    return this.tokenManager;
  }

  /**
   * Calculate exponential backoff delay with jitter
   * 
   * @param attempt - Current attempt number (0-based)
   * @param baseDelay - Base delay in milliseconds
   * @param exponentialBase - Exponential base multiplier
   * @param maxDelay - Maximum delay in milliseconds
   * @param jitterFactor - Jitter factor for randomness
   * @returns Delay in milliseconds
   */
  private calculateBackoffDelay(
    attempt: number,
    baseDelay: number,
    exponentialBase: number,
    maxDelay: number,
    jitterFactor: number
  ): number {
    // Calculate exponential delay: baseDelay * (exponentialBase ^ attempt)
    const exponentialDelay = baseDelay * Math.pow(exponentialBase, attempt);
    
    // Apply maximum delay cap
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    
    // Add jitter to prevent thundering herd effect
    // Jitter range: [cappedDelay * (1 - jitterFactor), cappedDelay * (1 + jitterFactor)]
    const jitterRange = cappedDelay * jitterFactor;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    
    return Math.max(0, Math.floor(cappedDelay + jitter));
  }

  /**
   * Check if a request should be retried based on error type and circuit breaker state
   * 
   * @param error - The error that occurred
   * @param attempt - Current attempt number (0-based)
   * @returns True if the request should be retried
   */
  private shouldRetry(error: any, attempt: number): boolean {
    const { retryConfig } = this.config;
    
    // Don't retry if we've reached the maximum attempts
    if (attempt >= retryConfig.maxAttempts!) {
      return false;
    }
    
    // Check circuit breaker state
    if (retryConfig.enableCircuitBreaker && this.circuitBreakerState === CircuitBreakerState.OPEN) {
      // Check if we should transition to half-open
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime.getTime() >= retryConfig.circuitBreakerTimeout!) {
        this.circuitBreakerState = CircuitBreakerState.HALF_OPEN;
        if (this.config.debug) {
          console.log('[TallyApiClient] Circuit breaker transitioning to HALF_OPEN');
        }
      } else {
        return false; // Circuit is still open
      }
    }
    
    // Only retry for retryable errors
    if (error instanceof TallyApiError) {
      return error.isRetryable;
    }
    
    // Retry for network errors and timeouts
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }
    
    return false;
  }

  /**
   * Update circuit breaker state based on request success/failure
   * 
   * @param success - Whether the request was successful
   */
  private updateCircuitBreakerState(success: boolean): void {
    const { retryConfig } = this.config;
    
    if (!retryConfig.enableCircuitBreaker) {
      return;
    }
    
    if (success) {
      // Reset failure count and close circuit on success
      this.consecutiveFailures = 0;
      if (this.circuitBreakerState !== CircuitBreakerState.CLOSED) {
        this.circuitBreakerState = CircuitBreakerState.CLOSED;
        if (this.config.debug) {
          console.log('[TallyApiClient] Circuit breaker CLOSED after successful request');
        }
      }
    } else {
      // Increment failure count
      this.consecutiveFailures++;
      this.lastFailureTime = new Date();
      
      // Open circuit if threshold is reached
      if (this.consecutiveFailures >= retryConfig.circuitBreakerThreshold! &&
          this.circuitBreakerState === CircuitBreakerState.CLOSED) {
        this.circuitBreakerState = CircuitBreakerState.OPEN;
        if (this.config.debug) {
          console.log(`[TallyApiClient] Circuit breaker OPENED after ${this.consecutiveFailures} consecutive failures`);
        }
      }
    }
  }

  /**
   * Sleep for the specified number of milliseconds
   * 
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle response errors with retry logic and circuit breaker
   * 
   * @param error - The axios error that occurred
   * @param attempt - Current attempt number (0-based)
   * @returns Promise that resolves with the response or rejects with the final error
   */
  private async handleResponseError(error: AxiosError, attempt: number): Promise<any> {
    const { retryConfig } = this.config;
    
    if (this.config.debug) {
      console.error(`[TallyApiClient] Response Error (attempt ${attempt + 1}):`, error.response?.status, error.response?.statusText);
    }

    // Update circuit breaker state on failure
    this.updateCircuitBreakerState(false);

    // Handle network errors
    if (!error.response) {
      const networkError = this.createNetworkError(error);
      
      // Check if we should retry network errors
      if (this.shouldRetry(networkError, attempt)) {
        return this.retryRequest(error, attempt);
      }
      
      return Promise.reject(networkError);
    }

    const { status, statusText, headers, data } = error.response;

    // Handle authentication errors with automatic token refresh
    if (status === 401 || status === 403) {
      // Try to refresh token if we have a token manager
      if (this.tokenManager && attempt === 0) { // Only try refresh on first attempt
        try {
          await this.refreshToken();
          // Retry the original request with the new token
          const originalRequest = error.config;
          if (originalRequest) {
            return this.axiosInstance.request(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear authentication
          await this.clearAuthentication();
          return Promise.reject(
            new AuthenticationError(
              'Authentication failed and token refresh failed',
              status,
              statusText,
              headers as Record<string, string>,
              refreshError as Error
            )
          );
        }
      }
      
      // If no token manager or refresh failed, throw authentication error
      const authError = createErrorFromResponse(
        status,
        statusText,
        headers as Record<string, string>,
        data,
        error
      );
      
      return Promise.reject(authError);
    }

    // Handle rate limiting (429) with exponential backoff
    if (status === 429) {
      const rateLimitError = createErrorFromResponse(
        status,
        statusText,
        headers as Record<string, string>,
        data,
        error
      ) as RateLimitError;
      
      if (this.shouldRetry(rateLimitError, attempt)) {
        // Calculate backoff delay - use retry-after header if available
        let delay: number;
        if (rateLimitError.retryAfter) {
          // API provided retry-after in seconds
          delay = rateLimitError.retryAfter * 1000;
        } else {
          // Use exponential backoff
          delay = this.calculateBackoffDelay(
            attempt,
            retryConfig.baseDelayMs!,
            retryConfig.exponentialBase!,
            retryConfig.maxDelayMs!,
            retryConfig.jitterFactor!
          );
        }
        
        if (this.config.debug) {
          console.log(`[TallyApiClient] Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts})`);
        }
        
        // Wait for the calculated delay then retry
        await this.sleep(delay);
        return this.retryRequest(error, attempt);
      }
      
      return Promise.reject(rateLimitError);
    }

    // Handle other retryable errors (5xx server errors)
    const standardizedError = createErrorFromResponse(
      status,
      statusText,
      headers as Record<string, string>,
      data,
      error
    );

    if (this.shouldRetry(standardizedError, attempt)) {
      return this.retryRequest(error, attempt);
    }

    return Promise.reject(standardizedError);
  }

  /**
   * Retry a failed request with exponential backoff
   * 
   * @param originalError - The original axios error
   * @param attempt - Current attempt number (0-based)
   * @returns Promise that resolves with the response or rejects with the final error
   */
  private async retryRequest(originalError: AxiosError, attempt: number): Promise<any> {
    const { retryConfig } = this.config;
    const nextAttempt = attempt + 1;
    
    // Calculate delay for non-rate-limit retries
    const delay = this.calculateBackoffDelay(
      attempt,
      retryConfig.baseDelayMs!,
      retryConfig.exponentialBase!,
      retryConfig.maxDelayMs!,
      retryConfig.jitterFactor!
    );
    
    if (this.config.debug) {
      console.log(`[TallyApiClient] Retrying request in ${delay}ms (attempt ${nextAttempt + 1}/${retryConfig.maxAttempts})`);
    }
    
    // Wait for the calculated delay
    await this.sleep(delay);
    
    // Retry the original request
    const originalRequest = originalError.config;
    if (originalRequest) {
      try {
        return await this.axiosInstance.request(originalRequest);
      } catch (retryError) {
        // Recursively handle the retry error
        return this.handleResponseError(retryError as AxiosError, nextAttempt);
      }
    }
    
    // If we can't retry, reject with the original error
    return Promise.reject(originalError);
  }

  /**
   * Create appropriate network error based on error code
   * 
   * @param error - The axios error
   * @returns Appropriate TallyApiError instance
   */
  private createNetworkError(error: AxiosError): TallyApiError {
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      return new NetworkError('Network connection failed', error);
    }
    if (error.code === 'ECONNRESET' || error.message?.includes('timeout')) {
      return new TimeoutError('Request timeout', error);
    }
    return new NetworkError('Network error occurred', error);
  }

  /**
   * Setup request/response interceptors for authentication and error handling
   */
  private setupInterceptors(): void {
    // Request interceptor for automatic authentication and logging
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Ensure we have a valid token before making the request
        await this.ensureAuthenticated();

        // Debug logging if enabled
        if (this.config.debug) {
          console.log(`[TallyApiClient] Request: ${config.method?.toUpperCase()} ${config.url}`);
          if (config.data) {
            console.log(`[TallyApiClient] Request Data:`, config.data);
          }
        }

        return config;
      },
      (error) => {
        if (this.config.debug) {
          console.error('[TallyApiClient] Request Error:', error);
        }
        
        // Convert to appropriate error type
        if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
          return Promise.reject(new NetworkError('Network connection failed', error));
        }
        if (error.code === 'ECONNRESET' || error.message?.includes('timeout')) {
          return Promise.reject(new TimeoutError('Request timeout', error));
        }
        
        return Promise.reject(error);
      }
    );

    // Response interceptor for standardized error handling, retry logic, and logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Update circuit breaker state on success
        this.updateCircuitBreakerState(true);
        
        // Debug logging if enabled
        if (this.config.debug) {
          console.log(`[TallyApiClient] Response: ${response.status} ${response.statusText}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error, 0);
      }
    );
  }
} 