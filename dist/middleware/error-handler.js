"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
exports.asyncErrorHandler = asyncErrorHandler;
exports.notFoundHandler = notFoundHandler;
exports.setupProcessErrorHandlers = setupProcessErrorHandlers;
const server_1 = require("../server");
function globalErrorHandler(error, req, res, _next) {
    const requestId = req.requestId || 'unknown';
    const timestamp = new Date().toISOString();
    let statusCode = 500;
    let category = server_1.ErrorCategory.INTERNAL;
    let code = 'INTERNAL_ERROR';
    if (isStructuredError(error)) {
        statusCode = error.statusCode;
        category = error.category;
        code = error.code;
    }
    else {
        ({ statusCode, category, code } = categorizeError(error));
    }
    const errorResponse = {
        error: {
            code,
            message: error.message || 'An unexpected error occurred',
            category,
            requestId,
            timestamp,
        },
    };
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.error.details = {
            stack: error.stack,
            name: error.name,
        };
    }
    res.status(statusCode);
    res.setHeader('Content-Type', 'application/json');
    res.json(errorResponse);
}
function asyncErrorHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => next(error));
    };
}
function notFoundHandler(req, _res, next) {
    const error = createNotFoundError(req.path, req.requestId);
    next(error);
}
function setupProcessErrorHandlers(logger) {
    process.on('unhandledRejection', (reason, _promise) => {
        const message = `Unhandled Promise Rejection: ${reason}`;
        if (logger) {
            logger('error', message, reason instanceof Error ? reason : new Error(String(reason)));
        }
        else {
            console.error(message, reason);
        }
    });
    process.on('uncaughtException', (error) => {
        const message = `Uncaught Exception: ${error.message}`;
        if (logger) {
            logger('fatal', message, error);
        }
        else {
            console.error(message, error);
        }
        process.exit(1);
    });
}
function isStructuredError(error) {
    return error &&
        typeof error.category === 'string' &&
        typeof error.code === 'string' &&
        typeof error.statusCode === 'number' &&
        typeof error.isOperational === 'boolean';
}
function categorizeError(error) {
    const message = error.message.toLowerCase();
    if (message.includes('econnrefused') || message.includes('enotfound') || message.includes('timeout')) {
        return {
            statusCode: 503,
            category: server_1.ErrorCategory.NETWORK,
            code: 'NETWORK_ERROR',
        };
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
        return {
            statusCode: 400,
            category: server_1.ErrorCategory.VALIDATION,
            code: 'VALIDATION_ERROR',
        };
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
        return {
            statusCode: 401,
            category: server_1.ErrorCategory.AUTHENTICATION,
            code: 'AUTHENTICATION_ERROR',
        };
    }
    if (message.includes('forbidden') || message.includes('permission')) {
        return {
            statusCode: 403,
            category: server_1.ErrorCategory.AUTHORIZATION,
            code: 'AUTHORIZATION_ERROR',
        };
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
        return {
            statusCode: 429,
            category: server_1.ErrorCategory.RATE_LIMIT,
            code: 'RATE_LIMIT_ERROR',
        };
    }
    if (message.includes('timeout')) {
        return {
            statusCode: 408,
            category: server_1.ErrorCategory.TIMEOUT,
            code: 'TIMEOUT_ERROR',
        };
    }
    return {
        statusCode: 500,
        category: server_1.ErrorCategory.INTERNAL,
        code: 'INTERNAL_ERROR',
    };
}
function createNotFoundError(path, requestId) {
    const error = new Error(`Route not found: ${path}`);
    error.category = server_1.ErrorCategory.VALIDATION;
    error.code = 'ROUTE_NOT_FOUND';
    error.statusCode = 404;
    error.isOperational = true;
    if (requestId) {
        error.requestId = requestId;
    }
    error.context = { path };
    return error;
}
//# sourceMappingURL=error-handler.js.map