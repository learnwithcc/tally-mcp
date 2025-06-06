import { Request, Response, NextFunction } from 'express';
export declare const initializeRedis: (redisUrl?: string) => Promise<void>;
export declare const rateLimitConfigs: {
    strict: {
        windowMs: number;
        max: number;
        message: {
            error: string;
            retryAfter: string;
        };
        standardHeaders: boolean;
        legacyHeaders: boolean;
    };
    standard: {
        windowMs: number;
        max: number;
        message: {
            error: string;
            retryAfter: string;
        };
        standardHeaders: boolean;
        legacyHeaders: boolean;
    };
    lenient: {
        windowMs: number;
        max: number;
        message: {
            error: string;
            retryAfter: string;
        };
        standardHeaders: boolean;
        legacyHeaders: boolean;
    };
};
export declare const createRateLimiter: (config: typeof rateLimitConfigs.standard, keyPrefix?: string) => import("express-rate-limit").RateLimitRequestHandler;
export declare const strictRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const standardRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const lenientRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
declare class TallyApiRateLimiter {
    private tokens;
    private lastRefill;
    private readonly maxTokens;
    private readonly refillRate;
    constructor(maxTokens?: number, refillRate?: number);
    private refillTokens;
    canMakeRequest(): boolean;
    consumeToken(): boolean;
    getTokensRemaining(): number;
    getTimeUntilNextToken(): number;
}
export declare const tallyApiLimiter: TallyApiRateLimiter;
export declare const tallyApiRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const createCompositeRateLimiter: (config?: typeof rateLimitConfigs.standard) => ((req: Request, res: Response, next: NextFunction) => void)[];
export declare const rateLimitErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export declare const getRateLimitStatus: (req: Request) => object;
export {};
//# sourceMappingURL=rateLimiter.d.ts.map