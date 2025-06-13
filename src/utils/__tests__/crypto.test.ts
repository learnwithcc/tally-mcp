import crypto from 'crypto';
import { CryptoUtils, EncryptionResult } from '../crypto';
import { API_KEY_CONSTANTS } from '../../models/api-key';

describe('CryptoUtils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('API Key Generation and Validation', () => {
    it('should generate an API key with default options', () => {
      const key = CryptoUtils.generateApiKey();
      expect(key).toMatch(new RegExp(`^${API_KEY_CONSTANTS.DEFAULT_PREFIX}.+_.{8}$`));
      expect(CryptoUtils.validateKeyFormat(key)).toBe(true);
    });

    it('should generate an API key with a custom prefix and length', () => {
      const options = { prefix: 'custom_', length: 24 };
      const key = CryptoUtils.generateApiKey(options);
      expect(key).toMatch(/^custom_.+_.{8}$/);
      expect(CryptoUtils.validateKeyFormat(key)).toBe(false); // Fails because of different prefix
    });

    it('should throw an error for invalid key length', () => {
      expect(() => CryptoUtils.generateApiKey({ length: 10 })).toThrow();
      expect(() => CryptoUtils.generateApiKey({ length: 100 })).toThrow();
    });

    it('should validate a correctly formatted key', () => {
      const key = CryptoUtils.generateApiKey();
      expect(CryptoUtils.validateKeyFormat(key)).toBe(true);
    });

    it('should invalidate a key with wrong prefix', () => {
      const key = CryptoUtils.generateApiKey();
      const invalidKey = 'wrong_' + key.substring(API_KEY_CONSTANTS.DEFAULT_PREFIX.length);
      expect(CryptoUtils.validateKeyFormat(invalidKey)).toBe(false);
    });

    it('should invalidate a key with wrong checksum', () => {
      const key = CryptoUtils.generateApiKey();
      const parts = key.split('_');
      const invalidKey = `${parts[0]}_${parts[1]}_wrongchecksum`;
      expect(CryptoUtils.validateKeyFormat(invalidKey)).toBe(false);
    });
  });

  describe('Hashing', () => {
    it('should hash an API key consistently', () => {
      const key = 'my-secret-key';
      const hash1 = CryptoUtils.hashApiKey(key);
      const hash2 = CryptoUtils.hashApiKey(key);
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(key);
    });

    it('should hash with a salt', () => {
      const data = 'password';
      const salt = CryptoUtils.generateSalt();
      const hash = CryptoUtils.hashWithSalt(data, salt);
      expect(hash).toBe(CryptoUtils.hashWithSalt(data, salt));
      expect(hash).not.toBe(CryptoUtils.hashWithSalt(data, CryptoUtils.generateSalt()));
    });
  });

  describe('Encryption and Decryption', () => {
    beforeEach(() => {
      process.env.API_KEY_ENCRYPTION_KEY = 'a-super-secret-key-that-is-32-bytes-long';
    });

    it('should throw error if encryption key is missing', () => {
        delete process.env.API_KEY_ENCRYPTION_KEY;
        expect(() => CryptoUtils.encrypt('test')).toThrow('API_KEY_ENCRYPTION_KEY environment variable is required');
    });

    it('should encrypt and decrypt data successfully', () => {
      const plaintext = 'This is a secret message.';
      const encryptedData = CryptoUtils.encrypt(plaintext);
      const decryptedText = CryptoUtils.decrypt(encryptedData);
      expect(decryptedText).toBe(plaintext);
    });

    it('should pad a short encryption key', () => {
        process.env.API_KEY_ENCRYPTION_KEY = 'short-key';
        const plaintext = 'test';
        const encrypted = CryptoUtils.encrypt(plaintext);
        expect(CryptoUtils.decrypt(encrypted)).toBe(plaintext);
    });

    it('should truncate a long encryption key', () => {
        process.env.API_KEY_ENCRYPTION_KEY = 'this-is-a-very-long-key-that-will-be-truncated-for-sure';
        const plaintext = 'test';
        const encrypted = CryptoUtils.encrypt(plaintext);
        expect(CryptoUtils.decrypt(encrypted)).toBe(plaintext);
    });
  });

  describe('HMAC Signature', () => {
    const data = 'some important data';
    const secret = 'hmac-secret';

    it('should create and verify an HMAC signature', () => {
      const signature = CryptoUtils.createHmac(data, secret);
      expect(CryptoUtils.verifyHmac(data, signature, secret)).toBe(true);
    });

    it('should fail verification for a wrong signature', () => {
      const wrongSignature = crypto.randomBytes(32).toString('hex');
      expect(CryptoUtils.verifyHmac(data, wrongSignature, secret)).toBe(false);
    });

    it('should fail verification for wrong data', () => {
        const signature = CryptoUtils.createHmac(data, secret);
        expect(CryptoUtils.verifyHmac('wrong data', signature, secret)).toBe(false);
    });
  });

  describe('Temporary Token', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'jwt-secret';
    });

    it('should generate and verify a temporary token', () => {
      const payload = { userId: 'user-123' };
      const token = CryptoUtils.generateTempToken(payload, 60);
      const result = CryptoUtils.verifyTempToken(token);
      expect(result.valid).toBe(true);
      expect(result.payload.userId).toBe('user-123');
    });

    it('should fail verification for a tampered token', () => {
        const payload = { userId: 'user-123' };
        const token = CryptoUtils.generateTempToken(payload, 60);
        const [header, body, sig] = token.split('.');
        const tamperedToken = `${header}.${body}.tamperedsignature`;
        const result = CryptoUtils.verifyTempToken(tamperedToken);
        expect(result.valid).toBe(false);
    });

    it('should fail verification for an expired token', () => {
        const payload = { userId: 'user-123' };
        // Create a token that expired 1 second ago
        const token = CryptoUtils.generateTempToken(payload, -1);
        const result = CryptoUtils.verifyTempToken(token);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Token expired');
    });
  });

  describe('Other Utilities', () => {
    it('should generate a random salt', () => {
      const salt = CryptoUtils.generateSalt();
      expect(salt).toHaveLength(32);
      expect(typeof salt).toBe('string');
    });

    it('should generate a UUID', () => {
      const id = CryptoUtils.generateId();
      expect(id).toMatch(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i);
    });

    it('should mask sensitive data', () => {
        const sensitive = '1234567890';
        expect(CryptoUtils.maskSensitiveData(sensitive)).toBe('1234**7890');
        expect(CryptoUtils.maskSensitiveData(sensitive, 2)).toBe('12******90');
        expect(CryptoUtils.maskSensitiveData('abc')).toBe('***');
    });
  });
}); 