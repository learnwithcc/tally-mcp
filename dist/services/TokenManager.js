"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = exports.MemoryTokenStorage = void 0;
class MemoryTokenStorage {
    constructor() {
        this.token = null;
    }
    async getToken() {
        return this.token;
    }
    async setToken(token) {
        this.token = token;
    }
    async clearToken() {
        this.token = null;
    }
}
exports.MemoryTokenStorage = MemoryTokenStorage;
class TokenManager {
    constructor(oauth2Config, storage) {
        this.oauth2Config = oauth2Config;
        this.storage = storage || new MemoryTokenStorage();
    }
    getAuthorizationUrl(state) {
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
    async exchangeCodeForToken(code) {
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
    async getAccessToken() {
        const token = await this.storage.getToken();
        if (!token) {
            return null;
        }
        const now = Math.floor(Date.now() / 1000);
        const bufferTime = 5 * 60;
        if (token.expires_at <= now + bufferTime) {
            try {
                const refreshedToken = await this.refreshToken(token.refresh_token);
                return refreshedToken.access_token;
            }
            catch (error) {
                await this.storage.clearToken();
                return null;
            }
        }
        return token.access_token;
    }
    async refreshToken(refreshToken) {
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
    async hasValidToken() {
        const token = await this.storage.getToken();
        if (!token) {
            return false;
        }
        const now = Math.floor(Date.now() / 1000);
        return token.expires_at > now;
    }
    async clearToken() {
        await this.storage.clearToken();
    }
    async getCurrentToken() {
        return await this.storage.getToken();
    }
    async setToken(token) {
        await this.storage.setToken(token);
    }
    processTokenResponse(tokenData) {
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = tokenData.expires_in || 3600;
        return {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_type: tokenData.token_type || 'Bearer',
            expires_in: expiresIn,
            expires_at: now + expiresIn,
            scope: tokenData.scope || '',
        };
    }
    getOAuth2Config() {
        return { ...this.oauth2Config };
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=TokenManager.js.map