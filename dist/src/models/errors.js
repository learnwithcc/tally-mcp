export class TallyApiError extends Error {
    constructor(message, statusCode, statusText, headers, isRetryable = false, cause) {
        super(message);
        this.name = this.constructor.name;
        if (statusCode !== undefined)
            this.statusCode = statusCode;
        if (statusText !== undefined)
            this.statusText = statusText;
        if (headers !== undefined)
            this.headers = headers;
        this.isRetryable = isRetryable;
        this.timestamp = new Date();
        if (headers?.['x-request-id'])
            this.requestId = headers['x-request-id'];
        else if (headers?.['request-id'])
            this.requestId = headers['request-id'];
        if (cause !== undefined)
            this.cause = cause;
    }
    getUserMessage() {
        return this.message;
    }
    getDebugInfo() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            statusText: this.statusText,
            requestId: this.requestId,
            timestamp: this.timestamp.toISOString(),
            isRetryable: this.isRetryable,
            headers: this.headers,
        };
    }
}
export class AuthenticationError extends TallyApiError {
    constructor(message = 'Authentication failed', statusCode, statusText, headers, cause) {
        super(message, statusCode, statusText, headers, false, cause);
    }
    getUserMessage() {
        if (this.statusCode === 401) {
            return 'Your session has expired. Please log in again.';
        }
        if (this.statusCode === 403) {
            return 'You do not have permission to access this resource.';
        }
        return 'Authentication failed. Please check your credentials.';
    }
}
export class BadRequestError extends TallyApiError {
    constructor(message = 'Bad request', statusCode = 400, statusText, headers, validationErrors, cause) {
        super(message, statusCode, statusText, headers, false, cause);
        if (validationErrors !== undefined)
            this.validationErrors = validationErrors;
    }
    getUserMessage() {
        if (this.validationErrors && this.validationErrors.length > 0) {
            const fieldErrors = this.validationErrors
                .filter(error => error.field)
                .map(error => `${error.field}: ${error.message}`)
                .join(', ');
            if (fieldErrors) {
                return `Validation failed: ${fieldErrors}`;
            }
        }
        return 'The request contains invalid data. Please check your input and try again.';
    }
}
export class NotFoundError extends TallyApiError {
    constructor(message = 'Resource not found', statusCode = 404, statusText, headers, cause) {
        super(message, statusCode, statusText, headers, false, cause);
    }
    getUserMessage() {
        return 'The requested resource was not found.';
    }
}
export class RateLimitError extends TallyApiError {
    constructor(message = 'Rate limit exceeded', statusCode = 429, statusText, headers, cause) {
        super(message, statusCode, statusText, headers, true, cause);
        if (headers) {
            if (headers['retry-after']) {
                const retryAfterParsed = parseInt(headers['retry-after'], 10);
                if (!isNaN(retryAfterParsed))
                    this.retryAfter = retryAfterParsed;
            }
            if (headers['x-ratelimit-limit']) {
                const limitParsed = parseInt(headers['x-ratelimit-limit'], 10);
                if (!isNaN(limitParsed))
                    this.limit = limitParsed;
            }
            if (headers['x-ratelimit-remaining']) {
                const remainingParsed = parseInt(headers['x-ratelimit-remaining'], 10);
                if (!isNaN(remainingParsed))
                    this.remaining = remainingParsed;
            }
            if (headers['x-ratelimit-reset']) {
                const resetTimeParsed = parseInt(headers['x-ratelimit-reset'], 10);
                if (!isNaN(resetTimeParsed))
                    this.resetTime = new Date(resetTimeParsed * 1000);
            }
        }
    }
    getUserMessage() {
        if (this.retryAfter) {
            return `Rate limit exceeded. Please wait ${this.retryAfter} seconds before trying again.`;
        }
        if (this.resetTime) {
            return `Rate limit exceeded. Limit resets at ${this.resetTime.toLocaleTimeString()}.`;
        }
        return 'Rate limit exceeded. Please try again later.';
    }
}
export class ServerError extends TallyApiError {
    constructor(message = 'Internal server error', statusCode = 500, statusText, headers, cause) {
        super(message, statusCode, statusText, headers, true, cause);
    }
    getUserMessage() {
        if (this.statusCode === 502) {
            return 'Service temporarily unavailable. Please try again later.';
        }
        if (this.statusCode === 503) {
            return 'Service is currently under maintenance. Please try again later.';
        }
        if (this.statusCode === 504) {
            return 'Request timed out. Please try again.';
        }
        return 'A server error occurred. Please try again later.';
    }
}
export class NetworkError extends TallyApiError {
    constructor(message = 'Network error', cause) {
        super(message, undefined, undefined, undefined, true, cause);
    }
    getUserMessage() {
        return 'Network connection failed. Please check your internet connection and try again.';
    }
}
export class TimeoutError extends TallyApiError {
    constructor(message = 'Request timeout', cause) {
        super(message, undefined, undefined, undefined, true, cause);
    }
    getUserMessage() {
        return 'Request timed out. Please try again.';
    }
}
export function createErrorFromResponse(statusCode, statusText, headers, responseData, originalError) {
    const message = responseData?.message || responseData?.error || statusText || 'Unknown error';
    switch (statusCode) {
        case 400:
            return new BadRequestError(message, statusCode, statusText, headers, responseData?.errors || responseData?.validation_errors, originalError);
        case 401:
        case 403:
            return new AuthenticationError(message, statusCode, statusText, headers, originalError);
        case 404:
            return new NotFoundError(message, statusCode, statusText, headers, originalError);
        case 429:
            return new RateLimitError(message, statusCode, statusText, headers, originalError);
        default:
            if (statusCode >= 500) {
                return new ServerError(message, statusCode, statusText, headers, originalError);
            }
            if (statusCode >= 400 && statusCode < 500) {
                return new BadRequestError(message, statusCode, statusText, headers, undefined, originalError);
            }
            return new ServerError(message, statusCode, statusText, headers, originalError);
    }
}
//# sourceMappingURL=errors.js.map