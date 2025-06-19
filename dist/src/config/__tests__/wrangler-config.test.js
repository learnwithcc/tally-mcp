import fs from 'fs';
import { getWranglerConfig } from '../wrangler-config';
jest.mock('fs');
const mockFs = fs;
jest.mock('../env', () => ({
    env: {
        TALLY_API_KEY: 'test-api-key',
        CLOUDFLARE_ACCOUNT_ID: 'test-account-id',
        CLOUDFLARE_API_TOKEN: 'test-api-token',
        NODE_ENV: 'test'
    }
}));
describe('Wrangler Configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('getWranglerConfig', () => {
        it('should successfully parse valid wrangler.toml', () => {
            const validToml = `
name = "tally-mcp"
compatibility_date = "2023-12-01"
node_compat = true

[[kv_namespaces]]
binding = "CACHE"
id = "cache-namespace-id"

[vars]
ENVIRONMENT = "production"
`;
            mockFs.readFileSync.mockReturnValue(validToml);
            const result = getWranglerConfig();
            expect(mockFs.readFileSync).toHaveBeenCalledWith('wrangler.toml', 'utf-8');
            expect(result).toEqual({
                name: 'tally-mcp',
                compatibility_date: '2023-12-01',
                node_compat: true,
                kv_namespaces: [
                    {
                        binding: 'CACHE',
                        id: 'cache-namespace-id'
                    }
                ],
                vars: {
                    ENVIRONMENT: 'production'
                }
            });
        });
        it('should successfully parse minimal valid wrangler.toml', () => {
            const minimalToml = `
name = "tally-mcp"
compatibility_date = "2023-12-01"
`;
            mockFs.readFileSync.mockReturnValue(minimalToml);
            const result = getWranglerConfig();
            expect(result).toEqual({
                name: 'tally-mcp',
                compatibility_date: '2023-12-01'
            });
        });
        it('should use custom path when provided', () => {
            const customPath = 'custom/wrangler.toml';
            const validToml = `
name = "custom-app"
compatibility_date = "2023-12-01"
`;
            mockFs.readFileSync.mockReturnValue(validToml);
            const result = getWranglerConfig(customPath);
            expect(mockFs.readFileSync).toHaveBeenCalledWith(customPath, 'utf-8');
            expect(result.name).toBe('custom-app');
        });
        it('should throw error when file cannot be read', () => {
            const error = new Error('File not found');
            mockFs.readFileSync.mockImplementation(() => {
                throw error;
            });
            expect(() => getWranglerConfig()).toThrow('Failed to read wrangler.toml from wrangler.toml: File not found');
        });
        it('should throw error when TOML is invalid', () => {
            const invalidToml = `
name = "tally-mcp"
compatibility_date = 2023-12-01  # Invalid - missing quotes
invalid_toml = [unclosed array
`;
            mockFs.readFileSync.mockReturnValue(invalidToml);
            expect(() => getWranglerConfig()).toThrow(/Failed to parse wrangler\.toml/);
        });
        it('should throw error when name is missing', () => {
            const invalidToml = `
compatibility_date = "2023-12-01"
`;
            mockFs.readFileSync.mockReturnValue(invalidToml);
            expect(() => getWranglerConfig()).toThrow(/Invalid wrangler\.toml configuration/);
        });
        it('should throw error when name is empty', () => {
            const invalidToml = `
name = ""
compatibility_date = "2023-12-01"
`;
            mockFs.readFileSync.mockReturnValue(invalidToml);
            expect(() => getWranglerConfig()).toThrow(/Invalid wrangler\.toml configuration/);
        });
        it('should throw error when compatibility_date is missing', () => {
            const invalidToml = `
name = "tally-mcp"
`;
            mockFs.readFileSync.mockReturnValue(invalidToml);
            expect(() => getWranglerConfig()).toThrow(/Invalid wrangler\.toml configuration/);
        });
        it('should throw error when compatibility_date format is invalid', () => {
            const invalidToml = `
name = "tally-mcp"
compatibility_date = "2023/12/01"
`;
            mockFs.readFileSync.mockReturnValue(invalidToml);
            expect(() => getWranglerConfig()).toThrow(/Invalid wrangler\.toml configuration/);
        });
        it('should throw error when kv_namespaces binding is missing', () => {
            const invalidToml = `
name = "tally-mcp"
compatibility_date = "2023-12-01"

[[kv_namespaces]]
id = "cache-namespace-id"
`;
            mockFs.readFileSync.mockReturnValue(invalidToml);
            expect(() => getWranglerConfig()).toThrow(/Invalid wrangler\.toml configuration/);
        });
        it('should throw error when kv_namespaces id is missing', () => {
            const invalidToml = `
name = "tally-mcp"
compatibility_date = "2023-12-01"

[[kv_namespaces]]
binding = "CACHE"
`;
            mockFs.readFileSync.mockReturnValue(invalidToml);
            expect(() => getWranglerConfig()).toThrow(/Invalid wrangler\.toml configuration/);
        });
        it('should warn when secrets are defined in plaintext', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
            const tomlWithSecrets = `
name = "tally-mcp"
compatibility_date = "2023-12-01"

[vars]
TALLY_API_KEY = "plaintext-secret"
CLOUDFLARE_ACCOUNT_ID = "plaintext-account"
NORMAL_VAR = "normal-value"
`;
            mockFs.readFileSync.mockReturnValue(tomlWithSecrets);
            const result = getWranglerConfig();
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: The following secrets are defined in plaintext in wrangler.toml: TALLY_API_KEY, CLOUDFLARE_ACCOUNT_ID'));
            expect(result.vars).toEqual({
                TALLY_API_KEY: 'plaintext-secret',
                CLOUDFLARE_ACCOUNT_ID: 'plaintext-account',
                NORMAL_VAR: 'normal-value'
            });
        });
        it('should not warn when no secrets are in plaintext', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
            const tomlWithoutSecrets = `
name = "tally-mcp"
compatibility_date = "2023-12-01"

[vars]
NORMAL_VAR = "normal-value"
`;
            mockFs.readFileSync.mockReturnValue(tomlWithoutSecrets);
            getWranglerConfig();
            expect(warnSpy).not.toHaveBeenCalled();
        });
        it('should handle secrets array correctly', () => {
            const tomlWithSecrets = `
name = "tally-mcp"
compatibility_date = "2023-12-01"

secrets = ["SECRET_KEY", "API_TOKEN"]
`;
            mockFs.readFileSync.mockReturnValue(tomlWithSecrets);
            const result = getWranglerConfig();
            expect(result.secrets).toEqual(['SECRET_KEY', 'API_TOKEN']);
        });
        it('should handle multiple kv_namespaces', () => {
            const tomlWithMultipleKV = `
name = "tally-mcp"
compatibility_date = "2023-12-01"

[[kv_namespaces]]
binding = "CACHE"
id = "cache-namespace-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "sessions-namespace-id"
`;
            mockFs.readFileSync.mockReturnValue(tomlWithMultipleKV);
            const result = getWranglerConfig();
            expect(result.kv_namespaces).toEqual([
                {
                    binding: 'CACHE',
                    id: 'cache-namespace-id'
                },
                {
                    binding: 'SESSIONS',
                    id: 'sessions-namespace-id'
                }
            ]);
        });
    });
});
//# sourceMappingURL=wrangler-config.test.js.map