export declare abstract class TallyApiError extends Error {
    readonly isRetryable: boolean;
    readonly statusCode?: number;
    readonly statusText?: string;
    readonly headers?: Record<string, string>;
    readonly requestId?: string;
    readonly timestamp: Date;
    readonly cause?: Error;
    constructor(message: string, statusCode?: number, statusText?: string, headers?: Record<string, string>, isRetryable?: boolean, cause?: Error);
    getUserMessage(): string;
    getDebugInfo(): Record<string, any>;
}
export declare class AuthenticationError extends TallyApiError {
    constructor(message?: string, statusCode?: number, statusText?: string, headers?: Record<string, string>, cause?: Error);
    getUserMessage(): string;
}
export declare class BadRequestError extends TallyApiError {
    readonly validationErrors?: Array<{
        field?: string;
        message: string;
        code?: string;
    }>;
    constructor(message?: string, statusCode?: number, statusText?: string, headers?: Record<string, string>, validationErrors?: Array<{
        field?: string;
        message: string;
        code?: string;
    }>, cause?: Error);
    getUserMessage(): string;
}
export declare class NotFoundError extends TallyApiError {
    constructor(message?: string, statusCode?: number, statusText?: string, headers?: Record<string, string>, cause?: Error);
    getUserMessage(): string;
}
export declare class RateLimitError extends TallyApiError {
    readonly retryAfter?: number;
    readonly limit?: number;
    readonly remaining?: number;
    readonly resetTime?: Date;
    constructor(message?: string, statusCode?: number, statusText?: string, headers?: Record<string, string>, cause?: Error);
    getUserMessage(): string;
}
export declare class ServerError extends TallyApiError {
    constructor(message?: string, statusCode?: number, statusText?: string, headers?: Record<string, string>, cause?: Error);
    getUserMessage(): string;
}
export declare class NetworkError extends TallyApiError {
    constructor(message?: string, cause?: Error);
    getUserMessage(): string;
}
export declare class TimeoutError extends TallyApiError {
    constructor(message?: string, cause?: Error);
    getUserMessage(): string;
}
export declare function createErrorFromResponse(statusCode: number, statusText: string, headers: Record<string, string>, responseData?: any, originalError?: Error): TallyApiError;
//# sourceMappingURL=errors.d.ts.map