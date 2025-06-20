import { Request, Response, NextFunction } from 'express';
import { apiKeyAuth, AuthenticatedRequest, requireScopes, requireReadAccess, requireWriteAccess, requireAdminAccess, optionalApiKeyAuth, isAuthenticated, getApiKeyInfo } from '../api-key-auth';
import { apiKeyService } from '../../services/api-key-service';
import { ApiKeyScope, ApiKeyValidationResult, ApiKeyStatus } from '../../models/api-key';
import { CryptoUtils } from '../../utils/crypto';

// Mock the apiKeyService
jest.mock('../../services/api-key-service');
const mockedApiKeyService = apiKeyService as jest.Mocked<typeof apiKeyService>;

// Mock CryptoUtils
jest.mock('../../utils/crypto');
const mockedCryptoUtils = CryptoUtils as jest.Mocked<typeof CryptoUtils>;

describe('API Key Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  let statusSpy: jest.SpyInstance;
  let jsonSpy: jest.SpyInstance;

  // Default valid API key data for successful tests
  const validApiKeyData = {
    id: 'test-key-id',
    keyHash: 'hashed-test-key',
    name: 'Test Key',
    scopes: [ApiKeyScope.READ],
    usageCount: 0,
    status: ApiKeyStatus.ACTIVE,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z')
  };

  const validValidationResult: ApiKeyValidationResult = {
    isValid: true,
    apiKey: validApiKeyData,
    remainingUsage: 100,
    expiresIn: 86400
  };

  beforeEach(() => {
    mockRequest = {
      headers: {},
      query: {},
      socket: { remoteAddress: '127.0.0.1' } as any,
      method: 'GET',
      path: '/test'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    statusSpy = jest.spyOn(mockResponse, 'status');
    jsonSpy = jest.spyOn(mockResponse, 'json');
    (nextFunction as jest.Mock).mockClear();
    
    // Reset all mocks
    mockedApiKeyService.validateApiKey.mockClear();
    mockedApiKeyService.hasRequiredScopes.mockClear();
    mockedCryptoUtils.maskSensitiveData.mockClear();
    
    // Set up default successful mock implementations
    mockedApiKeyService.validateApiKey.mockResolvedValue(validValidationResult);
    mockedApiKeyService.hasRequiredScopes.mockReturnValue(true);
    mockedCryptoUtils.maskSensitiveData.mockReturnValue('masked-key-id');
  });

  describe('API Key Extraction', () => {
    it('should extract API key from x-api-key header', async () => {
      mockRequest.headers = { 'x-api-key': 'test-key' };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'test-key' })
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should extract API key from Bearer token', async () => {
      mockRequest.headers = { 'authorization': 'Bearer test-key' };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'test-key' })
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should extract API key from ApiKey prefix', async () => {
      mockRequest.headers = { 'authorization': 'ApiKey test-key' };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'test-key' })
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should extract API key from query parameter in non-production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      mockRequest.query = { apiKey: 'test-key' };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'test-key' })
      );
      expect(nextFunction).toHaveBeenCalled();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('IP Address Detection', () => {
    it('should detect IP from x-forwarded-for header', async () => {
      mockRequest.headers = {
        'x-api-key': 'test-key',
        'x-forwarded-for': '192.168.1.1, 10.0.0.1'
      };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: '192.168.1.1' })
      );
    });

    it('should detect IP from x-real-ip header', async () => {
      mockRequest.headers = {
        'x-api-key': 'test-key',
        'x-real-ip': '192.168.1.1'
      };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: '192.168.1.1' })
      );
    });

    it('should detect IP from cf-connecting-ip header', async () => {
      mockRequest.headers = {
        'x-api-key': 'test-key',
        'cf-connecting-ip': '192.168.1.1'
      };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: '192.168.1.1' })
      );
    });
  });

  describe('Validation and Error Handling', () => {
    it('should handle missing API key', async () => {
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication failed',
          code: 'MISSING_API_KEY'
        })
      );
    });

    it('should handle expired API key', async () => {
      mockRequest.headers = { 'x-api-key': 'expired-key' };
      mockedApiKeyService.validateApiKey.mockResolvedValue({
        isValid: false,
        errorReason: 'API key has expired',
        expiresIn: -1
      });

      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'EXPIRED_API_KEY',
          expiresIn: -1
        })
      );
    });

    it('should handle revoked API key', async () => {
      mockRequest.headers = { 'x-api-key': 'revoked-key' };
      mockedApiKeyService.validateApiKey.mockResolvedValue({
        isValid: false,
        errorReason: 'API key has been revoked'
      });

      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'REVOKED_API_KEY'
        })
      );
    });

    it('should handle usage limit exceeded', async () => {
      mockRequest.headers = { 'x-api-key': 'limited-key' };
      mockedApiKeyService.validateApiKey.mockResolvedValue({
        isValid: false,
        errorReason: 'API key usage limit exceeded',
        remainingUsage: 0
      });

      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(statusSpy).toHaveBeenCalledWith(429);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'USAGE_LIMIT_EXCEEDED',
          remainingUsage: 0
        })
      );
    });

    it('should handle IP whitelist violation', async () => {
      mockRequest.headers = { 'x-api-key': 'ip-restricted-key' };
      mockedApiKeyService.validateApiKey.mockResolvedValue({
        isValid: false,
        errorReason: 'IP address not authorized'
      });

      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'IP_NOT_WHITELISTED'
        })
      );
    });
  });

  describe('Scope Validation', () => {
    it('should validate required scopes', async () => {
      mockRequest.headers = { 'x-api-key': 'test-key' };
      // Set up specific validation result with proper API key for scope validation
      mockedApiKeyService.validateApiKey.mockResolvedValue({
        isValid: true,
        apiKey: { ...validApiKeyData, scopes: [ApiKeyScope.READ] },
        remainingUsage: 100
      });
      
      const middleware = apiKeyAuth({ requiredScopes: [ApiKeyScope.READ] });
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.hasRequiredScopes).toHaveBeenCalledWith(
        expect.anything(),
        [ApiKeyScope.READ]
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle insufficient scopes', async () => {
      mockRequest.headers = { 'x-api-key': 'test-key' };
      // Set up validation to succeed but scope check to fail
      mockedApiKeyService.validateApiKey.mockResolvedValue({
        isValid: true,
        apiKey: { ...validApiKeyData, scopes: [ApiKeyScope.READ] },
        remainingUsage: 100
      });
      mockedApiKeyService.hasRequiredScopes.mockReturnValue(false);
      
      const middleware = apiKeyAuth({ requiredScopes: [ApiKeyScope.ADMIN] });
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INSUFFICIENT_SCOPES'
        })
      );
    });
  });

  describe('Optional Authentication', () => {
    it('should allow requests without API key when optional', async () => {
      await optionalApiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should still validate API key when provided in optional mode', async () => {
      mockRequest.headers = { 'x-api-key': 'test-key' };
      await optionalApiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    it('should check if request is authenticated', async () => {
      mockRequest.headers = { 'x-api-key': 'test-key' };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(isAuthenticated(mockRequest as AuthenticatedRequest)).toBe(true);
    });

    it('should return API key info', async () => {
      mockRequest.headers = { 'x-api-key': 'test-key' };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      const keyInfo = getApiKeyInfo(mockRequest as AuthenticatedRequest);
      expect(keyInfo).toEqual({
        id: 'test-key-id',
        name: 'Test Key',
        scopes: [ApiKeyScope.READ],
        usageCount: 0,
        remainingUsage: 100,
        expiresIn: 86400
      });
    });
  });

  describe('Security Headers', () => {
    it('should set security headers on successful authentication', async () => {
      mockRequest.headers = { 'x-api-key': 'test-key' };
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-API-Key-ID', 'masked-key-id');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Rate-Limit-Remaining', '100');
    });
  });
}); 