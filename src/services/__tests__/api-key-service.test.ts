import { ApiKeyService } from '../api-key-service';
import { ApiKeyStatus, ApiKeyScope } from '../../models/api-key';
import { CryptoUtils } from '../../utils/crypto';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    API_KEY_ENCRYPTION_KEY: 'test-encryption-key-32-bytes-long',
    JWT_SECRET: 'test-jwt-secret'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('ApiKeyService', () => {
  let apiKeyService: ApiKeyService;

  beforeEach(() => {
    apiKeyService = new ApiKeyService();
  });

  describe('createApiKey', () => {
    it('should create a new API key with valid input', async () => {
      const input = {
        name: 'Test API Key',
        description: 'A test API key',
        scopes: [ApiKeyScope.READ, ApiKeyScope.WRITE],
        maxUsage: 1000
      };

      const result = await apiKeyService.createApiKey(input, 'test-user');

      expect(result).toMatchObject({
        name: 'Test API Key',
        description: 'A test API key',
        scopes: [ApiKeyScope.READ, ApiKeyScope.WRITE],
        status: ApiKeyStatus.ACTIVE,
        usageCount: 0,
        maxUsage: 1000,
        createdBy: 'test-user'
      });
      expect(result.key).toBeDefined();
      expect(result.key).toMatch(/^tally_/);
      expect(result.id).toBeDefined();
      expect(result.keyHash).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create API key without optional fields', async () => {
      const input = {
        name: 'Minimal API Key',
        scopes: [ApiKeyScope.READ]
      };

      const result = await apiKeyService.createApiKey(input);

      expect(result.name).toBe('Minimal API Key');
      expect(result.scopes).toEqual([ApiKeyScope.READ]);
      expect(result.description).toBeUndefined();
      expect(result.maxUsage).toBeUndefined();
      expect(result.createdBy).toBeUndefined();
    });

    it('should throw error for invalid input', async () => {
      const input = {
        name: '', // Invalid: empty name
        scopes: [] // Invalid: no scopes
      };

      await expect(apiKeyService.createApiKey(input)).rejects.toThrow();
    });
  });

  describe('validateApiKey', () => {
    let testApiKey: any;

    beforeEach(async () => {
      testApiKey = await apiKeyService.createApiKey({
        name: 'Test Key',
        scopes: [ApiKeyScope.READ, ApiKeyScope.WRITE],
        maxUsage: 100
      });
    });

    it('should validate a valid API key', async () => {
      const result = await apiKeyService.validateApiKey({
        key: testApiKey.key,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        endpoint: 'GET /test'
      });

      expect(result.isValid).toBe(true);
      expect(result.apiKey).toBeDefined();
      expect(result.apiKey?.name).toBe('Test Key');
      expect(result.remainingUsage).toBe(99); // 100 - 1
      expect(result.errorReason).toBeUndefined();
    });

    it('should reject invalid API key format', async () => {
      const result = await apiKeyService.validateApiKey({
        key: 'invalid-key-format'
      });

      expect(result.isValid).toBe(false);
      expect(result.errorReason).toBe('Invalid API key format');
    });

    it('should reject non-existent API key', async () => {
      const fakeKey = CryptoUtils.generateApiKey();
      
      const result = await apiKeyService.validateApiKey({
        key: fakeKey
      });

      expect(result.isValid).toBe(false);
      expect(result.errorReason).toBe('API key not found');
    });

    it('should reject revoked API key', async () => {
      // Revoke the key first
      await apiKeyService.revokeApiKey(testApiKey.id);

      const result = await apiKeyService.validateApiKey({
        key: testApiKey.key
      });

      expect(result.isValid).toBe(false);
      expect(result.errorReason).toBe('API key is revoked');
    });

    it('should reject expired API key', async () => {
      // Create an expired key
      const expiredKey = await apiKeyService.createApiKey({
        name: 'Expired Key',
        scopes: [ApiKeyScope.READ],
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      });

      const result = await apiKeyService.validateApiKey({
        key: expiredKey.key
      });

      expect(result.isValid).toBe(false);
      expect(result.errorReason).toBe('API key expired');
    });

    it('should reject key that exceeded usage limit', async () => {
      // Create a key with usage limit of 1
      const limitedKey = await apiKeyService.createApiKey({
        name: 'Limited Key',
        scopes: [ApiKeyScope.READ],
        maxUsage: 1
      });

      // Use it once (should succeed)
      const firstResult = await apiKeyService.validateApiKey({
        key: limitedKey.key
      });
      expect(firstResult.isValid).toBe(true);

      // Use it again (should fail)
      const secondResult = await apiKeyService.validateApiKey({
        key: limitedKey.key
      });
      expect(secondResult.isValid).toBe(false);
      expect(secondResult.errorReason).toBe('Usage limit exceeded');
    });

    it('should reject IP not in whitelist', async () => {
      // Create a key with IP whitelist
      const whitelistedKey = await apiKeyService.createApiKey({
        name: 'Whitelisted Key',
        scopes: [ApiKeyScope.READ],
        ipWhitelist: ['192.168.1.1', '10.0.0.1']
      });

      const result = await apiKeyService.validateApiKey({
        key: whitelistedKey.key,
        ipAddress: '127.0.0.1' // Not in whitelist
      });

      expect(result.isValid).toBe(false);
      expect(result.errorReason).toBe('IP address not whitelisted');
    });

    it('should accept IP in whitelist', async () => {
      // Create a key with IP whitelist
      const whitelistedKey = await apiKeyService.createApiKey({
        name: 'Whitelisted Key',
        scopes: [ApiKeyScope.READ],
        ipWhitelist: ['192.168.1.1', '10.0.0.1']
      });

      const result = await apiKeyService.validateApiKey({
        key: whitelistedKey.key,
        ipAddress: '192.168.1.1' // In whitelist
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('listApiKeys', () => {
    beforeEach(async () => {
      await apiKeyService.createApiKey({
        name: 'Active Key 1',
        scopes: [ApiKeyScope.READ]
      });
      
      const key2 = await apiKeyService.createApiKey({
        name: 'Active Key 2',
        scopes: [ApiKeyScope.WRITE]
      });
      
      // Revoke one key
      await apiKeyService.revokeApiKey(key2.id);
    });

    it('should list all API keys', async () => {
      const keys = await apiKeyService.listApiKeys();
      expect(keys).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const activeKeys = await apiKeyService.listApiKeys(ApiKeyStatus.ACTIVE);
      const revokedKeys = await apiKeyService.listApiKeys(ApiKeyStatus.REVOKED);
      
      expect(activeKeys).toHaveLength(1);
      expect(revokedKeys).toHaveLength(1);
      expect(activeKeys[0].name).toBe('Active Key 1');
      expect(revokedKeys[0].name).toBe('Active Key 2');
    });
  });

  describe('updateApiKey', () => {
    let testKey: any;

    beforeEach(async () => {
      testKey = await apiKeyService.createApiKey({
        name: 'Original Name',
        scopes: [ApiKeyScope.READ],
        description: 'Original description'
      });
    });

    it('should update API key fields', async () => {
      const updated = await apiKeyService.updateApiKey(testKey.id, {
        name: 'Updated Name',
        description: 'Updated description',
        scopes: [ApiKeyScope.READ, ApiKeyScope.WRITE]
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated description');
      expect(updated?.scopes).toEqual([ApiKeyScope.READ, ApiKeyScope.WRITE]);
    });

    it('should return null for non-existent key', async () => {
      const updated = await apiKeyService.updateApiKey('non-existent-id', {
        name: 'New Name'
      });

      expect(updated).toBeNull();
    });
  });

  describe('rotateApiKey', () => {
    let testKey: any;

    beforeEach(async () => {
      testKey = await apiKeyService.createApiKey({
        name: 'Rotation Test Key',
        scopes: [ApiKeyScope.READ]
      });
    });

    it('should rotate API key and return new key', async () => {
      const originalKey = testKey.key;
      const rotated = await apiKeyService.rotateApiKey(testKey.id);

      expect(rotated).toBeDefined();
      expect(rotated?.key).not.toBe(originalKey);
      expect(rotated?.key).toMatch(/^tally_/);
      expect(rotated?.id).toBe(testKey.id); // Same ID
      expect(rotated?.name).toBe(testKey.name); // Same name
      expect(rotated?.usageCount).toBe(0); // Reset usage count
    });

    it('should invalidate old key after rotation', async () => {
      const originalKey = testKey.key;
      await apiKeyService.rotateApiKey(testKey.id);

      // Old key should no longer work
      const result = await apiKeyService.validateApiKey({
        key: originalKey
      });

      expect(result.isValid).toBe(false);
      expect(result.errorReason).toBe('API key not found');
    });

    it('should return null for non-existent key', async () => {
      const rotated = await apiKeyService.rotateApiKey('non-existent-id');
      expect(rotated).toBeNull();
    });
  });

  describe('hasRequiredScopes', () => {
    it('should return true for admin scope', async () => {
      const adminKey = await apiKeyService.createApiKey({
        name: 'Admin Key',
        scopes: [ApiKeyScope.ADMIN]
      });

      const key = await apiKeyService.getApiKey(adminKey.id);
      const hasScopes = apiKeyService.hasRequiredScopes(key!, [ApiKeyScope.READ, ApiKeyScope.WRITE]);

      expect(hasScopes).toBe(true);
    });

    it('should return true when all required scopes are present', async () => {
      const key = await apiKeyService.createApiKey({
        name: 'Multi-scope Key',
        scopes: [ApiKeyScope.READ, ApiKeyScope.WRITE, ApiKeyScope.FORMS_READ]
      });

      const apiKey = await apiKeyService.getApiKey(key.id);
      const hasScopes = apiKeyService.hasRequiredScopes(apiKey!, [ApiKeyScope.READ, ApiKeyScope.FORMS_READ]);

      expect(hasScopes).toBe(true);
    });

    it('should return false when required scopes are missing', async () => {
      const key = await apiKeyService.createApiKey({
        name: 'Limited Key',
        scopes: [ApiKeyScope.READ]
      });

      const apiKey = await apiKeyService.getApiKey(key.id);
      const hasScopes = apiKeyService.hasRequiredScopes(apiKey!, [ApiKeyScope.READ, ApiKeyScope.WRITE]);

      expect(hasScopes).toBe(false);
    });
  });

  describe('getApiKeyStats', () => {
    beforeEach(async () => {
      // Create various keys with different statuses
      const key1 = await apiKeyService.createApiKey({
        name: 'Active Key 1',
        scopes: [ApiKeyScope.READ]
      });
      
      const key2 = await apiKeyService.createApiKey({
        name: 'Active Key 2',
        scopes: [ApiKeyScope.WRITE]
      });
      
      const key3 = await apiKeyService.createApiKey({
        name: 'Key to Revoke',
        scopes: [ApiKeyScope.READ]
      });

      // Revoke one key
      await apiKeyService.revokeApiKey(key3.id);

      // Use some keys to generate usage
      await apiKeyService.validateApiKey({ key: key1.key });
      await apiKeyService.validateApiKey({ key: key2.key });
      await apiKeyService.validateApiKey({ key: key2.key });
    });

    it('should return correct statistics', async () => {
      const stats = await apiKeyService.getApiKeyStats();

      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.revoked).toBe(1);
      expect(stats.expired).toBe(0);
      expect(stats.totalUsage).toBe(3); // 1 + 2 + 0
    });
  });

  describe('setupRotation', () => {
    let testKey: any;

    beforeEach(async () => {
      testKey = await apiKeyService.createApiKey({
        name: 'Rotation Setup Key',
        scopes: [ApiKeyScope.READ]
      });
    });

    it('should setup rotation configuration', async () => {
      const config = await apiKeyService.setupRotation(testKey.id, {
        rotationIntervalDays: 30,
        notifyDaysBefore: 7,
        autoRotate: true,
        isActive: true
      });

      expect(config).toBeDefined();
      expect(config?.keyId).toBe(testKey.id);
      expect(config?.rotationIntervalDays).toBe(30);
      expect(config?.notifyDaysBefore).toBe(7);
      expect(config?.autoRotate).toBe(true);
      expect(config?.isActive).toBe(true);
      expect(config?.nextRotationAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent key', async () => {
      const config = await apiKeyService.setupRotation('non-existent-id', {
        rotationIntervalDays: 30,
        notifyDaysBefore: 7,
        autoRotate: true,
        isActive: true
      });

      expect(config).toBeNull();
    });
  });

  describe('getUsageLogs', () => {
    let testKey: any;

    beforeEach(async () => {
      testKey = await apiKeyService.createApiKey({
        name: 'Usage Log Key',
        scopes: [ApiKeyScope.READ]
      });

      // Generate some usage
      await apiKeyService.validateApiKey({
        key: testKey.key,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        endpoint: 'GET /test1'
      });

      await apiKeyService.validateApiKey({
        key: testKey.key,
        ipAddress: '192.168.1.1',
        userAgent: 'another-agent',
        endpoint: 'POST /test2'
      });
    });

    it('should return usage logs for a key', async () => {
      const logs = await apiKeyService.getUsageLogs(testKey.id);

      expect(logs).toHaveLength(2);
      expect(logs[0].success).toBe(true);
      expect(logs[0].ipAddress).toBe('127.0.0.1');
      expect(logs[0].endpoint).toBe('GET /test1');
      expect(logs[1].success).toBe(true);
      expect(logs[1].ipAddress).toBe('192.168.1.1');
      expect(logs[1].endpoint).toBe('POST /test2');
    });

    it('should limit number of logs returned', async () => {
      const logs = await apiKeyService.getUsageLogs(testKey.id, 1);
      expect(logs).toHaveLength(1);
    });
  });
});

describe('CryptoUtils', () => {
  beforeEach(() => {
    process.env.API_KEY_ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long';
  });

  describe('generateApiKey', () => {
    it('should generate API key with default options', () => {
      const key = CryptoUtils.generateApiKey();
      
      expect(key).toMatch(/^tally_/);
      expect(key).toMatch(/_[A-Za-z0-9_-]{8}$/); // Ends with checksum
    });

    it('should generate API key with custom options', () => {
      const key = CryptoUtils.generateApiKey({
        length: 16,
        prefix: 'custom_',
        includeChecksum: false
      });
      
      expect(key).toMatch(/^custom_/);
      expect(key).not.toMatch(/_[A-Za-z0-9_-]{8}$/); // No checksum
    });

    it('should throw error for invalid length', () => {
      expect(() => {
        CryptoUtils.generateApiKey({ length: 8 }); // Too short
      }).toThrow();

      expect(() => {
        CryptoUtils.generateApiKey({ length: 128 }); // Too long
      }).toThrow();
    });
  });

  describe('validateKeyFormat', () => {
    it('should validate correct key format', () => {
      const key = CryptoUtils.generateApiKey();
      expect(CryptoUtils.validateKeyFormat(key)).toBe(true);
    });

    it('should reject invalid key format', () => {
      expect(CryptoUtils.validateKeyFormat('invalid-key')).toBe(false);
      expect(CryptoUtils.validateKeyFormat('tally_validkey')).toBe(false); // No checksum
      expect(CryptoUtils.validateKeyFormat('wrong_prefix_validkey_checksum')).toBe(false);
    });
  });

  describe('hashApiKey', () => {
    it('should generate consistent hash for same key', () => {
      const key = 'test-key';
      const hash1 = CryptoUtils.hashApiKey(key);
      const hash2 = CryptoUtils.hashApiKey(key);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it('should generate different hashes for different keys', () => {
      const hash1 = CryptoUtils.hashApiKey('key1');
      const hash2 = CryptoUtils.hashApiKey('key2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask data correctly', () => {
      const data = 'sensitive-data-here';
      const masked = CryptoUtils.maskSensitiveData(data, 4);
      
      expect(masked).toBe('sens***********here');
      expect(masked).toHaveLength(data.length);
    });

    it('should handle short data', () => {
      const data = 'short';
      const masked = CryptoUtils.maskSensitiveData(data, 4);
      
      expect(masked).toBe('*****');
    });
  });
}); 