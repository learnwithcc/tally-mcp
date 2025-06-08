"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyService = exports.ApiKeyService = void 0;
const api_key_1 = require("../models/api-key");
const crypto_1 = require("../utils/crypto");
class ApiKeyStorage {
    constructor() {
        this.apiKeys = new Map();
        this.usageLogs = new Map();
        this.rotationConfigs = new Map();
    }
    async createApiKey(apiKey) {
        this.apiKeys.set(apiKey.id, { ...apiKey });
    }
    async getApiKey(id) {
        return this.apiKeys.get(id) || null;
    }
    async getApiKeyByHash(keyHash) {
        for (const apiKey of this.apiKeys.values()) {
            if (apiKey.keyHash === keyHash) {
                return { ...apiKey };
            }
        }
        return null;
    }
    async getAllApiKeys() {
        return Array.from(this.apiKeys.values()).map(key => ({ ...key }));
    }
    async updateApiKey(id, updates) {
        const existing = this.apiKeys.get(id);
        if (!existing)
            return false;
        this.apiKeys.set(id, { ...existing, ...updates, updatedAt: new Date() });
        return true;
    }
    async deleteApiKey(id) {
        const deleted = this.apiKeys.delete(id);
        if (deleted) {
            this.usageLogs.delete(id);
            this.rotationConfigs.delete(id);
        }
        return deleted;
    }
    async addUsageLog(log) {
        const logs = this.usageLogs.get(log.keyId) || [];
        logs.push({ ...log });
        if (logs.length > api_key_1.API_KEY_CONSTANTS.MAX_USAGE_LOGS_PER_KEY) {
            logs.splice(0, logs.length - api_key_1.API_KEY_CONSTANTS.MAX_USAGE_LOGS_PER_KEY);
        }
        this.usageLogs.set(log.keyId, logs);
    }
    async getUsageLogs(keyId, limit) {
        const logs = this.usageLogs.get(keyId) || [];
        return limit ? logs.slice(-limit) : [...logs];
    }
    async createRotationConfig(config) {
        this.rotationConfigs.set(config.keyId, { ...config });
    }
    async getRotationConfig(keyId) {
        return this.rotationConfigs.get(keyId) || null;
    }
    async updateRotationConfig(keyId, updates) {
        const existing = this.rotationConfigs.get(keyId);
        if (!existing)
            return false;
        this.rotationConfigs.set(keyId, { ...existing, ...updates });
        return true;
    }
    async deleteRotationConfig(keyId) {
        return this.rotationConfigs.delete(keyId);
    }
    async getKeysNeedingRotation() {
        const now = new Date();
        return Array.from(this.rotationConfigs.values())
            .filter(config => config.isActive && config.nextRotationAt <= now);
    }
}
class ApiKeyService {
    constructor() {
        this.storage = new ApiKeyStorage();
        this.initializeBootstrapKeys();
    }
    async initializeBootstrapKeys() {
        const bootstrapKey = process.env.BOOTSTRAP_API_KEY;
        if (bootstrapKey && crypto_1.CryptoUtils.validateKeyFormat(bootstrapKey)) {
            const keyHash = crypto_1.CryptoUtils.hashApiKey(bootstrapKey);
            const existing = await this.storage.getApiKeyByHash(keyHash);
            if (!existing) {
                const apiKey = {
                    id: crypto_1.CryptoUtils.generateId(),
                    keyHash,
                    name: 'Bootstrap Key',
                    description: 'Initial bootstrap API key from environment',
                    scopes: [api_key_1.ApiKeyScope.ADMIN],
                    status: api_key_1.ApiKeyStatus.ACTIVE,
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
    async createApiKey(input, createdBy) {
        const validatedInput = api_key_1.CreateApiKeySchema.parse(input);
        const plainKey = crypto_1.CryptoUtils.generateApiKey();
        const keyHash = crypto_1.CryptoUtils.hashApiKey(plainKey);
        const apiKey = {
            id: crypto_1.CryptoUtils.generateId(),
            keyHash,
            name: validatedInput.name,
            ...(validatedInput.description && { description: validatedInput.description }),
            scopes: validatedInput.scopes,
            status: api_key_1.ApiKeyStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...(validatedInput.expiresAt && { expiresAt: validatedInput.expiresAt }),
            usageCount: 0,
            ...(validatedInput.maxUsage && { maxUsage: validatedInput.maxUsage }),
            ...(validatedInput.ipWhitelist && { ipWhitelist: validatedInput.ipWhitelist }),
            ...(validatedInput.metadata && { metadata: validatedInput.metadata }),
            ...(createdBy && { createdBy })
        };
        await this.storage.createApiKey(apiKey);
        return {
            ...apiKey,
            key: plainKey
        };
    }
    async validateApiKey(input) {
        const { key, ipAddress, userAgent, endpoint } = input;
        if (!crypto_1.CryptoUtils.validateKeyFormat(key)) {
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
        const keyHash = crypto_1.CryptoUtils.hashApiKey(key);
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
        if (apiKey.status !== api_key_1.ApiKeyStatus.ACTIVE) {
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
        if (apiKey.expiresAt && apiKey.expiresAt <= new Date()) {
            await this.storage.updateApiKey(apiKey.id, { status: api_key_1.ApiKeyStatus.EXPIRED });
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
        await this.storage.updateApiKey(apiKey.id, {
            usageCount: apiKey.usageCount + 1,
            lastUsedAt: new Date()
        });
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
    async getApiKey(id) {
        return this.storage.getApiKey(id);
    }
    async listApiKeys(status) {
        const allKeys = await this.storage.getAllApiKeys();
        return status ? allKeys.filter(key => key.status === status) : allKeys;
    }
    async updateApiKey(id, input) {
        const validatedInput = api_key_1.UpdateApiKeySchema.parse(input);
        const updateData = {};
        if (validatedInput.name !== undefined)
            updateData.name = validatedInput.name;
        if (validatedInput.description !== undefined)
            updateData.description = validatedInput.description;
        if (validatedInput.scopes !== undefined)
            updateData.scopes = validatedInput.scopes;
        if (validatedInput.status !== undefined)
            updateData.status = validatedInput.status;
        if (validatedInput.expiresAt !== undefined)
            updateData.expiresAt = validatedInput.expiresAt;
        if (validatedInput.maxUsage !== undefined)
            updateData.maxUsage = validatedInput.maxUsage;
        if (validatedInput.ipWhitelist !== undefined)
            updateData.ipWhitelist = validatedInput.ipWhitelist;
        if (validatedInput.metadata !== undefined)
            updateData.metadata = validatedInput.metadata;
        const updated = await this.storage.updateApiKey(id, updateData);
        return updated ? this.storage.getApiKey(id) : null;
    }
    async revokeApiKey(id) {
        return this.storage.updateApiKey(id, { status: api_key_1.ApiKeyStatus.REVOKED });
    }
    async deleteApiKey(id) {
        return this.storage.deleteApiKey(id);
    }
    async logUsage(key, details) {
        try {
            const keyHash = crypto_1.CryptoUtils.hashApiKey(key);
            const apiKey = await this.storage.getApiKeyByHash(keyHash);
            if (apiKey) {
                const log = {
                    id: crypto_1.CryptoUtils.generateId(),
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
        }
        catch (error) {
            console.error('Failed to log API key usage:', error);
        }
    }
    async getUsageLogs(keyId, limit) {
        return this.storage.getUsageLogs(keyId, limit);
    }
    async rotateApiKey(id) {
        const existingKey = await this.storage.getApiKey(id);
        if (!existingKey) {
            return null;
        }
        const newPlainKey = crypto_1.CryptoUtils.generateApiKey();
        const newKeyHash = crypto_1.CryptoUtils.hashApiKey(newPlainKey);
        const updateData = {
            keyHash: newKeyHash,
            updatedAt: new Date(),
            usageCount: 0
        };
        const updated = await this.storage.updateApiKey(id, updateData);
        if (!updated) {
            return null;
        }
        const updatedKey = await this.storage.getApiKey(id);
        if (!updatedKey) {
            return null;
        }
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
    async setupRotation(keyId, config) {
        const validatedConfig = api_key_1.ApiKeyRotationConfigSchema.parse(config);
        const apiKey = await this.storage.getApiKey(keyId);
        if (!apiKey) {
            return null;
        }
        const nextRotationAt = new Date();
        nextRotationAt.setDate(nextRotationAt.getDate() + validatedConfig.rotationIntervalDays);
        const rotationConfig = {
            id: crypto_1.CryptoUtils.generateId(),
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
    async getRotationConfig(keyId) {
        return this.storage.getRotationConfig(keyId);
    }
    async processAutomaticRotations() {
        const keysNeedingRotation = await this.storage.getKeysNeedingRotation();
        const rotatedKeys = [];
        for (const config of keysNeedingRotation) {
            if (config.autoRotate) {
                try {
                    const rotated = await this.rotateApiKey(config.keyId);
                    if (rotated) {
                        rotatedKeys.push(config.keyId);
                        console.log(`Automatically rotated API key: ${crypto_1.CryptoUtils.maskSensitiveData(rotated.name)}`);
                    }
                }
                catch (error) {
                    console.error(`Failed to auto-rotate key ${config.keyId}:`, error);
                }
            }
        }
        return rotatedKeys;
    }
    hasRequiredScopes(apiKey, requiredScopes) {
        if (apiKey.scopes.includes(api_key_1.ApiKeyScope.ADMIN)) {
            return true;
        }
        return requiredScopes.every(scope => apiKey.scopes.includes(scope));
    }
    async getApiKeyStats() {
        const allKeys = await this.storage.getAllApiKeys();
        return {
            total: allKeys.length,
            active: allKeys.filter(k => k.status === api_key_1.ApiKeyStatus.ACTIVE).length,
            expired: allKeys.filter(k => k.status === api_key_1.ApiKeyStatus.EXPIRED).length,
            revoked: allKeys.filter(k => k.status === api_key_1.ApiKeyStatus.REVOKED).length,
            totalUsage: allKeys.reduce((sum, key) => sum + key.usageCount, 0)
        };
    }
}
exports.ApiKeyService = ApiKeyService;
exports.apiKeyService = new ApiKeyService();
//# sourceMappingURL=api-key-service.js.map