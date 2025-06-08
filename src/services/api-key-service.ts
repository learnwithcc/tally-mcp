import {
  ApiKey,
  ApiKeyWithSecret,
  ApiKeyStatus,
  ApiKeyScope,
  ApiKeyUsageLog,
  ApiKeyRotationConfig,
  ApiKeyValidationResult,
  CreateApiKeyInput,
  UpdateApiKeyInput,
  ValidateApiKeyInput,
  ApiKeyUsageLogInput,
  ApiKeyRotationConfigInput,
  CreateApiKeySchema,
  UpdateApiKeySchema,
  ApiKeyRotationConfigSchema,
  API_KEY_CONSTANTS
} from '../models/api-key';
import { CryptoUtils } from '../utils/crypto';

/**
 * In-memory storage for API keys (in production, this would be a database)
 */
class ApiKeyStorage {
  private apiKeys: Map<string, ApiKey> = new Map();
  private usageLogs: Map<string, ApiKeyUsageLog[]> = new Map();
  private rotationConfigs: Map<string, ApiKeyRotationConfig> = new Map();

  // API Key operations
  async createApiKey(apiKey: ApiKey): Promise<void> {
    this.apiKeys.set(apiKey.id, { ...apiKey });
  }

  async getApiKey(id: string): Promise<ApiKey | null> {
    return this.apiKeys.get(id) || null;
  }

  async getApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.keyHash === keyHash) {
        return { ...apiKey };
      }
    }
    return null;
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).map(key => ({ ...key }));
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<boolean> {
    const existing = this.apiKeys.get(id);
    if (!existing) return false;
    
    this.apiKeys.set(id, { ...existing, ...updates, updatedAt: new Date() });
    return true;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const deleted = this.apiKeys.delete(id);
    if (deleted) {
      this.usageLogs.delete(id);
      this.rotationConfigs.delete(id);
    }
    return deleted;
  }

  // Usage log operations
  async addUsageLog(log: ApiKeyUsageLog): Promise<void> {
    const logs = this.usageLogs.get(log.keyId) || [];
    logs.push({ ...log });
    
    // Keep only the last N logs per key
    if (logs.length > API_KEY_CONSTANTS.MAX_USAGE_LOGS_PER_KEY) {
      logs.splice(0, logs.length - API_KEY_CONSTANTS.MAX_USAGE_LOGS_PER_KEY);
    }
    
    this.usageLogs.set(log.keyId, logs);
  }

  async getUsageLogs(keyId: string, limit?: number): Promise<ApiKeyUsageLog[]> {
    const logs = this.usageLogs.get(keyId) || [];
    return limit ? logs.slice(-limit) : [...logs];
  }

  // Rotation config operations
  async createRotationConfig(config: ApiKeyRotationConfig): Promise<void> {
    this.rotationConfigs.set(config.keyId, { ...config });
  }

  async getRotationConfig(keyId: string): Promise<ApiKeyRotationConfig | null> {
    return this.rotationConfigs.get(keyId) || null;
  }

  async updateRotationConfig(keyId: string, updates: Partial<ApiKeyRotationConfig>): Promise<boolean> {
    const existing = this.rotationConfigs.get(keyId);
    if (!existing) return false;
    
    this.rotationConfigs.set(keyId, { ...existing, ...updates });
    return true;
  }

  async deleteRotationConfig(keyId: string): Promise<boolean> {
    return this.rotationConfigs.delete(keyId);
  }

  async getKeysNeedingRotation(): Promise<ApiKeyRotationConfig[]> {
    const now = new Date();
    return Array.from(this.rotationConfigs.values())
      .filter(config => config.isActive && config.nextRotationAt <= now);
  }
}

/**
 * API Key Management Service
 */
export class ApiKeyService {
  private storage: ApiKeyStorage;

  constructor() {
    this.storage = new ApiKeyStorage();
    this.initializeBootstrapKeys();
  }

  /**
   * Initialize bootstrap API keys from environment variables
   */
  private async initializeBootstrapKeys(): Promise<void> {
    const bootstrapKey = process.env.BOOTSTRAP_API_KEY;
    if (bootstrapKey && CryptoUtils.validateKeyFormat(bootstrapKey)) {
      const keyHash = CryptoUtils.hashApiKey(bootstrapKey);
      const existing = await this.storage.getApiKeyByHash(keyHash);
      
      if (!existing) {
        const apiKey: ApiKey = {
          id: CryptoUtils.generateId(),
          keyHash,
          name: 'Bootstrap Key',
          description: 'Initial bootstrap API key from environment',
          scopes: [ApiKeyScope.ADMIN],
          status: ApiKeyStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          createdBy: 'system'
        };
        
        await this.storage.createApiKey(apiKey);
        console.log('Bootstrap API key initialized');
      }
    }
  }

  /**
   * Create a new API key
   */
  async createApiKey(input: CreateApiKeyInput, createdBy?: string): Promise<ApiKeyWithSecret> {
    // Validate input
    const validatedInput = CreateApiKeySchema.parse(input);
    
    // Generate the API key
    const plainKey = CryptoUtils.generateApiKey();
    const keyHash = CryptoUtils.hashApiKey(plainKey);
    
         // Create the API key object
     const apiKey: ApiKey = {
       id: CryptoUtils.generateId(),
       keyHash,
       name: validatedInput.name,
       ...(validatedInput.description && { description: validatedInput.description }),
       scopes: validatedInput.scopes,
       status: ApiKeyStatus.ACTIVE,
       createdAt: new Date(),
       updatedAt: new Date(),
       ...(validatedInput.expiresAt && { expiresAt: validatedInput.expiresAt }),
       usageCount: 0,
       ...(validatedInput.maxUsage && { maxUsage: validatedInput.maxUsage }),
       ...(validatedInput.ipWhitelist && { ipWhitelist: validatedInput.ipWhitelist }),
       ...(validatedInput.metadata && { metadata: validatedInput.metadata }),
       ...(createdBy && { createdBy })
     };

    // Store the API key
    await this.storage.createApiKey(apiKey);

    return {
      ...apiKey,
      key: plainKey
    };
  }

  /**
   * Validate an API key
   */
  async validateApiKey(input: ValidateApiKeyInput): Promise<ApiKeyValidationResult> {
    const { key, ipAddress, userAgent, endpoint } = input;

    // Basic format validation
    if (!CryptoUtils.validateKeyFormat(key)) {
      await this.logUsage(key, {
        success: false,
        errorReason: 'Invalid API key format',
        ipAddress,
        userAgent,
        endpoint
      });
      return {
        isValid: false,
        errorReason: 'Invalid API key format'
      };
    }

    // Find the API key
    const keyHash = CryptoUtils.hashApiKey(key);
    const apiKey = await this.storage.getApiKeyByHash(keyHash);
    
    if (!apiKey) {
      await this.logUsage(key, {
        success: false,
        errorReason: 'API key not found',
        ipAddress,
        userAgent,
        endpoint
      });
      return {
        isValid: false,
        errorReason: 'API key not found'
      };
    }

    // Check if key is active
    if (apiKey.status !== ApiKeyStatus.ACTIVE) {
      await this.logUsage(key, {
        success: false,
        errorReason: `API key is ${apiKey.status}`,
        ipAddress,
        userAgent,
        endpoint
      });
      
      return {
        isValid: false,
        errorReason: `API key is ${apiKey.status}`,
        apiKey
      };
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt <= new Date()) {
      // Auto-expire the key
      await this.storage.updateApiKey(apiKey.id, { status: ApiKeyStatus.EXPIRED });
      
      await this.logUsage(key, {
        success: false,
        errorReason: 'API key expired',
        ipAddress,
        userAgent,
        endpoint
      });
      
      return {
        isValid: false,
        errorReason: 'API key expired',
        apiKey
      };
    }

    // Check usage limits
    if (apiKey.maxUsage && apiKey.usageCount >= apiKey.maxUsage) {
      await this.logUsage(key, {
        success: false,
        errorReason: 'Usage limit exceeded',
        ipAddress,
        userAgent,
        endpoint
      });
      
      return {
        isValid: false,
        errorReason: 'Usage limit exceeded',
        apiKey,
        remainingUsage: 0
      };
    }

    // Check IP whitelist
    if (apiKey.ipWhitelist && ipAddress) {
      const isIpAllowed = apiKey.ipWhitelist.includes(ipAddress);
      if (!isIpAllowed) {
        await this.logUsage(key, {
          success: false,
          errorReason: 'IP address not whitelisted',
          ipAddress,
          userAgent,
          endpoint
        });
        
        return {
          isValid: false,
          errorReason: 'IP address not whitelisted',
          apiKey
        };
      }
    }

    // Update usage statistics
    await this.storage.updateApiKey(apiKey.id, {
      usageCount: apiKey.usageCount + 1,
      lastUsedAt: new Date()
    });

    // Log successful usage
    await this.logUsage(key, {
      success: true,
      ipAddress,
      userAgent,
      endpoint
    });

    const remainingUsage = apiKey.maxUsage ? apiKey.maxUsage - apiKey.usageCount - 1 : undefined;
    const expiresIn = apiKey.expiresAt ? Math.floor((apiKey.expiresAt.getTime() - Date.now()) / 1000) : undefined;

    return {
      isValid: true,
      apiKey: { ...apiKey, usageCount: apiKey.usageCount + 1, lastUsedAt: new Date() },
      remainingUsage,
      expiresIn
    };
  }

  /**
   * Get API key by ID
   */
  async getApiKey(id: string): Promise<ApiKey | null> {
    return this.storage.getApiKey(id);
  }

  /**
   * List all API keys
   */
  async listApiKeys(status?: ApiKeyStatus): Promise<ApiKey[]> {
    const allKeys = await this.storage.getAllApiKeys();
    return status ? allKeys.filter(key => key.status === status) : allKeys;
  }

     /**
    * Update an API key
    */
   async updateApiKey(id: string, input: UpdateApiKeyInput): Promise<ApiKey | null> {
     const validatedInput = UpdateApiKeySchema.parse(input);
     
     // Filter out undefined values for exactOptionalPropertyTypes
     const updateData: Partial<ApiKey> = {};
     if (validatedInput.name !== undefined) updateData.name = validatedInput.name;
     if (validatedInput.description !== undefined) updateData.description = validatedInput.description;
     if (validatedInput.scopes !== undefined) updateData.scopes = validatedInput.scopes;
     if (validatedInput.status !== undefined) updateData.status = validatedInput.status;
     if (validatedInput.expiresAt !== undefined) updateData.expiresAt = validatedInput.expiresAt;
     if (validatedInput.maxUsage !== undefined) updateData.maxUsage = validatedInput.maxUsage;
     if (validatedInput.ipWhitelist !== undefined) updateData.ipWhitelist = validatedInput.ipWhitelist;
     if (validatedInput.metadata !== undefined) updateData.metadata = validatedInput.metadata;
     
     const updated = await this.storage.updateApiKey(id, updateData);
     return updated ? this.storage.getApiKey(id) : null;
   }

  /**
   * Revoke an API key
   */
  async revokeApiKey(id: string): Promise<boolean> {
    return this.storage.updateApiKey(id, { status: ApiKeyStatus.REVOKED });
  }

  /**
   * Delete an API key permanently
   */
  async deleteApiKey(id: string): Promise<boolean> {
    return this.storage.deleteApiKey(id);
  }

  /**
   * Log API key usage
   */
  private async logUsage(key: string, details: Omit<ApiKeyUsageLogInput, 'keyId'>): Promise<void> {
    try {
      // Find the key ID by hash
      const keyHash = CryptoUtils.hashApiKey(key);
      const apiKey = await this.storage.getApiKeyByHash(keyHash);
      
             if (apiKey) {
         const log: ApiKeyUsageLog = {
           id: CryptoUtils.generateId(),
           keyId: apiKey.id,
           timestamp: new Date(),
           success: details.success,
           ...(details.ipAddress && { ipAddress: details.ipAddress }),
           ...(details.userAgent && { userAgent: details.userAgent }),
           ...(details.endpoint && { endpoint: details.endpoint }),
           ...(details.errorReason && { errorReason: details.errorReason }),
           ...(details.responseTime && { responseTime: details.responseTime })
         };
         
         await this.storage.addUsageLog(log);
       }
    } catch (error) {
      console.error('Failed to log API key usage:', error);
    }
  }

  /**
   * Get usage logs for an API key
   */
  async getUsageLogs(keyId: string, limit?: number): Promise<ApiKeyUsageLog[]> {
    return this.storage.getUsageLogs(keyId, limit);
  }

  /**
   * Rotate an API key
   */
  async rotateApiKey(id: string): Promise<ApiKeyWithSecret | null> {
    const existingKey = await this.storage.getApiKey(id);
    if (!existingKey) {
      return null;
    }

    // Generate new key
    const newPlainKey = CryptoUtils.generateApiKey();
    const newKeyHash = CryptoUtils.hashApiKey(newPlainKey);

         // Update the existing key
     const updateData: Partial<ApiKey> = {
       keyHash: newKeyHash,
       updatedAt: new Date(),
       usageCount: 0 // Reset usage count after rotation
     };
     // Remove lastUsedAt by not including it
     const updated = await this.storage.updateApiKey(id, updateData);

    if (!updated) {
      return null;
    }

    const updatedKey = await this.storage.getApiKey(id);
    if (!updatedKey) {
      return null;
    }

    // Update rotation config if it exists
    const rotationConfig = await this.storage.getRotationConfig(id);
    if (rotationConfig) {
      const nextRotationAt = new Date();
      nextRotationAt.setDate(nextRotationAt.getDate() + rotationConfig.rotationIntervalDays);
      
      await this.storage.updateRotationConfig(id, {
        lastRotatedAt: new Date(),
        nextRotationAt
      });
    }

    return {
      ...updatedKey,
      key: newPlainKey
    };
  }

  /**
   * Setup automatic rotation for an API key
   */
  async setupRotation(keyId: string, config: ApiKeyRotationConfigInput): Promise<ApiKeyRotationConfig | null> {
    const validatedConfig = ApiKeyRotationConfigSchema.parse(config);
    
    // Verify the key exists
    const apiKey = await this.storage.getApiKey(keyId);
    if (!apiKey) {
      return null;
    }

    const nextRotationAt = new Date();
    nextRotationAt.setDate(nextRotationAt.getDate() + validatedConfig.rotationIntervalDays);

    const rotationConfig: ApiKeyRotationConfig = {
      id: CryptoUtils.generateId(),
      keyId,
      rotationIntervalDays: validatedConfig.rotationIntervalDays,
      notifyDaysBefore: validatedConfig.notifyDaysBefore,
      autoRotate: validatedConfig.autoRotate,
      nextRotationAt,
      isActive: validatedConfig.isActive
    };

    await this.storage.createRotationConfig(rotationConfig);
    return rotationConfig;
  }

  /**
   * Get rotation configuration for an API key
   */
  async getRotationConfig(keyId: string): Promise<ApiKeyRotationConfig | null> {
    return this.storage.getRotationConfig(keyId);
  }

  /**
   * Process automatic key rotations
   */
  async processAutomaticRotations(): Promise<string[]> {
    const keysNeedingRotation = await this.storage.getKeysNeedingRotation();
    const rotatedKeys: string[] = [];

    for (const config of keysNeedingRotation) {
      if (config.autoRotate) {
        try {
          const rotated = await this.rotateApiKey(config.keyId);
          if (rotated) {
            rotatedKeys.push(config.keyId);
            console.log(`Automatically rotated API key: ${CryptoUtils.maskSensitiveData(rotated.name)}`);
          }
        } catch (error) {
          console.error(`Failed to auto-rotate key ${config.keyId}:`, error);
        }
      }
    }

    return rotatedKeys;
  }

  /**
   * Check if an API key has required scopes
   */
  hasRequiredScopes(apiKey: ApiKey, requiredScopes: ApiKeyScope[]): boolean {
    // Admin scope grants all permissions
    if (apiKey.scopes.includes(ApiKeyScope.ADMIN)) {
      return true;
    }

    // Check if all required scopes are present
    return requiredScopes.every(scope => apiKey.scopes.includes(scope));
  }

  /**
   * Get API key statistics
   */
  async getApiKeyStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    revoked: number;
    totalUsage: number;
  }> {
    const allKeys = await this.storage.getAllApiKeys();
    
    return {
      total: allKeys.length,
      active: allKeys.filter(k => k.status === ApiKeyStatus.ACTIVE).length,
      expired: allKeys.filter(k => k.status === ApiKeyStatus.EXPIRED).length,
      revoked: allKeys.filter(k => k.status === ApiKeyStatus.REVOKED).length,
      totalUsage: allKeys.reduce((sum, key) => sum + key.usageCount, 0)
    };
  }
}

// Export a singleton instance
export const apiKeyService = new ApiKeyService(); 