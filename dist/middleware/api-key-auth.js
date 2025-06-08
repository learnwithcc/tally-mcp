"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalApiKeyAuth = exports.requireSubmissionsWriteAccess = exports.requireSubmissionsReadAccess = exports.requireFormsWriteAccess = exports.requireFormsReadAccess = exports.requireAdminAccess = exports.requireWriteAccess = exports.requireReadAccess = exports.requireScopes = void 0;
exports.apiKeyAuth = apiKeyAuth;
exports.isAuthenticated = isAuthenticated;
exports.getApiKeyInfo = getApiKeyInfo;
const api_key_service_1 = require("../services/api-key-service");
const api_key_1 = require("../models/api-key");
const crypto_1 = require("../utils/crypto");
const defaultOptions = {
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
function extractApiKey(req, headerName) {
    let apiKey = req.headers[headerName];
    if (!apiKey) {
        apiKey = req.headers['authorization'];
        if (apiKey && apiKey.startsWith('Bearer ')) {
            apiKey = apiKey.slice(7);
        }
        else if (apiKey && apiKey.startsWith('ApiKey ')) {
            apiKey = apiKey.slice(7);
        }
    }
    if (!apiKey && process.env.NODE_ENV !== 'production') {
        apiKey = req.query.apiKey || req.query.api_key;
    }
    return apiKey ? apiKey.trim() : null;
}
function getClientIp(req) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xRealIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip'];
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
function apiKeyAuth(options = {}) {
    const config = { ...defaultOptions, ...options };
    return async (req, res, next) => {
        const startTime = Date.now();
        try {
            const apiKey = extractApiKey(req, config.headerName);
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
            const validationResult = await api_key_service_1.apiKeyService.validateApiKey({
                key: apiKey,
                ipAddress: getClientIp(req),
                userAgent: req.headers['user-agent'],
                endpoint: `${req.method} ${req.path}`
            });
            if (!validationResult.isValid) {
                const responseTime = Date.now() - startTime;
                if (config.logAttempts) {
                    console.log(`API key authentication failed - ${validationResult.errorReason} for ${req.method} ${req.path} from ${getClientIp(req)} (${responseTime}ms)`);
                }
                let statusCode = 401;
                let errorCode = 'INVALID_API_KEY';
                let message = config.errorMessages.invalid;
                if (validationResult.errorReason?.includes('expired')) {
                    statusCode = 401;
                    errorCode = 'EXPIRED_API_KEY';
                    message = config.errorMessages.expired;
                }
                else if (validationResult.errorReason?.includes('revoked')) {
                    statusCode = 403;
                    errorCode = 'REVOKED_API_KEY';
                    message = config.errorMessages.revoked;
                }
                else if (validationResult.errorReason?.includes('usage limit')) {
                    statusCode = 429;
                    errorCode = 'USAGE_LIMIT_EXCEEDED';
                    message = config.errorMessages.usageLimitExceeded;
                }
                else if (validationResult.errorReason?.includes('IP')) {
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
            if (config.requiredScopes.length > 0 && validationResult.apiKey) {
                const hasRequiredScopes = api_key_service_1.apiKeyService.hasRequiredScopes(validationResult.apiKey, config.requiredScopes);
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
            if (validationResult.apiKey) {
                const apiKeyInfo = {
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
                req.apiKey = apiKeyInfo;
            }
            res.setHeader('X-API-Key-ID', crypto_1.CryptoUtils.maskSensitiveData(validationResult.apiKey?.id || 'unknown'));
            res.setHeader('X-Rate-Limit-Remaining', validationResult.remainingUsage?.toString() || 'unlimited');
            if (config.logAttempts) {
                const responseTime = Date.now() - startTime;
                console.log(`API key authentication successful for ${validationResult.apiKey?.name} - ${req.method} ${req.path} (${responseTime}ms)`);
            }
            next();
        }
        catch (error) {
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
const requireScopes = (scopes) => apiKeyAuth({ requiredScopes: scopes });
exports.requireScopes = requireScopes;
const requireReadAccess = () => apiKeyAuth({
    requiredScopes: [api_key_1.ApiKeyScope.READ]
});
exports.requireReadAccess = requireReadAccess;
const requireWriteAccess = () => apiKeyAuth({
    requiredScopes: [api_key_1.ApiKeyScope.WRITE]
});
exports.requireWriteAccess = requireWriteAccess;
const requireAdminAccess = () => apiKeyAuth({
    requiredScopes: [api_key_1.ApiKeyScope.ADMIN]
});
exports.requireAdminAccess = requireAdminAccess;
const requireFormsReadAccess = () => apiKeyAuth({
    requiredScopes: [api_key_1.ApiKeyScope.FORMS_READ]
});
exports.requireFormsReadAccess = requireFormsReadAccess;
const requireFormsWriteAccess = () => apiKeyAuth({
    requiredScopes: [api_key_1.ApiKeyScope.FORMS_WRITE]
});
exports.requireFormsWriteAccess = requireFormsWriteAccess;
const requireSubmissionsReadAccess = () => apiKeyAuth({
    requiredScopes: [api_key_1.ApiKeyScope.SUBMISSIONS_READ]
});
exports.requireSubmissionsReadAccess = requireSubmissionsReadAccess;
const requireSubmissionsWriteAccess = () => apiKeyAuth({
    requiredScopes: [api_key_1.ApiKeyScope.SUBMISSIONS_WRITE]
});
exports.requireSubmissionsWriteAccess = requireSubmissionsWriteAccess;
const optionalApiKeyAuth = () => apiKeyAuth({ optional: true });
exports.optionalApiKeyAuth = optionalApiKeyAuth;
function isAuthenticated(req) {
    return !!req.apiKey;
}
function getApiKeyInfo(req) {
    return req.apiKey;
}
//# sourceMappingURL=api-key-auth.js.map