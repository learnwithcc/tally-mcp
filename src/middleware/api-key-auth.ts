import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/api-key-service';
import { ApiKeyScope, ApiKeyValidationResult } from '../models/api-key';
import { CryptoUtils } from '../utils/crypto';

/**
 * Extended Request interface to include API key information
 */
export interface AuthenticatedRequest extends Request {
  apiKey?: {
    id: string;
    name: string;
    scopes: ApiKeyScope[];
    usageCount: number;
    remainingUsage?: number;
    expiresIn?: number;
  };
}

/**
 * Options for API key authentication middleware
 */
export interface ApiKeyAuthOptions {
  /**
   * Required scopes for the endpoint
   */
  requiredScopes?: ApiKeyScope[];
  
  /**
   * Whether to allow requests without API keys (optional authentication)
   */
  optional?: boolean;
  
  /**
   * Custom error messages
   */
  errorMessages?: {
    missing?: string;
    invalid?: string;
    insufficientScopes?: string;
    expired?: string;
    revoked?: string;
    usageLimitExceeded?: string;
    ipNotWhitelisted?: string;
  };
  
  /**
   * Header name for API key (default: 'x-api-key')
   */
  headerName?: string;
  
  /**
   * Whether to log authentication attempts
   */
  logAttempts?: boolean;
}

/**
 * Default options for API key authentication
 */
const defaultOptions: Required<ApiKeyAuthOptions> = {
  requiredScopes: [],
  optional: false,
  errorMessages: {
    missing: 'API key is required',
    invalid: 'Invalid API key',
    insufficientScopes: 'Insufficient permissions',
    expired: 'API key has expired',
    revoked: 'API key has been revoked',
    usageLimitExceeded: 'API key usage limit exceeded',
    ipNotWhitelisted: 'IP address not authorized for this API key'
  },
  headerName: 'x-api-key',
  logAttempts: true
};

/**
 * Extract API key from request headers
 */
function extractApiKey(req: Request, headerName: string): string | null {
  // Try the configured header first
  let apiKey = req.headers[headerName] as string;
  
  // Try common variations
  if (!apiKey) {
    apiKey = req.headers['authorization'] as string;
    if (apiKey && apiKey.startsWith('Bearer ')) {
      apiKey = apiKey.slice(7);
    } else if (apiKey && apiKey.startsWith('ApiKey ')) {
      apiKey = apiKey.slice(7);
    }
  }
  
  // Try query parameter as fallback (not recommended for production)
  if (!apiKey && process.env.NODE_ENV !== 'production') {
    apiKey = req.query.apiKey as string || req.query.api_key as string;
  }
  
  return apiKey ? apiKey.trim() : null;
}

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for'] as string;
  const xRealIp = req.headers['x-real-ip'] as string;
  const cfConnectingIp = req.headers['cf-connecting-ip'] as string;
  
  // Try various headers
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0]?.trim() || '';
  }
  
  if (xRealIp) {
    return xRealIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return req.socket.remoteAddress || req.ip || 'unknown';
}

/**
 * API Key Authentication Middleware
 */
export function apiKeyAuth(options: ApiKeyAuthOptions = {}): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  const config = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    
    try {
      // Extract API key from request
      const apiKey = extractApiKey(req, config.headerName);
      
      // Handle missing API key
      if (!apiKey) {
        if (config.optional) {
          return next();
        }
        
        if (config.logAttempts) {
          console.log(`API key authentication failed - Missing key for ${req.method} ${req.path} from ${getClientIp(req)}`);
        }
        
        res.status(401).json({
          error: 'Authentication failed',
          message: config.errorMessages.missing,
          code: 'MISSING_API_KEY'
        });
        return;
      }
      
      // Validate API key
      const validationResult: ApiKeyValidationResult = await apiKeyService.validateApiKey({
        key: apiKey,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        endpoint: `${req.method} ${req.path}`
      });
      
      // Handle validation failure
      if (!validationResult.isValid) {
        const responseTime = Date.now() - startTime;
        
        if (config.logAttempts) {
          console.log(`API key authentication failed - ${validationResult.errorReason} for ${req.method} ${req.path} from ${getClientIp(req)} (${responseTime}ms)`);
        }
        
        let statusCode = 401;
        let errorCode = 'INVALID_API_KEY';
        let message = config.errorMessages.invalid;
        
        // Customize error response based on failure reason
        if (validationResult.errorReason?.includes('expired')) {
          statusCode = 401;
          errorCode = 'EXPIRED_API_KEY';
          message = config.errorMessages.expired;
        } else if (validationResult.errorReason?.includes('revoked')) {
          statusCode = 403;
          errorCode = 'REVOKED_API_KEY';
          message = config.errorMessages.revoked;
        } else if (validationResult.errorReason?.includes('usage limit')) {
          statusCode = 429;
          errorCode = 'USAGE_LIMIT_EXCEEDED';
          message = config.errorMessages.usageLimitExceeded;
        } else if (validationResult.errorReason?.includes('IP')) {
          statusCode = 403;
          errorCode = 'IP_NOT_WHITELISTED';
          message = config.errorMessages.ipNotWhitelisted;
        }
        
        res.status(statusCode).json({
          error: 'Authentication failed',
          message,
          code: errorCode,
          ...(validationResult.remainingUsage !== undefined && { remainingUsage: validationResult.remainingUsage }),
          ...(validationResult.expiresIn !== undefined && { expiresIn: validationResult.expiresIn })
        });
        return;
      }
      
      // Check required scopes
      if (config.requiredScopes.length > 0 && validationResult.apiKey) {
        const hasRequiredScopes = apiKeyService.hasRequiredScopes(validationResult.apiKey, config.requiredScopes);
        
        if (!hasRequiredScopes) {
          if (config.logAttempts) {
            console.log(`API key authorization failed - Insufficient scopes for ${req.method} ${req.path}. Required: ${config.requiredScopes.join(', ')}, Has: ${validationResult.apiKey.scopes.join(', ')}`);
          }
          
          res.status(403).json({
            error: 'Authorization failed',
            message: config.errorMessages.insufficientScopes,
            code: 'INSUFFICIENT_SCOPES',
            requiredScopes: config.requiredScopes,
            availableScopes: validationResult.apiKey.scopes
          });
          return;
        }
      }
      
      // Attach API key info to request
      if (validationResult.apiKey) {
        const apiKeyInfo: AuthenticatedRequest['apiKey'] = {
          id: validationResult.apiKey.id,
          name: validationResult.apiKey.name,
          scopes: validationResult.apiKey.scopes,
          usageCount: validationResult.apiKey.usageCount
        };
        
        if (validationResult.remainingUsage !== undefined) {
          apiKeyInfo.remainingUsage = validationResult.remainingUsage;
        }
        
        if (validationResult.expiresIn !== undefined) {
          apiKeyInfo.expiresIn = validationResult.expiresIn;
        }
        
        (req as AuthenticatedRequest).apiKey = apiKeyInfo;
      }
      
      // Add security headers
      res.setHeader('X-API-Key-ID', CryptoUtils.maskSensitiveData(validationResult.apiKey?.id || 'unknown'));
      res.setHeader('X-Rate-Limit-Remaining', validationResult.remainingUsage?.toString() || 'unlimited');
      
      if (config.logAttempts) {
        const responseTime = Date.now() - startTime;
        console.log(`API key authentication successful for ${validationResult.apiKey?.name} - ${req.method} ${req.path} (${responseTime}ms)`);
      }
      
      next();
      
    } catch (error) {
      console.error('API key authentication error:', error);
      
      res.status(500).json({
        error: 'Authentication error',
        message: 'Internal server error during authentication',
        code: 'INTERNAL_ERROR'
      });
      return;
    }
  };
}

/**
 * Middleware factory for specific scope requirements
 */
export const requireScopes = (scopes: ApiKeyScope[]) => apiKeyAuth({ requiredScopes: scopes });

/**
 * Middleware for read-only access
 */
export const requireReadAccess = () => apiKeyAuth({ 
  requiredScopes: [ApiKeyScope.READ] 
});

/**
 * Middleware for write access
 */
export const requireWriteAccess = () => apiKeyAuth({ 
  requiredScopes: [ApiKeyScope.WRITE] 
});

/**
 * Middleware for admin access
 */
export const requireAdminAccess = () => apiKeyAuth({ 
  requiredScopes: [ApiKeyScope.ADMIN] 
});

/**
 * Middleware for forms read access
 */
export const requireFormsReadAccess = () => apiKeyAuth({ 
  requiredScopes: [ApiKeyScope.FORMS_READ] 
});

/**
 * Middleware for forms write access
 */
export const requireFormsWriteAccess = () => apiKeyAuth({ 
  requiredScopes: [ApiKeyScope.FORMS_WRITE] 
});

/**
 * Middleware for submissions read access
 */
export const requireSubmissionsReadAccess = () => apiKeyAuth({ 
  requiredScopes: [ApiKeyScope.SUBMISSIONS_READ] 
});

/**
 * Middleware for submissions write access
 */
export const requireSubmissionsWriteAccess = () => apiKeyAuth({ 
  requiredScopes: [ApiKeyScope.SUBMISSIONS_WRITE] 
});

/**
 * Optional authentication middleware (doesn't fail if no API key)
 */
export const optionalApiKeyAuth = () => apiKeyAuth({ optional: true });

/**
 * Helper function to check if request is authenticated
 */
export function isAuthenticated(req: Request): boolean {
  return !!(req as AuthenticatedRequest).apiKey;
}

/**
 * Helper function to get API key info from request
 */
export function getApiKeyInfo(req: Request): AuthenticatedRequest['apiKey'] | undefined {
  return (req as AuthenticatedRequest).apiKey;
} 