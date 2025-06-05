import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenManager, OAuth2Config, TokenStorage } from './TokenManager';
import {
  TallyApiError,
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
  createErrorFromResponse,
} from '../models';

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
export class TallyApiClient {
  private axiosInstance: AxiosInstance;
  private config: Omit<Required<TallyApiClientConfig>, 'oauth2Config' | 'tokenStorage'> & {
    oauth2Config?: OAuth2Config;
    tokenStorage?: TokenStorage;
  };
  private tokenManager?: TokenManager;

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

    // Response interceptor for standardized error handling and logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Debug logging if enabled
        if (this.config.debug) {
          console.log(`[TallyApiClient] Response: ${response.status} ${response.statusText}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        if (this.config.debug) {
          console.error('[TallyApiClient] Response Error:', error.response?.status, error.response?.statusText);
        }

        // Handle network errors
        if (!error.response) {
          if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
            return Promise.reject(new NetworkError('Network connection failed', error));
          }
          if (error.code === 'ECONNRESET' || error.message?.includes('timeout')) {
            return Promise.reject(new TimeoutError('Request timeout', error));
          }
          return Promise.reject(new NetworkError('Network error occurred', error));
        }

        const { status, statusText, headers, data } = error.response;

        // Handle authentication errors with automatic token refresh
        if (status === 401 || status === 403) {
          // Try to refresh token if we have a token manager
          if (this.tokenManager) {
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
          return Promise.reject(
            createErrorFromResponse(
              status,
              statusText,
              headers as Record<string, string>,
              data,
              error
            )
          );
        }

        // Create standardized error for all other cases
        const standardizedError = createErrorFromResponse(
          status,
          statusText,
          headers as Record<string, string>,
          data,
          error
        );

        return Promise.reject(standardizedError);
      }
    );
  }
} 