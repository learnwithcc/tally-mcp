import { z } from 'zod';

/**
 * API Key Status enum
 */
export enum ApiKeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

/**
 * API Key Permission Scopes
 */
export enum ApiKeyScope {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  FORMS_READ = 'forms:read',
  FORMS_WRITE = 'forms:write',
  SUBMISSIONS_READ = 'submissions:read',
  SUBMISSIONS_WRITE = 'submissions:write',
  WORKSPACES_READ = 'workspaces:read',
  WORKSPACES_WRITE = 'workspaces:write'
}

/**
 * Schema for creating a new API key
 */
export const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  scopes: z.array(z.nativeEnum(ApiKeyScope)).min(1, 'At least one scope is required'),
  expiresAt: z.date().optional(),
  maxUsage: z.number().positive().optional(),
  ipWhitelist: z.array(z.string().ip()).optional(),
  metadata: z.record(z.string()).optional()
});

/**
 * Schema for updating an API key
 */
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

/**
 * Schema for API key validation
 */
export const ValidateApiKeySchema = z.object({
  key: z.string().min(1, 'API key is required'),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  endpoint: z.string().optional()
});

/**
 * API Key interface
 */
export interface ApiKey {
  id: string;
  keyHash: string; // Hashed version of the key for storage
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

/**
 * API Key with plain text key (only returned on creation)
 */
export interface ApiKeyWithSecret extends Omit<ApiKey, 'keyHash'> {
  key: string; // Plain text key, only shown once
  keyHash: string;
}

/**
 * API Key usage log entry
 */
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

/**
 * Schema for API key usage logging
 */
export const ApiKeyUsageLogSchema = z.object({
  keyId: z.string().uuid(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  endpoint: z.string().optional(),
  success: z.boolean(),
  errorReason: z.string().optional(),
  responseTime: z.number().positive().optional()
});

/**
 * API Key rotation configuration
 */
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

/**
 * Schema for API key rotation configuration
 */
export const ApiKeyRotationConfigSchema = z.object({
  rotationIntervalDays: z.number().min(1).max(365),
  notifyDaysBefore: z.number().min(0).max(30),
  autoRotate: z.boolean(),
  isActive: z.boolean().default(true)
});

/**
 * Type definitions for API key operations
 */
export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof UpdateApiKeySchema>;
export type ValidateApiKeyInput = z.infer<typeof ValidateApiKeySchema>;
export type ApiKeyUsageLogInput = z.infer<typeof ApiKeyUsageLogSchema>;
export type ApiKeyRotationConfigInput = z.infer<typeof ApiKeyRotationConfigSchema>;

/**
 * API Key validation result
 */
export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKey?: ApiKey;
  errorReason?: string;
  remainingUsage?: number | undefined;
  expiresIn?: number | undefined; // seconds until expiration
}

/**
 * API Key generation options
 */
export interface ApiKeyGenerationOptions {
  length?: number;
  prefix?: string;
  includeChecksum?: boolean;
}

/**
 * Constants for API key management
 */
export const API_KEY_CONSTANTS = {
  DEFAULT_KEY_LENGTH: 32,
  DEFAULT_PREFIX: 'tally_',
  MIN_KEY_LENGTH: 16,
  MAX_KEY_LENGTH: 64,
  HASH_ALGORITHM: 'sha256',
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  DEFAULT_EXPIRY_DAYS: 90,
  MAX_USAGE_LOGS_PER_KEY: 1000,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100
} as const; 