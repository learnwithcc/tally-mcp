import { z } from 'zod';
export var ApiKeyStatus;
(function (ApiKeyStatus) {
    ApiKeyStatus["ACTIVE"] = "active";
    ApiKeyStatus["INACTIVE"] = "inactive";
    ApiKeyStatus["REVOKED"] = "revoked";
    ApiKeyStatus["EXPIRED"] = "expired";
})(ApiKeyStatus || (ApiKeyStatus = {}));
export var ApiKeyScope;
(function (ApiKeyScope) {
    ApiKeyScope["READ"] = "read";
    ApiKeyScope["WRITE"] = "write";
    ApiKeyScope["ADMIN"] = "admin";
    ApiKeyScope["FORMS_READ"] = "forms:read";
    ApiKeyScope["FORMS_WRITE"] = "forms:write";
    ApiKeyScope["SUBMISSIONS_READ"] = "submissions:read";
    ApiKeyScope["SUBMISSIONS_WRITE"] = "submissions:write";
    ApiKeyScope["WORKSPACES_READ"] = "workspaces:read";
    ApiKeyScope["WORKSPACES_WRITE"] = "workspaces:write";
})(ApiKeyScope || (ApiKeyScope = {}));
export const CreateApiKeySchema = z.object({
    name: z.string().min(1, 'API key name is required').max(100, 'Name too long'),
    description: z.string().optional(),
    scopes: z.array(z.nativeEnum(ApiKeyScope)).min(1, 'At least one scope is required'),
    expiresAt: z.date().optional(),
    maxUsage: z.number().positive().optional(),
    ipWhitelist: z.array(z.string().ip()).optional(),
    metadata: z.record(z.string()).optional()
});
export const UpdateApiKeySchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    scopes: z.array(z.nativeEnum(ApiKeyScope)).optional(),
    status: z.nativeEnum(ApiKeyStatus).optional(),
    expiresAt: z.date().optional(),
    maxUsage: z.number().positive().optional(),
    ipWhitelist: z.array(z.string().ip()).optional(),
    metadata: z.record(z.string()).optional()
});
export const ValidateApiKeySchema = z.object({
    key: z.string().min(1, 'API key is required'),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional(),
    endpoint: z.string().optional()
});
export const ApiKeyUsageLogSchema = z.object({
    keyId: z.string().uuid(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional(),
    endpoint: z.string().optional(),
    success: z.boolean(),
    errorReason: z.string().optional(),
    responseTime: z.number().positive().optional()
});
export const ApiKeyRotationConfigSchema = z.object({
    rotationIntervalDays: z.number().min(1).max(365),
    notifyDaysBefore: z.number().min(0).max(30),
    autoRotate: z.boolean(),
    isActive: z.boolean().default(true)
});
export const API_KEY_CONSTANTS = {
    DEFAULT_KEY_LENGTH: 32,
    DEFAULT_PREFIX: 'tally_',
    MIN_KEY_LENGTH: 16,
    MAX_KEY_LENGTH: 64,
    HASH_ALGORITHM: 'sha256',
    ENCRYPTION_ALGORITHM: 'aes-256-gcm',
    DEFAULT_EXPIRY_DAYS: 90,
    MAX_USAGE_LOGS_PER_KEY: 1000,
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX_REQUESTS: 100
};
//# sourceMappingURL=api-key.js.map