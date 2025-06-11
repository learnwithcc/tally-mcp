import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
const securityConfigSchema = z.object({
    allowedOrigins: z.string().default('*'),
    corsMaxAge: z.number().default(86400),
    enableHSTS: z.boolean().default(true),
    hstsMaxAge: z.number().default(31536000),
    enableCSP: z.boolean().default(true),
    logSecurityEvents: z.boolean().default(true),
});
function parseAllowedOrigins(origins) {
    if (origins === '*') {
        return true;
    }
    if (origins === 'false' || origins === 'none') {
        return false;
    }
    return origins.split(',').map(origin => origin.trim()).filter(Boolean);
}
function getSecurityConfig() {
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
export function securityLogger(req, _res, next) {
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
    console.log('Security Log:', JSON.stringify(securityInfo, null, 2));
    next();
}
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
export function configureSecurityHeaders() {
    const config = getSecurityConfig();
    return helmet({
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
        hsts: config.enableHSTS ? {
            maxAge: config.hstsMaxAge,
            includeSubDomains: true,
            preload: true,
        } : false,
        noSniff: true,
        frameguard: {
            action: 'deny',
        },
        xssFilter: true,
        referrerPolicy: {
            policy: ['no-referrer-when-downgrade'],
        },
        permittedCrossDomainPolicies: false,
        dnsPrefetchControl: {
            allow: false,
        },
        hidePoweredBy: true,
        originAgentCluster: true,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: {
            policy: 'same-origin-allow-popups',
        },
        crossOriginResourcePolicy: {
            policy: 'cross-origin',
        },
    });
}
export function customSecurityMiddleware(req, res, next) {
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Request-ID', req.headers['x-request-id'] || generateRequestId());
    if (req.path.includes('/api/') && req.method !== 'GET') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    if (req.path.includes('/auth') || req.path.includes('/login')) {
        const delay = Math.random() * 100;
        setTimeout(() => next(), delay);
        return;
    }
    next();
}
function generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
export function securityValidation(req, res, next) {
    const decodedUrl = decodeURIComponent(req.url);
    const originalUrl = req.originalUrl;
    if (decodedUrl.includes('../') || decodedUrl.includes('..\\\\') || originalUrl.includes('../') || originalUrl.includes('..\\\\')) {
        console.warn(`Security Warning: Directory traversal attempt detected: ${req.url}`);
        res.status(400).json({
            error: 'Invalid request path',
            code: 'SECURITY_VIOLATION',
            message: 'Directory traversal is not permitted.',
        });
        return;
    }
    if (decodedUrl.includes('\\0') || originalUrl.includes('\\0') || decodedUrl.includes('%00') || originalUrl.includes('%00')) {
        console.warn(`Security Warning: Null byte detected in URL: ${req.url}`);
        res.status(400).json({
            error: 'Invalid request path',
            code: 'SECURITY_VIOLATION',
            message: 'Null bytes are not permitted in the URL.',
        });
        return;
    }
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
    const userAgent = req.headers['user-agent'];
    if (!userAgent) {
        console.warn('Security Warning: Missing or empty User-Agent header.');
    }
    else if (userAgent.length > 256) {
        console.warn(`Security Warning: Oversized User-Agent header: ${userAgent.length} chars`);
    }
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
        if (length > 1024 * 1024) {
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
//# sourceMappingURL=security.js.map