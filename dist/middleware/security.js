"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = securityLogger;
exports.configureCORS = configureCORS;
exports.configureSecurityHeaders = configureSecurityHeaders;
exports.customSecurityMiddleware = customSecurityMiddleware;
exports.securityValidation = securityValidation;
exports.applySecurityMiddleware = applySecurityMiddleware;
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const zod_1 = require("zod");
const securityConfigSchema = zod_1.z.object({
    allowedOrigins: zod_1.z.string().default('*'),
    corsMaxAge: zod_1.z.number().default(86400),
    enableHSTS: zod_1.z.boolean().default(true),
    hstsMaxAge: zod_1.z.number().default(31536000),
    enableCSP: zod_1.z.boolean().default(true),
    logSecurityEvents: zod_1.z.boolean().default(true),
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
function securityLogger(req, _res, next) {
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
function configureCORS() {
    const config = getSecurityConfig();
    const allowedOrigins = parseAllowedOrigins(config.allowedOrigins);
    return (0, cors_1.default)({
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
function configureSecurityHeaders() {
    const config = getSecurityConfig();
    return (0, helmet_1.default)({
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
function customSecurityMiddleware(req, res, next) {
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
function securityValidation(req, res, next) {
    const suspiciousPatterns = [
        /\.\./,
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /data:text\/html/i,
    ];
    const url = decodeURIComponent(req.url);
    const originalUrl = req.originalUrl;
    if (/\.\./.test(url) || /\.\./.test(originalUrl)) {
        console.warn(`Security Warning: Directory traversal attempt detected: ${url}`);
        res.status(400).json({
            error: 'Invalid request',
            code: 'SECURITY_VIOLATION',
            message: 'Request contains potentially harmful content',
        });
        return;
    }
    if (url.includes('\0') || originalUrl.includes('\0') || /\x00/.test(url) || /\x00/.test(originalUrl)) {
        console.warn(`Security Warning: Null byte attack detected: ${url}`);
        res.status(400).json({
            error: 'Invalid request',
            code: 'SECURITY_VIOLATION',
            message: 'Request contains potentially harmful content',
        });
        return;
    }
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
            console.warn(`Security Warning: Suspicious URL pattern detected: ${url}`);
            res.status(400).json({
                error: 'Invalid request',
                code: 'SECURITY_VIOLATION',
                message: 'Request contains potentially harmful content',
            });
            return;
        }
    }
    const contentLength = req.get('Content-Length');
    if (contentLength) {
        const length = parseInt(contentLength, 10);
        if (isNaN(length) || length < 0) {
            res.status(400).json({
                error: 'Invalid Content-Length header',
                code: 'INVALID_CONTENT_LENGTH',
            });
            return;
        }
        const maxSize = 10 * 1024 * 1024;
        if (length > maxSize) {
            res.status(413).json({
                error: 'Payload too large',
                code: 'PAYLOAD_TOO_LARGE',
                maxSize,
            });
            return;
        }
    }
    const userAgent = req.get('User-Agent');
    if (!userAgent || userAgent.length > 1000) {
        console.warn(`Security Warning: Invalid User-Agent: ${userAgent?.substring(0, 100)}...`);
    }
    next();
}
function applySecurityMiddleware() {
    return [
        securityLogger,
        configureCORS(),
        configureSecurityHeaders(),
        customSecurityMiddleware,
        securityValidation,
    ];
}
exports.default = {
    configureCORS,
    configureSecurityHeaders,
    customSecurityMiddleware,
    securityLogger,
    securityValidation,
    applySecurityMiddleware,
};
//# sourceMappingURL=security.js.map