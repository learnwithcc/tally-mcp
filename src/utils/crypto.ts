import crypto from 'crypto';
import { API_KEY_CONSTANTS, ApiKeyGenerationOptions } from '../models/api-key';

/**
 * Encryption result interface
 */
export interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Decryption input interface
 */
export interface DecryptionInput {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Crypto utilities for API key management
 */
export class CryptoUtils {
  private static readonly algorithm = API_KEY_CONSTANTS.ENCRYPTION_ALGORITHM;
  private static readonly hashAlgorithm = API_KEY_CONSTANTS.HASH_ALGORITHM;

  /**
   * Get encryption key from environment variable
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.API_KEY_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('API_KEY_ENCRYPTION_KEY environment variable is required');
    }
    
    // If key is shorter than 32 bytes, pad it with zeros
    const keyBuffer = Buffer.from(key, 'utf8');
    if (keyBuffer.length < 32) {
      const paddedKey = Buffer.alloc(32);
      keyBuffer.copy(paddedKey);
      return paddedKey;
    }
    
    // If key is longer than 32 bytes, truncate it
    return keyBuffer.slice(0, 32);
  }

  /**
   * Generate a cryptographically secure API key
   */
  public static generateApiKey(options: ApiKeyGenerationOptions = {}): string {
    const {
      length = API_KEY_CONSTANTS.DEFAULT_KEY_LENGTH,
      prefix = API_KEY_CONSTANTS.DEFAULT_PREFIX,
      includeChecksum = true
    } = options;

    // Validate length
    if (length < API_KEY_CONSTANTS.MIN_KEY_LENGTH || length > API_KEY_CONSTANTS.MAX_KEY_LENGTH) {
      throw new Error(`Key length must be between ${API_KEY_CONSTANTS.MIN_KEY_LENGTH} and ${API_KEY_CONSTANTS.MAX_KEY_LENGTH}`);
    }

    // Generate random bytes
    const randomBytes = crypto.randomBytes(length);
    const keyBody = randomBytes.toString('base64url');

    // Add checksum if requested
    let key = prefix + keyBody;
    if (includeChecksum) {
      const checksum = this.calculateChecksum(key);
      key += '_' + checksum;
    }

    return key;
  }

  /**
   * Calculate checksum for API key validation
   */
  private static calculateChecksum(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('base64url')
      .slice(0, 8);
  }

  /**
   * Validate API key format and checksum
   */
  public static validateKeyFormat(key: string): boolean {
    // Check if key has the expected prefix
    if (!key.startsWith(API_KEY_CONSTANTS.DEFAULT_PREFIX)) {
      return false;
    }

    // Check if key has checksum (should end with _checksum)
    const lastUnderscoreIndex = key.lastIndexOf('_');
    if (lastUnderscoreIndex === -1 || lastUnderscoreIndex === key.indexOf('_')) {
      return false; // No checksum or only the prefix underscore
    }

    const keyWithoutChecksum = key.substring(0, lastUnderscoreIndex);
    const checksumPart = key.substring(lastUnderscoreIndex + 1);

    // Validate checksum
    const expectedChecksum = this.calculateChecksum(keyWithoutChecksum);
    return expectedChecksum === checksumPart;
  }

  /**
   * Hash an API key for secure storage
   */
  public static hashApiKey(key: string): string {
    return crypto
      .createHash(this.hashAlgorithm)
      .update(key)
      .digest('hex');
  }

  /**
   * Encrypt sensitive data
   */
  public static encrypt(plaintext: string): EncryptionResult {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = (cipher as any).getAuthTag ? (cipher as any).getAuthTag() : Buffer.alloc(0);

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  public static decrypt(data: DecryptionInput): string {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(data.iv, 'hex');
    const tag = Buffer.from(data.tag, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    
    if ((decipher as any).setAuthTag && data.tag) {
      (decipher as any).setAuthTag(tag);
    }
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate a secure random salt
   */
  public static generateSalt(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create HMAC signature
   */
  public static createHmac(data: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  public static verifyHmac(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHmac(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generate a unique identifier
   */
  public static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Create a secure hash with salt
   */
  public static hashWithSalt(data: string, salt: string): string {
    return crypto
      .createHash('sha256')
      .update(data + salt)
      .digest('hex');
  }

  /**
   * Generate a JWT-like token for temporary authentication
   */
  public static generateTempToken(payload: Record<string, any>, expiresInSeconds: number = 3600): string {
    const header = {
      typ: 'JWT',
      alg: 'HS256'
    };

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const signature = this.createHmac(`${encodedHeader}.${encodedPayload}`, secret);
    const encodedSignature = Buffer.from(signature, 'hex').toString('base64url');

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  /**
   * Verify and decode a temporary token
   */
  public static verifyTempToken(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
      
      if (!encodedHeader || !encodedPayload || !encodedSignature) {
        return { valid: false, error: 'Invalid token format' };
      }

      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const expectedSignature = this.createHmac(`${encodedHeader}.${encodedPayload}`, secret);
      const expectedEncodedSignature = Buffer.from(expectedSignature, 'hex').toString('base64url');

      if (encodedSignature !== expectedEncodedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Token parsing failed' };
    }
  }

  /**
   * Mask sensitive data for logging
   */
  public static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars * 2) {
      return '*'.repeat(data.length);
    }
    
    const start = data.slice(0, visibleChars);
    const end = data.slice(-visibleChars);
    const middle = '*'.repeat(data.length - (visibleChars * 2));
    
    return `${start}${middle}${end}`;
  }
} 