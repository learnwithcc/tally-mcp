import crypto from 'crypto';
import { CryptoUtils, EncryptionResult } from '../crypto';
import { API_KEY_CONSTANTS } from '../../models/api-key';
import { cryptoTestData, temporaryTokenTestCases } from './fixtures';

describe('CryptoUtils', () => {
  const originalEnv = process.env;
  const { plainText, encryptionKey, hmacKey, apiKeyPrefix } = cryptoTestData;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('API Key Generation and Validation', () => {
    it('should generate a valid API key with default options', () => {
      const key = CryptoUtils.generateApiKey();
      expect(CryptoUtils.validateKeyFormat(key)).toBe(true);
      expect(key).toMatch(/^tally_/);
      expect(key).toMatchSnapshot();
    });

    it('should generate a valid API key with a custom prefix', () => {
      const key = CryptoUtils.generateApiKey({ prefix: apiKeyPrefix });
      expect(CryptoUtils.validateKeyFormat(key)).toBe(true);
      expect(key).toMatch(new RegExp(`^${apiKeyPrefix}`));
      expect(key).toMatchSnapshot();
    });

    it('should invalidate a key with a wrong checksum', () => {
        const key = CryptoUtils.generateApiKey();
        const parts = key.split('_');
        const tamperedKey = `${parts[0]}_wrongchecksum`;
        expect(CryptoUtils.validateKeyFormat(tamperedKey)).toBe(false);
    });

    test.each([
      [10],
      [100],
    ])('should throw an error for invalid key length: %s', (length) => {
      expect(() => CryptoUtils.generateApiKey({ length })).toThrow('Key length must be between');
    });
  });

  describe('Hashing', () => {
    it('should hash an API key consistently', () => {
      const hash1 = CryptoUtils.hashApiKey('some-key');
      const hash2 = CryptoUtils.hashApiKey('some-key');
      expect(hash1).toBe(hash2);
      expect(hash1).toMatchSnapshot();
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = CryptoUtils.hashApiKey('some-key');
      const hash2 = CryptoUtils.hashApiKey('another-key');
      expect(hash1).not.toBe(hash2);
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
        process.env.API_KEY_ENCRYPTION_KEY = encryptionKey;
    });

    afterEach(() => {
        delete process.env.API_KEY_ENCRYPTION_KEY;
    });

    it('should encrypt and decrypt data successfully', () => {
      const encrypted = CryptoUtils.encrypt(plainText);
      const decrypted = CryptoUtils.decrypt(encrypted);
      expect(decrypted).toBe(plainText);
      expect(encrypted).not.toBe(plainText);
      expect(encrypted).toMatchSnapshot();
    });

    it('should throw error if encryption key is missing', () => {
        delete process.env.API_KEY_ENCRYPTION_KEY;
        expect(() => CryptoUtils.encrypt(plainText)).toThrow('API_KEY_ENCRYPTION_KEY environment variable is required');
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
    it('should create and verify an HMAC signature', () => {
      const signature = CryptoUtils.createHmac(plainText, hmacKey);
      expect(CryptoUtils.verifyHmac(plainText, signature, hmacKey)).toBe(true);
      expect(signature).toMatchSnapshot();
    });

    it('should fail verification for a wrong signature or data', () => {
      const signature = CryptoUtils.createHmac(plainText, hmacKey);
      expect(CryptoUtils.verifyHmac(plainText, 'wrong-signature', hmacKey)).toBe(false);
      expect(CryptoUtils.verifyHmac('wrong-data', signature, hmacKey)).toBe(false);
    });
  });

  describe('Temporary Token', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = hmacKey;
    });

    afterEach(() => {
        delete process.env.JWT_SECRET;
    });

    it('should generate and verify a valid temporary token', () => {
      const { payload, expiresIn } = temporaryTokenTestCases.valid;
      const token = CryptoUtils.generateTempToken(payload, parseInt(expiresIn));
      const verified = CryptoUtils.verifyTempToken(token);
      expect(verified.valid).toBe(true);
      expect(verified.payload).toMatchObject(payload);
    });

    it('should fail verification for a tampered token', () => {
        const { payload, expiresIn } = temporaryTokenTestCases.tampered;
        const token = CryptoUtils.generateTempToken(payload, parseInt(expiresIn));
        const tamperedToken = token.split('.')[0] + '.' + Buffer.from(JSON.stringify({hacked: true})).toString('base64') + '.' + token.split('.')[2];
        const result = CryptoUtils.verifyTempToken(tamperedToken);
        expect(result.valid).toBe(false);
    });
  
    it('should fail verification for an expired token', () => {
        const { payload, expiresIn } = temporaryTokenTestCases.expired;
        const token = CryptoUtils.generateTempToken(payload, parseInt(expiresIn));
        const result = CryptoUtils.verifyTempToken(token);
        expect(result.valid).toBe(false);
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