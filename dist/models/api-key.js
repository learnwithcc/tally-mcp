"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_KEY_CONSTANTS = exports.ApiKeyRotationConfigSchema = exports.ApiKeyUsageLogSchema = exports.ValidateApiKeySchema = exports.UpdateApiKeySchema = exports.CreateApiKeySchema = exports.ApiKeyScope = exports.ApiKeyStatus = void 0;
const zod_1 = require("zod");
var ApiKeyStatus;
(function (ApiKeyStatus) {
    ApiKeyStatus["ACTIVE"] = "active";
    ApiKeyStatus["INACTIVE"] = "inactive";
    ApiKeyStatus["REVOKED"] = "revoked";
    ApiKeyStatus["EXPIRED"] = "expired";
})(ApiKeyStatus || (exports.ApiKeyStatus = ApiKeyStatus = {}));
var ApiKeyScope;
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
})(ApiKeyScope || (exports.ApiKeyScope = ApiKeyScope = {}));
exports.CreateApiKeySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'API key name is required').max(100, 'Name too long'),
    description: zod_1.z.string().optional(),
    scopes: zod_1.z.array(zod_1.z.nativeEnum(ApiKeyScope)).min(1, 'At least one scope is required'),
    expiresAt: zod_1.z.date().optional(),
    maxUsage: zod_1.z.number().positive().optional(),
    ipWhitelist: zod_1.z.array(zod_1.z.string().ip()).optional(),
    metadata: zod_1.z.record(zod_1.z.string()).optional()
});
exports.UpdateApiKeySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().optional(),
    scopes: zod_1.z.array(zod_1.z.nativeEnum(ApiKeyScope)).optional(),
    status: zod_1.z.nativeEnum(ApiKeyStatus).optional(),
    expiresAt: zod_1.z.date().optional(),
    maxUsage: zod_1.z.number().positive().optional(),
    ipWhitelist: zod_1.z.array(zod_1.z.string().ip()).optional(),
    metadata: zod_1.z.record(zod_1.z.string()).optional()
});
exports.ValidateApiKeySchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'API key is required'),
    ipAddress: zod_1.z.string().ip().optional(),
    userAgent: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().optional()
});
exports.ApiKeyUsageLogSchema = zod_1.z.object({
    keyId: zod_1.z.string().uuid(),
    ipAddress: zod_1.z.string().ip().optional(),
    userAgent: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().optional(),
    success: zod_1.z.boolean(),
    errorReason: zod_1.z.string().optional(),
    responseTime: zod_1.z.number().positive().optional()
});
exports.ApiKeyRotationConfigSchema = zod_1.z.object({
    rotationIntervalDays: zod_1.z.number().min(1).max(365),
    notifyDaysBefore: zod_1.z.number().min(0).max(30),
    autoRotate: zod_1.z.boolean(),
    isActive: zod_1.z.boolean().default(true)
});
exports.API_KEY_CONSTANTS = {
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