import { ApiKey, ApiKeyWithSecret, ApiKeyStatus, ApiKeyScope, ApiKeyUsageLog, ApiKeyRotationConfig, ApiKeyValidationResult, CreateApiKeyInput, UpdateApiKeyInput, ValidateApiKeyInput, ApiKeyRotationConfigInput } from '../models/api-key';
export declare class ApiKeyService {
    private storage;
    constructor();
    private initializeBootstrapKeys;
    createApiKey(input: CreateApiKeyInput, createdBy?: string): Promise<ApiKeyWithSecret>;
    validateApiKey(input: ValidateApiKeyInput): Promise<ApiKeyValidationResult>;
    getApiKey(id: string): Promise<ApiKey | null>;
    listApiKeys(status?: ApiKeyStatus): Promise<ApiKey[]>;
    updateApiKey(id: string, input: UpdateApiKeyInput): Promise<ApiKey | null>;
    revokeApiKey(id: string): Promise<boolean>;
    deleteApiKey(id: string): Promise<boolean>;
    private logUsage;
    getUsageLogs(keyId: string, limit?: number): Promise<ApiKeyUsageLog[]>;
    rotateApiKey(id: string): Promise<ApiKeyWithSecret | null>;
    setupRotation(keyId: string, config: ApiKeyRotationConfigInput): Promise<ApiKeyRotationConfig | null>;
    getRotationConfig(keyId: string): Promise<ApiKeyRotationConfig | null>;
    processAutomaticRotations(): Promise<string[]>;
    hasRequiredScopes(apiKey: ApiKey, requiredScopes: ApiKeyScope[]): boolean;
    getApiKeyStats(): Promise<{
        total: number;
        active: number;
        expired: number;
        revoked: number;
        totalUsage: number;
    }>;
}
export declare const apiKeyService: ApiKeyService;
//# sourceMappingURL=api-key-service.d.ts.map