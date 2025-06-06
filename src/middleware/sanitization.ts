import { Request, Response, NextFunction } from 'express';
import { sanitizeObject, sanitizeString, SanitizationPresets, SanitizationOptions } from '../utils/input-sanitizer';

/**
 * Middleware configuration for request sanitization
 */
export interface SanitizationMiddlewareOptions {
  /** Sanitization options for request body */
  bodyOptions?: SanitizationOptions;
  /** Sanitization options for query parameters */
  queryOptions?: SanitizationOptions;
  /** Sanitization options for URL parameters */
  paramsOptions?: SanitizationOptions;
  /** Skip sanitization for specific routes (regex patterns) */
  skipRoutes?: RegExp[];
  /** Custom sanitization logic for specific fields */
  customSanitizers?: Record<string, (value: any) => any>;
}

/**
 * Default configuration for API sanitization
 */
const DEFAULT_OPTIONS: Required<SanitizationMiddlewareOptions> = {
  bodyOptions: SanitizationPresets.FORM_INPUT,
  queryOptions: SanitizationPresets.API_PARAM,
  paramsOptions: SanitizationPresets.API_PARAM,
  skipRoutes: [],
  customSanitizers: {},
};

/**
 * Creates a sanitization middleware with the specified options
 * 
 * @param options - Configuration options for sanitization
 * @returns Express middleware function
 */
export function createSanitizationMiddleware(
  options: SanitizationMiddlewareOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if route should be skipped
      const shouldSkip = config.skipRoutes.some(pattern => pattern.test(req.path));
      if (shouldSkip) {
        return next();
      }

      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeRequestObject(req.body, config.bodyOptions, config.customSanitizers);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeRequestObject(req.query, config.queryOptions, config.customSanitizers);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeRequestObject(req.params, config.paramsOptions, config.customSanitizers);
      }

      next();
    } catch (error) {
      // If sanitization fails, it's likely a security issue - reject the request
      res.status(400).json({
        error: 'Invalid request data',
        message: 'Request contains invalid or potentially malicious content',
      });
    }
  };
}

/**
 * Sanitizes a request object with custom sanitizers
 */
function sanitizeRequestObject(
  obj: Record<string, any>,
  options: SanitizationOptions,
  customSanitizers: Record<string, (value: any) => any>
): Record<string, any> {
  // First apply standard sanitization
  const sanitized = sanitizeObject(obj, options);

  // Then apply custom sanitizers for specific fields
  for (const [fieldName, sanitizer] of Object.entries(customSanitizers)) {
    if (sanitized[fieldName] !== undefined) {
      sanitized[fieldName] = sanitizer(sanitized[fieldName]);
    }
  }

  return sanitized;
}

/**
 * Specific sanitization middleware for different types of content
 */
export const SanitizationMiddleware = {
  /**
   * Strict sanitization for API endpoints that handle IDs and parameters
   */
  apiParams: createSanitizationMiddleware({
    bodyOptions: SanitizationPresets.API_PARAM,
    queryOptions: SanitizationPresets.API_PARAM,
    paramsOptions: SanitizationPresets.API_PARAM,
  }),

  /**
   * Form input sanitization for endpoints that handle user-generated content
   */
  formInput: createSanitizationMiddleware({
    bodyOptions: SanitizationPresets.FORM_INPUT,
    queryOptions: SanitizationPresets.API_PARAM,
    paramsOptions: SanitizationPresets.API_PARAM,
  }),

  /**
   * Rich text sanitization for endpoints that handle formatted content
   */
  richText: createSanitizationMiddleware({
    bodyOptions: SanitizationPresets.RICH_TEXT,
    queryOptions: SanitizationPresets.API_PARAM,
    paramsOptions: SanitizationPresets.API_PARAM,
  }),

  /**
   * Custom sanitization for MCP tool requests
   */
  mcpTools: createSanitizationMiddleware({
    bodyOptions: SanitizationPresets.FORM_INPUT,
    queryOptions: SanitizationPresets.API_PARAM,
    paramsOptions: SanitizationPresets.API_PARAM,
    customSanitizers: {
      // Sanitize form IDs to ensure they're safe
      formId: (value: any) => {
        if (typeof value === 'string') {
          return sanitizeString(value, SanitizationPresets.API_PARAM);
        }
        return value;
      },
      // Sanitize workspace IDs
      workspaceId: (value: any) => {
        if (typeof value === 'string') {
          return sanitizeString(value, SanitizationPresets.API_PARAM);
        }
        return value;
      },
      // Sanitize user IDs
      userId: (value: any) => {
        if (typeof value === 'string') {
          return sanitizeString(value, SanitizationPresets.API_PARAM);
        }
        return value;
      },
    },
  }),
};

/**
 * Manual sanitization functions for specific use cases
 */
export const ManualSanitization = {
  /**
   * Sanitizes form data before sending to Tally API
   */
  formData: (data: Record<string, any>) => {
    return sanitizeObject(data, SanitizationPresets.FORM_INPUT);
  },

  /**
   * Sanitizes API response data from external sources
   */
  apiResponse: (data: Record<string, any>) => {
    return sanitizeObject(data, SanitizationPresets.STRICT);
  },

  /**
   * Sanitizes user profile data
   */
  userProfile: (data: Record<string, any>) => {
    return sanitizeObject(data, {
      allowBasicFormatting: false,
      allowLinks: false,
      stripAllHtml: true,
    });
  },

  /**
   * Sanitizes log messages to prevent log injection
   */
  logMessage: (message: string) => {
    return sanitizeString(message, {
      stripAllHtml: true,
      allowBasicFormatting: false,
      allowLinks: false,
    }).replace(/[\r\n\t]/g, ' '); // Remove line breaks that could break log format
  },
}; 