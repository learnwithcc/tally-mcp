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
    mockedApiKeyService.validateApiKey.mockClear();
  });

  describe('apiKeyAuth', () => {
    it('should call next() if API key is valid', async () => {
      mockRequest.headers = { 'x-api-key': 'valid-key' };
      const validationResult: ApiKeyValidationResult = {
        isValid: true,
        apiKey: {
          id: 'key-id',
          name: 'Test Key',
          scopes: [ApiKeyScope.READ],
          usageCount: 1,
          keyHash: 'hashed-key',
          status: ApiKeyStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);

      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith({
        key: 'valid-key',
        ipAddress: '127.0.0.1',
        userAgent: undefined,
        endpoint: 'GET /test',
      });
      expect(nextFunction).toHaveBeenCalled();
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
      expect((mockRequest as AuthenticatedRequest).apiKey).toBeDefined();
      expect((mockRequest as AuthenticatedRequest).apiKey?.id).toBe('key-id');
    });

    it('should return 401 if API key is missing', async () => {
      await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        code: 'MISSING_API_KEY',
      }));
    });

    it('should call next() if API key is missing but auth is optional', async () => {
      await apiKeyAuth({ optional: true })(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('should return 401 if API key is invalid', async () => {
        mockRequest.headers = { 'x-api-key': 'invalid-key' };
        const validationResult: ApiKeyValidationResult = {
          isValid: false,
          errorReason: 'Invalid key',
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);
      
        await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      
        expect(nextFunction).not.toHaveBeenCalled();
        expect(statusSpy).toHaveBeenCalledWith(401);
        expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
          code: 'INVALID_API_KEY',
          message: 'Invalid API key',
        }));
      });
      
      it('should return 401 if API key is expired', async () => {
        mockRequest.headers = { 'x-api-key': 'expired-key' };
        const validationResult: ApiKeyValidationResult = {
          isValid: false,
          errorReason: 'Key has expired',
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);
      
        await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      
        expect(nextFunction).not.toHaveBeenCalled();
        expect(statusSpy).toHaveBeenCalledWith(401);
        expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
          code: 'EXPIRED_API_KEY',
          message: 'API key has expired',
        }));
      });
      
      it('should return 403 if API key is revoked', async () => {
        mockRequest.headers = { 'x-api-key': 'revoked-key' };
        const validationResult: ApiKeyValidationResult = {
          isValid: false,
          errorReason: 'Key has been revoked',
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);
      
        await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      
        expect(nextFunction).not.toHaveBeenCalled();
        expect(statusSpy).toHaveBeenCalledWith(403);
        expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
          code: 'REVOKED_API_KEY',
          message: 'API key has been revoked',
        }));
      });
      
      it('should return 429 if usage limit is exceeded', async () => {
        mockRequest.headers = { 'x-api-key': 'limit-exceeded-key' };
        const validationResult: ApiKeyValidationResult = {
          isValid: false,
          errorReason: 'Usage limit exceeded',
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);
      
        await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      
        expect(nextFunction).not.toHaveBeenCalled();
        expect(statusSpy).toHaveBeenCalledWith(429);
        expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
          code: 'USAGE_LIMIT_EXCEEDED',
          message: 'API key usage limit exceeded',
        }));
      });
      
      it('should return 403 if IP is not whitelisted', async () => {
        mockRequest.headers = { 'x-api-key': 'ip-restricted-key' };
        const validationResult: ApiKeyValidationResult = {
          isValid: false,
          errorReason: 'IP address not authorized',
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);
      
        await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
      
        expect(nextFunction).not.toHaveBeenCalled();
        expect(statusSpy).toHaveBeenCalledWith(403);
        expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
          code: 'IP_NOT_WHITELISTED',
          message: 'IP address not authorized for this API key',
        }));
      });
    
    it('should return 403 if scopes are insufficient', async () => {
      mockRequest.headers = { 'x-api-key': 'valid-key-insufficient-scopes' };
      const validationResult: ApiKeyValidationResult = {
        isValid: true,
        apiKey: { 
          id: 'key-id', 
          name: 'Test Key', 
          scopes: [ApiKeyScope.FORMS_READ],
          keyHash: 'hashed-key',
          status: ApiKeyStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
        },
      };
      mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);
  
      await apiKeyAuth({ requiredScopes: [ApiKeyScope.FORMS_WRITE] })(mockRequest as Request, mockResponse as Response, nextFunction);
  
      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        code: 'INSUFFICIENT_SCOPES',
      }));
    });

    it('should extract API key from Authorization Bearer header', async () => {
        mockRequest.headers = { 'authorization': 'Bearer valid-key' };
        const validationResult: ApiKeyValidationResult = { 
            isValid: true, 
            apiKey: { 
                id: 'key-id', 
                name: 'Test Key', 
                scopes: [],
                keyHash: 'hashed-key',
                status: ApiKeyStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
                usageCount: 0,
            } 
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);
    
        await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
    
        expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(expect.objectContaining({ key: 'valid-key' }));
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should extract API key from query parameter in non-production environment', async () => {
        process.env.NODE_ENV = 'development';
        mockRequest.query = { apiKey: 'valid-key-query' };
        const validationResult: ApiKeyValidationResult = { 
            isValid: true, 
            apiKey: { 
                id: 'key-id', 
                name: 'Test Key', 
                scopes: [],
                keyHash: 'hashed-key',
                status: ApiKeyStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
                usageCount: 0,
            } 
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);

        await apiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockedApiKeyService.validateApiKey).toHaveBeenCalledWith(expect.objectContaining({ key: 'valid-key-query' }));
        expect(nextFunction).toHaveBeenCalled();
        process.env.NODE_ENV = 'test'; // Reset NODE_ENV
    });
  });

  describe('Scope Requirement Helpers', () => {
    beforeEach(() => {
      const validationResult: ApiKeyValidationResult = {
        isValid: true,
        apiKey: {
          id: 'key-id',
          name: 'Test Key',
          scopes: [ApiKeyScope.FORMS_READ, ApiKeyScope.FORMS_WRITE, ApiKeyScope.ADMIN],
          keyHash: 'hashed-key',
          status: ApiKeyStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
        },
      };
      mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);
      mockRequest.headers = { 'x-api-key': 'valid-key' };
    });
  
    it('requireScopes should succeed with adequate scopes', async () => {
      await requireScopes([ApiKeyScope.FORMS_READ])(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });
  
    it('requireReadAccess should succeed with READ scope', async () => {
        const readValidationResult: ApiKeyValidationResult = {
            isValid: true,
            apiKey: { 
                id: 'key-id', 
                name: 'Test Key', 
                scopes: [ApiKeyScope.READ],
                keyHash: 'hashed-key',
                status: ApiKeyStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
                usageCount: 0,
            },
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(readValidationResult);
        await requireReadAccess()(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });

    it('requireWriteAccess should fail without WRITE scopes', async () => {
        const readValidationResult: ApiKeyValidationResult = {
            isValid: true,
            apiKey: { 
                id: 'key-id', 
                name: 'Test Key', 
                scopes: [ApiKeyScope.READ],
                keyHash: 'hashed-key',
                status: ApiKeyStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
                usageCount: 0,
            },
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(readValidationResult);
        await requireWriteAccess()(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(statusSpy).toHaveBeenCalledWith(403);
    });

    it('requireAdminAccess should succeed with ADMIN scope', async () => {
        const adminValidationResult: ApiKeyValidationResult = {
            isValid: true,
            apiKey: { 
                id: 'key-id', 
                name: 'Test Key', 
                scopes: [ApiKeyScope.ADMIN],
                keyHash: 'hashed-key',
                status: ApiKeyStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
                usageCount: 0,
            },
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(adminValidationResult);
        await requireAdminAccess()(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('optionalApiKeyAuth', () => {
    it('should call next() when no key is provided', async () => {
        await optionalApiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.apiKey).toBeUndefined();
    });

    it('should authenticate and attach apiKey when a valid key is provided', async () => {
        mockRequest.headers = { 'x-api-key': 'valid-key' };
        const validationResult: ApiKeyValidationResult = {
          isValid: true,
          apiKey: { 
            id: 'key-id', 
            name: 'Test Key', 
            scopes: [ApiKeyScope.READ],
            keyHash: 'hashed-key',
            status: ApiKeyStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0,
          },
        };
        mockedApiKeyService.validateApiKey.mockResolvedValue(validationResult);

        await optionalApiKeyAuth()(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.apiKey).toBeDefined();
        expect(mockRequest.apiKey?.id).toBe('key-id');
    });
  });

  describe('Utility Functions', () => {
    it('isAuthenticated should return true if apiKey is on request', () => {
        mockRequest.apiKey = { id: 'key-id', name: 'Test Key', scopes: [], usageCount: 0 };
        expect(isAuthenticated(mockRequest as AuthenticatedRequest)).toBe(true);
    });

    it('isAuthenticated should return false if apiKey is not on request', () => {
        expect(isAuthenticated(mockRequest as AuthenticatedRequest)).toBe(false);
    });

    it('getApiKeyInfo should return apiKey info', () => {
        const apiKeyInfo = { id: 'key-id', name: 'Test Key', scopes: [], usageCount: 0 };
        mockRequest.apiKey = apiKeyInfo;
        expect(getApiKeyInfo(mockRequest as AuthenticatedRequest)).toEqual(apiKeyInfo);
    });

    it('getApiKeyInfo should return undefined if no apiKey is on request', () => {
        expect(getApiKeyInfo(mockRequest as AuthenticatedRequest)).toBeUndefined();
    });
  });
}); 