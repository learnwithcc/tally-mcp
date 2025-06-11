import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';

// Environment configuration schema
const securityConfigSchema = z.object({
  allowedOrigins: z.string().default('*'),
  corsMaxAge: z.number().default(86400), // 24 hours
  enableHSTS: z.boolean().default(true),
  hstsMaxAge: z.number().default(31536000), // 1 year
  enableCSP: z.boolean().default(true),
  logSecurityEvents: z.boolean().default(true),
});

type SecurityConfig = z.infer<typeof securityConfigSchema>;

/**
 * Parse allowed origins from environment variable
 */
function parseAllowedOrigins(origins: string): string[] | boolean {
  if (origins === '*') {
    return true; // Allow all origins
  }
  
  if (origins === 'false' || origins === 'none') {
    return false; // Allow no origins
  }
  
  // Parse comma-separated list of origins
  return origins.split(',').map(origin => origin.trim()).filter(Boolean);
}

/**
 * Get security configuration from environment variables
 */
function getSecurityConfig(): SecurityConfig {
  const config = {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS || '*',
    corsMaxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
    enableHSTS: process.env.ENABLE_HSTS !== 'false',
    hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
    enableCSP: process.env.ENABLE_CSP !== 'false',
    logSecurityEvents: process.env.LOG_SECURITY_EVENTS !== 'false',
  };

  return securityConfigSchema.parse(config);
}

/**
 * Security event logger middleware
 */
export function securityLogger(req: Request, _res: Response, next: NextFunction): void {
  const config = getSecurityConfig();
  
  if (!config.logSecurityEvents) {
    return next();
  }

  const securityInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    referer: req.get('Referer'),
    contentType: req.get('Content-Type'),
    acceptEncoding: req.get('Accept-Encoding'),
    authorization: req.get('Authorization') ? '[REDACTED]' : undefined,
  };

  // Log security-relevant information (without sensitive data)
  console.log('Security Log:', JSON.stringify(securityInfo, null, 2));
  
  next();
}

/**
 * Configure CORS with security best practices
 */
export function configureCORS() {
  const config = getSecurityConfig();
  const allowedOrigins = parseAllowedOrigins(config.allowedOrigins);

  return cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    credentials: true,
    maxAge: config.corsMaxAge,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}

/**
 * Configure security headers using helmet
 */
export function configureSecurityHeaders() {
  const config = getSecurityConfig();

  return helmet({
    // Content Security Policy
    contentSecurityPolicy: config.enableCSP ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.tally.so"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
      reportOnly: false,
    } : false,

    // Strict Transport Security (HSTS)
    hsts: config.enableHSTS ? {
      maxAge: config.hstsMaxAge,
      includeSubDomains: true,
      preload: true,
    } : false,

    // X-Content-Type-Options
    noSniff: true,

    // X-Frame-Options
    frameguard: {
      action: 'deny',
    },

    // X-XSS-Protection (legacy, but still useful for older browsers)
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: {
      policy: ['no-referrer-when-downgrade'],
    },

    // X-Permitted-Cross-Domain-Policies
    permittedCrossDomainPolicies: false,

    // X-DNS-Prefetch-Control
    dnsPrefetchControl: {
      allow: false,
    },

    // Expect-CT is deprecated and removed from helmet v7+

    // Remove X-Powered-By header
    hidePoweredBy: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: false, // May interfere with API responses

    // Cross-Origin-Opener-Policy
    crossOriginOpenerPolicy: {
      policy: 'same-origin-allow-popups',
    },

    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  });
}

/**
 * Custom security middleware for additional protections
 */
export function customSecurityMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Set custom security headers
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || generateRequestId());
  
  // Prevent caching of sensitive endpoints
  if (req.path.includes('/api/') && req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // Add timing attack protection for authentication endpoints
  if (req.path.includes('/auth') || req.path.includes('/login')) {
    // Add small random delay to prevent timing attacks
    const delay = Math.random() * 100; // 0-100ms
    setTimeout(() => next(), delay);
    return;
  }

  next();
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Security validation middleware for request integrity
 */
export function securityValidation(req: Request, res: Response, next: NextFunction): void {
  const decodedUrl = decodeURIComponent(req.url);
  const originalUrl = req.originalUrl;

  // 1. Directory Traversal
  if (decodedUrl.includes('../') || decodedUrl.includes('..\\\\') || originalUrl.includes('../') || originalUrl.includes('..\\\\')) {
    console.warn(`Security Warning: Directory traversal attempt detected: ${req.url}`);
    res.status(400).json({
      error: 'Invalid request path',
      code: 'SECURITY_VIOLATION',
      message: 'Directory traversal is not permitted.',
    });
    return;
  }

  // 2. Null Byte Injection
  if (decodedUrl.includes('\\0') || originalUrl.includes('\\0') || decodedUrl.includes('%00') || originalUrl.includes('%00')) {
    console.warn(`Security Warning: Null byte detected in URL: ${req.url}`);
    res.status(400).json({
      error: 'Invalid request path',
      code: 'SECURITY_VIOLATION',
      message: 'Null bytes are not permitted in the URL.',
    });
    return;
  }

  // 3. XSS and JavaScript Protocol
  const xssPatterns = /<script|javascript:|onerror|onload|onmouseover/i;
  if (xssPatterns.test(decodedUrl)) {
    console.warn(`Security Warning: XSS or JavaScript protocol attempt detected: ${req.url}`);
    res.status(400).json({
      error: 'Invalid request path',
      code: 'SECURITY_VIOLATION',
      message: 'XSS and JavaScript protocol are not permitted.',
    });
    return;
  }

  // 4. User-Agent Validation
  const userAgent = req.headers['user-agent'];
  if (!userAgent) {
    console.warn('Security Warning: Missing or empty User-Agent header.');
  } else if (userAgent.length > 256) {
    console.warn(`Security Warning: Oversized User-Agent header: ${userAgent.length} chars`);
  }

  // 5. Content-Length Validation
  const contentLength = req.headers['content-length'];
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    if (isNaN(length) || length < 0) {
      console.warn(`Security Warning: Invalid Content-Length header: ${contentLength}`);
      res.status(400).json({
        error: 'Invalid Content-Length',
        code: 'INVALID_CONTENT_LENGTH',
        message: 'Content-Length header is not a valid non-negative integer.',
      });
      return;
    }
    if (length > 1024 * 1024) { // 1MB limit
      console.warn(`Security Warning: Oversized payload attempt: ${length} bytes`);
      res.status(413).json({
        error: 'Payload Too Large',
        code: 'PAYLOAD_TOO_LARGE',
        message: `Payload size exceeds the limit of 1MB.`,
      });
      return;
    }
  }

  next();
}

/**
 * Apply all security middleware in the correct order
 */
export function applySecurityMiddleware() {
  return [
    securityLogger,
    configureCORS(),
    configureSecurityHeaders(),
    customSecurityMiddleware,
    securityValidation,
  ];
}

export default {
  configureCORS,
  configureSecurityHeaders,
  customSecurityMiddleware,
  securityLogger,
  securityValidation,
  applySecurityMiddleware,
}; 