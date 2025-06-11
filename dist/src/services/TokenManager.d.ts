export interface Token {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number;
    scope: string;
}
export interface TokenStorage {
    getToken(): Promise<Token | null>;
    setToken(token: Token): Promise<void>;
    clearToken(): Promise<void>;
}
export declare class MemoryTokenStorage implements TokenStorage {
    private token;
    getToken(): Promise<Token | null>;
    setToken(token: Token): Promise<void>;
    clearToken(): Promise<void>;
}
export interface OAuth2Config {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes?: string[];
}
export declare class TokenManager {
    private storage;
    private oauth2Config;
    constructor(oauth2Config: OAuth2Config, storage?: TokenStorage);
    getAuthorizationUrl(state?: string): string;
    exchangeCodeForToken(code: string): Promise<Token>;
    getAccessToken(): Promise<string | null>;
    refreshToken(refreshToken?: string): Promise<Token>;
    hasValidToken(): Promise<boolean>;
    clearToken(): Promise<void>;
    getCurrentToken(): Promise<Token | null>;
    setToken(token: Token): Promise<void>;
    private processTokenResponse;
    getOAuth2Config(): Readonly<OAuth2Config>;
}
//# sourceMappingURL=TokenManager.d.ts.map