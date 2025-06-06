"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
const api_key_1 = require("../models/api-key");
class CryptoUtils {
    static getEncryptionKey() {
        const key = process.env.API_KEY_ENCRYPTION_KEY;
        if (!key) {
            throw new Error('API_KEY_ENCRYPTION_KEY environment variable is required');
        }
        const keyBuffer = Buffer.from(key, 'utf8');
        if (keyBuffer.length < 32) {
            const paddedKey = Buffer.alloc(32);
            keyBuffer.copy(paddedKey);
            return paddedKey;
        }
        return keyBuffer.slice(0, 32);
    }
    static generateApiKey(options = {}) {
        const { length = api_key_1.API_KEY_CONSTANTS.DEFAULT_KEY_LENGTH, prefix = api_key_1.API_KEY_CONSTANTS.DEFAULT_PREFIX, includeChecksum = true } = options;
        if (length < api_key_1.API_KEY_CONSTANTS.MIN_KEY_LENGTH || length > api_key_1.API_KEY_CONSTANTS.MAX_KEY_LENGTH) {
            throw new Error(`Key length must be between ${api_key_1.API_KEY_CONSTANTS.MIN_KEY_LENGTH} and ${api_key_1.API_KEY_CONSTANTS.MAX_KEY_LENGTH}`);
        }
        const randomBytes = crypto_1.default.randomBytes(length);
        const keyBody = randomBytes.toString('base64url');
        let key = prefix + keyBody;
        if (includeChecksum) {
            const checksum = this.calculateChecksum(key);
            key += '_' + checksum;
        }
        return key;
    }
    static calculateChecksum(data) {
        return crypto_1.default
            .createHash('sha256')
            .update(data)
            .digest('base64url')
            .slice(0, 8);
    }
    static validateKeyFormat(key) {
        if (!key.startsWith(api_key_1.API_KEY_CONSTANTS.DEFAULT_PREFIX)) {
            return false;
        }
        const lastUnderscoreIndex = key.lastIndexOf('_');
        if (lastUnderscoreIndex === -1 || lastUnderscoreIndex === key.indexOf('_')) {
            return false;
        }
        const keyWithoutChecksum = key.substring(0, lastUnderscoreIndex);
        const checksumPart = key.substring(lastUnderscoreIndex + 1);
        const expectedChecksum = this.calculateChecksum(keyWithoutChecksum);
        return expectedChecksum === checksumPart;
    }
    static hashApiKey(key) {
        return crypto_1.default
            .createHash(this.hashAlgorithm)
            .update(key)
            .digest('hex');
    }
    static encrypt(plaintext) {
        const key = this.getEncryptionKey();
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(this.algorithm, key, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag ? cipher.getAuthTag() : Buffer.alloc(0);
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    }
    static decrypt(data) {
        const key = this.getEncryptionKey();
        const iv = Buffer.from(data.iv, 'hex');
        const tag = Buffer.from(data.tag, 'hex');
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, key, iv);
        if (decipher.setAuthTag && data.tag) {
            decipher.setAuthTag(tag);
        }
        let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    static generateSalt(length = 16) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    static createHmac(data, secret) {
        return crypto_1.default
            .createHmac('sha256', secret)
            .update(data)
            .digest('hex');
    }
    static verifyHmac(data, signature, secret) {
        const expectedSignature = this.createHmac(data, secret);
        return crypto_1.default.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    static generateId() {
        return crypto_1.default.randomUUID();
    }
    static hashWithSalt(data, salt) {
        return crypto_1.default
            .createHash('sha256')
            .update(data + salt)
            .digest('hex');
    }
    static generateTempToken(payload, expiresInSeconds = 3600) {
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
    static verifyTempToken(token) {
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
        }
        catch (error) {
            return { valid: false, error: 'Token parsing failed' };
        }
    }
    static maskSensitiveData(data, visibleChars = 4) {
        if (data.length <= visibleChars * 2) {
            return '*'.repeat(data.length);
        }
        const start = data.slice(0, visibleChars);
        const end = data.slice(-visibleChars);
        const middle = '*'.repeat(data.length - (visibleChars * 2));
        return `${start}${middle}${end}`;
    }
}
exports.CryptoUtils = CryptoUtils;
CryptoUtils.algorithm = api_key_1.API_KEY_CONSTANTS.ENCRYPTION_ALGORITHM;
CryptoUtils.hashAlgorithm = api_key_1.API_KEY_CONSTANTS.HASH_ALGORITHM;
//# sourceMappingURL=crypto.js.map