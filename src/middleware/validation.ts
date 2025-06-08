import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { InputValidator } from '../utils/input-sanitizer';

/**
 * Validation result interface
 */
interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
}

/**
 * Validation error structure
 */
interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Validation middleware options
 */
export interface ValidationOptions {
  /** Validate request body */
  body?: ZodSchema;
  /** Validate query parameters */
  query?: ZodSchema;
  /** Validate URL parameters */
  params?: ZodSchema;
  /** Validate request headers */
  headers?: ZodSchema;
  /** Strip unknown fields from the validated data */
  stripUnknown?: boolean;
  /** Allow partial validation (useful for PATCH requests) */
  partial?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Additional security validation */
  securityChecks?: boolean;
  /** Sanitize after validation */
  sanitize?: boolean;
}

/**
 * Common Zod schemas for API validation
 */
export const CommonSchemas = {
  /** Standard pagination parameters */
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).optional(),
  }),

  /** Form ID parameter validation */
  formId: z.object({
    formId: z.string().min(1, 'Form ID is required').refine(
      (val) => InputValidator.isValidId(val),
      'Form ID contains invalid characters'
    ),
  }),

  /** Workspace ID parameter validation */
  workspaceId: z.object({
    workspaceId: z.string().min(1, 'Workspace ID is required').refine(
      (val) => InputValidator.isValidId(val),
      'Workspace ID contains invalid characters'
    ),
  }),

  /** User ID parameter validation */
  userId: z.object({
    userId: z.string().min(1, 'User ID is required').refine(
      (val) => InputValidator.isValidId(val),
      'User ID contains invalid characters'
    ),
  }),

  /** Submission ID parameter validation */
  submissionId: z.object({
    submissionId: z.string().min(1, 'Submission ID is required').refine(
      (val) => InputValidator.isValidId(val),
      'Submission ID contains invalid characters'
    ),
  }),

  /** Date range query validation */
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    timezone: z.string().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    'Start date must be before or equal to end date'
  ),

  /** File upload validation */
  fileUpload: z.object({
    filename: z.string().min(1).max(255),
    mimetype: z.string().refine(
      (val) => /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/.test(val),
      'Invalid MIME type format'
    ),
    size: z.number().int().min(1).max(50 * 1024 * 1024), // 50MB max
  }),

  /** API key validation */
  apiKey: z.object({
    apiKey: z.string().min(20).max(200).refine(
      (val) => /^[A-Za-z0-9_\-]+$/.test(val),
      'API key contains invalid characters'
    ),
  }),

  /** Email validation */
  email: z.object({
    email: z.string().email('Invalid email format').refine(
      (val) => InputValidator.isValidEmail(val),
      'Email contains potentially unsafe characters'
    ),
  }),

  /** URL validation */
  url: z.object({
    url: z.string().url('Invalid URL format').refine(
      (val) => InputValidator.isValidUrl(val),
      'URL contains unsafe protocol or characters'
    ),
  }),

  /** Search query validation */
  search: z.object({
    q: z.string().min(1).max(200).refine(
      (val) => !InputValidator.containsSqlInjectionPatterns(val),
      'Search query contains potentially dangerous patterns'
    ).refine(
      (val) => !InputValidator.containsXssPatterns(val),
      'Search query contains potentially malicious content'
    ),
    fields: z.array(z.string()).optional(),
    sort: z.enum(['asc', 'desc']).optional(),
  }),
};

/**
 * Creates a validation middleware with the specified schemas
 */
export function createValidationMiddleware(options: ValidationOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    try {
      // Validate request body
      if (options.body) {
        const bodyResult = validateData(req.body || {}, options.body, 'body', options);
        if (!bodyResult.success) {
          errors.push(...bodyResult.errors!);
        } else {
          req.body = bodyResult.data;
        }
      }

      // Validate query parameters
      if (options.query) {
        const queryResult = validateData(req.query || {}, options.query, 'query', options);
        if (!queryResult.success) {
          errors.push(...queryResult.errors!);
        } else {
          req.query = queryResult.data;
        }
      }

      // Validate URL parameters
      if (options.params) {
        const paramsResult = validateData(req.params || {}, options.params, 'params', options);
        if (!paramsResult.success) {
          errors.push(...paramsResult.errors!);
        } else {
          req.params = paramsResult.data;
        }
      }

      // Validate headers
      if (options.headers) {
        const headersResult = validateData(req.headers || {}, options.headers, 'headers', options);
        if (!headersResult.success) {
          errors.push(...headersResult.errors!);
        }
      }

      // Additional security checks
      if (options.securityChecks) {
        const securityErrors = performSecurityChecks(req);
        errors.push(...securityErrors);
      }

      // If there are validation errors, respond with error
      if (errors.length > 0) {
        res.status(400).json({
          error: 'Validation failed',
          message: options.errorMessage || 'Request data is invalid',
          details: errors,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Validation error',
        message: 'An error occurred during request validation',
      });
      return;
    }
  };
}

/**
 * Validates data against a Zod schema
 */
function validateData(
  data: any,
  schema: ZodSchema,
  field: string,
  options: ValidationOptions
): ValidationResult {
  try {
    let processedSchema = schema;
    
    // Apply partial validation if requested
    if (options.partial && 'partial' in schema) {
      processedSchema = (schema as any).partial();
    }

    // Strip unknown fields if requested
    if (options.stripUnknown && 'strip' in processedSchema) {
      processedSchema = (processedSchema as any).strip();
    }

    const result = processedSchema.parse(data);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: `${field}.${err.path.join('.')}`,
        message: err.message,
        code: err.code,
        value: err.path.reduce((obj, key) => obj?.[key], data),
      }));

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: [{
        field,
        message: 'Validation failed',
        code: 'validation_error',
      }],
    };
  }
}

/**
 * Performs additional security checks on the request
 */
function performSecurityChecks(req: Request): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for suspicious patterns in all string values
  const checkObject = (obj: any, prefix: string) => {
    if (typeof obj === 'string') {
      if (InputValidator.containsSqlInjectionPatterns(obj)) {
        errors.push({
          field: prefix,
          message: 'Contains potential SQL injection patterns',
          code: 'security_violation',
          value: obj,
        });
      }
      
      if (InputValidator.containsXssPatterns(obj)) {
        errors.push({
          field: prefix,
          message: 'Contains potential XSS patterns',
          code: 'security_violation',
          value: obj,
        });
      }
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        checkObject(obj[key], `${prefix}.${key}`);
      });
    }
  };

  // Check body, query, and params
  if (req.body) checkObject(req.body, 'body');
  if (req.query) checkObject(req.query, 'query');
  if (req.params) checkObject(req.params, 'params');

  // Check for excessively long values that might be attack attempts
  const checkLength = (obj: any, prefix: string, maxLength: number = 10000) => {
    if (typeof obj === 'string' && obj.length > maxLength) {
      errors.push({
        field: prefix,
        message: `Value exceeds maximum length of ${maxLength} characters`,
        code: 'length_violation',
        value: `${obj.substring(0, 100)}...`,
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        checkLength(obj[key], `${prefix}.${key}`, maxLength);
      });
    }
  };

  if (req.body) checkLength(req.body, 'body');
  if (req.query) checkLength(req.query, 'query', 1000); // Shorter limit for query params

  return errors;
}

/**
 * Pre-built validation middleware for common scenarios
 */
export const ValidationMiddleware = {
  /** Validate pagination parameters */
  pagination: createValidationMiddleware({
    query: CommonSchemas.pagination,
  }),

  /** Validate form ID in URL parameters */
  formParams: createValidationMiddleware({
    params: CommonSchemas.formId,
    securityChecks: true,
  }),

  /** Validate workspace ID in URL parameters */
  workspaceParams: createValidationMiddleware({
    params: CommonSchemas.workspaceId,
    securityChecks: true,
  }),

  /** Validate user ID in URL parameters */
  userParams: createValidationMiddleware({
    params: CommonSchemas.userId,
    securityChecks: true,
  }),

  /** Validate submission ID in URL parameters */
  submissionParams: createValidationMiddleware({
    params: CommonSchemas.submissionId,
    securityChecks: true,
  }),

  /** Validate search queries */
  search: createValidationMiddleware({
    query: CommonSchemas.search,
    securityChecks: true,
  }),

  /** Validate file upload metadata */
  fileUpload: createValidationMiddleware({
    body: CommonSchemas.fileUpload,
    securityChecks: true,
  }),

  /** Validate API key authentication */
  apiKey: createValidationMiddleware({
    headers: z.object({
      'x-api-key': z.string().min(20).max(200),
    }),
    securityChecks: true,
  }),

  /** Comprehensive validation for MCP tool requests */
  mcpRequest: createValidationMiddleware({
    body: z.object({
      method: z.string().min(1).max(100),
      params: z.record(z.any()).optional(),
    }),
    stripUnknown: true,
    securityChecks: true,
  }),
};

/**
 * Helper function to validate data outside of middleware context
 */
export function validateWithSchema<T>(
  data: unknown,
  schema: ZodSchema<T>,
  options: { stripUnknown?: boolean; partial?: boolean } = {}
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = validateData(data, schema, 'data', options);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.errors! };
}

/**
 * Creates a typed validator function for a specific schema
 */
export function createTypedValidator<T>(schema: ZodSchema<T>) {
  return (data: unknown): data is T => {
    try {
      schema.parse(data);
      return true;
    } catch {
      return false;
    }
  };
}

/**
 * Error response formatter for validation failures
 */
export function formatValidationError(errors: ValidationError[]) {
  return {
    error: 'Validation failed',
    message: 'The provided data is invalid',
    details: errors.map(err => ({
      field: err.field,
      message: err.message,
      code: err.code,
    })),
  };
} 