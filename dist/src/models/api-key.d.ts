import { z } from 'zod';
export declare enum ApiKeyStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    REVOKED = "revoked",
    EXPIRED = "expired"
}
export declare enum ApiKeyScope {
    READ = "read",
    WRITE = "write",
    ADMIN = "admin",
    FORMS_READ = "forms:read",
    FORMS_WRITE = "forms:write",
    SUBMISSIONS_READ = "submissions:read",
    SUBMISSIONS_WRITE = "submissions:write",
    WORKSPACES_READ = "workspaces:read",
    WORKSPACES_WRITE = "workspaces:write"
}
export declare const CreateApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    scopes: z.ZodArray<z.ZodNativeEnum<typeof ApiKeyScope>, "many">;
    expiresAt: z.ZodOptional<z.ZodDate>;
    maxUsage: z.ZodOptional<z.ZodNumber>;
    ipWhitelist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    scopes: ApiKeyScope[];
    name: string;
    description?: string | undefined;
    metadata?: Record<string, string> | undefined;
    expiresAt?: Date | undefined;
    maxUsage?: number | undefined;
    ipWhitelist?: string[] | undefined;
}, {
    scopes: ApiKeyScope[];
    name: string;
    description?: string | undefined;
    metadata?: Record<string, string> | undefined;
    expiresAt?: Date | undefined;
    maxUsage?: number | undefined;
    ipWhitelist?: string[] | undefined;
}>;
export declare const UpdateApiKeySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    scopes: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ApiKeyScope>, "many">>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ApiKeyStatus>>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    maxUsage: z.ZodOptional<z.ZodNumber>;
    ipWhitelist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    scopes?: ApiKeyScope[] | undefined;
    name?: string | undefined;
    status?: ApiKeyStatus | undefined;
    metadata?: Record<string, string> | undefined;
    expiresAt?: Date | undefined;
    maxUsage?: number | undefined;
    ipWhitelist?: string[] | undefined;
}, {
    description?: string | undefined;
    scopes?: ApiKeyScope[] | undefined;
    name?: string | undefined;
    status?: ApiKeyStatus | undefined;
    metadata?: Record<string, string> | undefined;
    expiresAt?: Date | undefined;
    maxUsage?: number | undefined;
    ipWhitelist?: string[] | undefined;
}>;
export declare const ValidateApiKeySchema: z.ZodObject<{
    key: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    endpoint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    key: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    endpoint?: string | undefined;
}, {
    key: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    endpoint?: string | undefined;
}>;
export interface ApiKey {
    id: string;
    keyHash: string;
    name: string;
    description?: string;
    scopes: ApiKeyScope[];
    status: ApiKeyStatus;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    lastUsedAt?: Date;
    usageCount: number;
    maxUsage?: number;
    ipWhitelist?: string[];
    metadata?: Record<string, string>;
    createdBy?: string;
}
export interface ApiKeyWithSecret extends Omit<ApiKey, 'keyHash'> {
    key: string;
    keyHash: string;
}
export interface ApiKeyUsageLog {
    id: string;
    keyId: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    success: boolean;
    errorReason?: string;
    responseTime?: number;
}
export declare const ApiKeyUsageLogSchema: z.ZodObject<{
    keyId: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    endpoint: z.ZodOptional<z.ZodString>;
    success: z.ZodBoolean;
    errorReason: z.ZodOptional<z.ZodString>;
    responseTime: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    keyId: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    endpoint?: string | undefined;
    errorReason?: string | undefined;
    responseTime?: number | undefined;
}, {
    success: boolean;
    keyId: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    endpoint?: string | undefined;
    errorReason?: string | undefined;
    responseTime?: number | undefined;
}>;
export interface ApiKeyRotationConfig {
    id: string;
    keyId: string;
    rotationIntervalDays: number;
    notifyDaysBefore: number;
    autoRotate: boolean;
    lastRotatedAt?: Date;
    nextRotationAt: Date;
    isActive: boolean;
}
export declare const ApiKeyRotationConfigSchema: z.ZodObject<{
    rotationIntervalDays: z.ZodNumber;
    notifyDaysBefore: z.ZodNumber;
    autoRotate: z.ZodBoolean;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rotationIntervalDays: number;
    notifyDaysBefore: number;
    autoRotate: boolean;
    isActive: boolean;
}, {
    rotationIntervalDays: number;
    notifyDaysBefore: number;
    autoRotate: boolean;
    isActive?: boolean | undefined;
}>;
export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof UpdateApiKeySchema>;
export type ValidateApiKeyInput = z.infer<typeof ValidateApiKeySchema>;
export type ApiKeyUsageLogInput = z.infer<typeof ApiKeyUsageLogSchema>;
export type ApiKeyRotationConfigInput = z.infer<typeof ApiKeyRotationConfigSchema>;
export interface ApiKeyValidationResult {
    isValid: boolean;
    apiKey?: ApiKey;
    errorReason?: string;
    remainingUsage?: number | undefined;
    expiresIn?: number | undefined;
}
export interface ApiKeyGenerationOptions {
    length?: number;
    prefix?: string;
    includeChecksum?: boolean;
}
export declare const API_KEY_CONSTANTS: {
    readonly DEFAULT_KEY_LENGTH: 32;
    readonly DEFAULT_PREFIX: "tally_";
    readonly MIN_KEY_LENGTH: 16;
    readonly MAX_KEY_LENGTH: 64;
    readonly HASH_ALGORITHM: "sha256";
    readonly ENCRYPTION_ALGORITHM: "aes-256-gcm";
    readonly DEFAULT_EXPIRY_DAYS: 90;
    readonly MAX_USAGE_LOGS_PER_KEY: 1000;
    readonly RATE_LIMIT_WINDOW_MS: 60000;
    readonly RATE_LIMIT_MAX_REQUESTS: 100;
};
//# sourceMappingURL=api-key.d.ts.map