/**
 * TokenManager - Handles OAuth 2.0 token storage, expiration checking, and refresh operations
 */

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number; // Unix timestamp when token expires
  scope: string;
}

export interface TokenStorage {
  getToken(): Promise<Token | null>;
  setToken(token: Token): Promise<void>;
  clearToken(): Promise<void>;
}

/**
 * In-memory token storage (for development/testing)
 * In production, you should use a secure storage mechanism
 */
export class MemoryTokenStorage implements TokenStorage {
  private token: Token | null = null;

  async getToken(): Promise<Token | null> {
    return this.token;
  }

  async setToken(token: Token): Promise<void> {
    this.token = token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
  }
}

/**
 * OAuth 2.0 credentials configuration
 */
export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

/**
 * TokenManager - Manages OAuth 2.0 tokens for Tally API
 */
export class TokenManager {
  private storage: TokenStorage;
  private oauth2Config: OAuth2Config;

  constructor(oauth2Config: OAuth2Config, storage?: TokenStorage) {
    this.oauth2Config = oauth2Config;
    this.storage = storage || new MemoryTokenStorage();
  }

  /**
   * Get the authorization URL for OAuth 2.0 flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.oauth2Config.clientId,
      redirect_uri: this.oauth2Config.redirectUri,
      response_type: 'code',
      scope: this.oauth2Config.scopes?.join(' ') || 'user forms responses webhooks',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://tally.so/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<Token> {
    const response = await fetch('https://api.tally.so/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: this.oauth2Config.clientId,
        client_secret: this.oauth2Config.clientSecret,
        redirect_uri: this.oauth2Config.redirectUri,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const tokenData = await response.json();
    const token = this.processTokenResponse(tokenData);
    await this.storage.setToken(token);
    return token;
  }

  /**
   * Get current access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string | null> {
    const token = await this.storage.getToken();
    if (!token) {
      return null;
    }

    // Check if token is expired (with 5-minute buffer)
    const now = Math.floor(Date.now() / 1000);
    const bufferTime = 5 * 60; // 5 minutes
    if (token.expires_at <= now + bufferTime) {
      try {
        const refreshedToken = await this.refreshToken(token.refresh_token);
        return refreshedToken.access_token;
      } catch (error) {
        // If refresh fails, clear the token and return null
        await this.storage.clearToken();
        return null;
      }
    }

    return token.access_token;
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(refreshToken?: string): Promise<Token> {
    let tokenToRefresh = refreshToken;
    
    if (!tokenToRefresh) {
      const currentToken = await this.storage.getToken();
      if (!currentToken) {
        throw new Error('No token available to refresh');
      }
      tokenToRefresh = currentToken.refresh_token;
    }

    const response = await fetch('https://api.tally.so/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: this.oauth2Config.clientId,
        client_secret: this.oauth2Config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: tokenToRefresh,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const tokenData = await response.json();
    const token = this.processTokenResponse(tokenData);
    await this.storage.setToken(token);
    return token;
  }

  /**
   * Check if we have a valid token
   */
  async hasValidToken(): Promise<boolean> {
    const token = await this.storage.getToken();
    if (!token) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return token.expires_at > now;
  }

  /**
   * Clear the stored token
   */
  async clearToken(): Promise<void> {
    await this.storage.clearToken();
  }

  /**
   * Get the current token (if any)
   */
  async getCurrentToken(): Promise<Token | null> {
    return await this.storage.getToken();
  }

  /**
   * Set a token directly (useful for testing or when receiving tokens from other sources)
   */
  async setToken(token: Token): Promise<void> {
    await this.storage.setToken(token);
  }

  /**
   * Process the token response from Tally API and add expiration timestamp
   */
  private processTokenResponse(tokenData: any): Token {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = tokenData.expires_in || 3600; // Default to 1 hour if not specified

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_type: tokenData.token_type || 'Bearer',
      expires_in: expiresIn,
      expires_at: now + expiresIn,
      scope: tokenData.scope || '',
    };
  }

  /**
   * Get OAuth 2.0 configuration
   */
  getOAuth2Config(): Readonly<OAuth2Config> {
    return { ...this.oauth2Config };
  }
} 