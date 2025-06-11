import { ApiKeyGenerationOptions } from '../models/api-key';
export interface EncryptionResult {
    encrypted: string;
    iv: string;
    tag: string;
}
export interface DecryptionInput {
    encrypted: string;
    iv: string;
    tag: string;
}
export declare class CryptoUtils {
    private static readonly algorithm;
    private static readonly hashAlgorithm;
    private static getEncryptionKey;
    static generateApiKey(options?: ApiKeyGenerationOptions): string;
    private static calculateChecksum;
    static validateKeyFormat(key: string): boolean;
    static hashApiKey(key: string): string;
    static encrypt(plaintext: string): EncryptionResult;
    static decrypt(data: DecryptionInput): string;
    static generateSalt(length?: number): string;
    static createHmac(data: string, secret: string): string;
    static verifyHmac(data: string, signature: string, secret: string): boolean;
    static generateId(): string;
    static hashWithSalt(data: string, salt: string): string;
    static generateTempToken(payload: Record<string, any>, expiresInSeconds?: number): string;
    static verifyTempToken(token: string): {
        valid: boolean;
        payload?: any;
        error?: string;
    };
    static maskSensitiveData(data: string, visibleChars?: number): string;
}
//# sourceMappingURL=crypto.d.ts.map