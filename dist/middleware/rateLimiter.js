"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRateLimitStatus = exports.rateLimitErrorHandler = exports.createCompositeRateLimiter = exports.tallyApiRateLimit = exports.tallyApiLimiter = exports.lenientRateLimiter = exports.standardRateLimiter = exports.strictRateLimiter = exports.createRateLimiter = exports.rateLimitConfigs = exports.initializeRedis = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const redis_1 = __importDefault(require("redis"));
let redisClient = null;
const initializeRedis = async (redisUrl) => {
    try {
        redisClient = redis_1.default.createClient({
            url: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
        });
        redisClient.on('error', (err) => {
            console.warn('Redis rate limiter error:', err);
        });
        await redisClient.connect();
        console.log('Redis rate limiter initialized');
    }
    catch (error) {
        console.warn('Redis initialization failed, using memory store for rate limiting:', error);
        redisClient = null;
    }
};
exports.initializeRedis = initializeRedis;
exports.rateLimitConfigs = {
    strict: {
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: {
            error: 'Too many requests, please try again later.',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false
    },
    standard: {
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: {
            error: 'Too many requests, please try again later.',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false
    },
    lenient: {
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: {
            error: 'Too many requests, please try again later.',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false
    }
};
const createRateLimiter = (config, keyPrefix = 'rl') => {
    const limiterConfig = {
        ...config,
        keyGenerator: (req) => `${keyPrefix}:${req.ip}:${req.path}`,
        skip: (req) => {
            return req.path === '/health' || req.path === '/metrics';
        }
    };
    return (0, express_rate_limit_1.default)(limiterConfig);
};
exports.createRateLimiter = createRateLimiter;
exports.strictRateLimiter = (0, exports.createRateLimiter)(exports.rateLimitConfigs.strict, 'strict');
exports.standardRateLimiter = (0, exports.createRateLimiter)(exports.rateLimitConfigs.standard, 'standard');
exports.lenientRateLimiter = (0, exports.createRateLimiter)(exports.rateLimitConfigs.lenient, 'lenient');
class TallyApiRateLimiter {
    constructor(maxTokens = 100, refillRate = 1) {
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
        this.tokens = maxTokens;
        this.lastRefill = Date.now();
    }
    refillTokens() {
        const now = Date.now();
        const timePassed = (now - this.lastRefill) / 1000;
        const tokensToAdd = Math.floor(timePassed * this.refillRate);
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
            this.lastRefill = now;
        }
    }
    canMakeRequest() {
        this.refillTokens();
        return this.tokens > 0;
    }
    consumeToken() {
        this.refillTokens();
        if (this.tokens > 0) {
            this.tokens--;
            return true;
        }
        return false;
    }
    getTokensRemaining() {
        this.refillTokens();
        return this.tokens;
    }
    getTimeUntilNextToken() {
        if (this.tokens > 0)
            return 0;
        return Math.ceil(1000 / this.refillRate);
    }
}
exports.tallyApiLimiter = new TallyApiRateLimiter(100, 1);
const tallyApiRateLimit = (req, res, next) => {
    if (!exports.tallyApiLimiter.canMakeRequest()) {
        const waitTime = exports.tallyApiLimiter.getTimeUntilNextToken();
        res.status(429).json({
            error: 'Tally API rate limit exceeded',
            message: 'Too many requests to Tally API, please try again later',
            retryAfter: Math.ceil(waitTime / 1000),
            tokensRemaining: exports.tallyApiLimiter.getTokensRemaining()
        });
        return;
    }
    exports.tallyApiLimiter.consumeToken();
    res.set({
        'X-Tally-RateLimit-Limit': '100',
        'X-Tally-RateLimit-Remaining': exports.tallyApiLimiter.getTokensRemaining().toString(),
        'X-Tally-RateLimit-Reset': new Date(Date.now() + exports.tallyApiLimiter.getTimeUntilNextToken()).toISOString()
    });
    next();
};
exports.tallyApiRateLimit = tallyApiRateLimit;
const createCompositeRateLimiter = (config = exports.rateLimitConfigs.standard) => {
    const ourLimiter = (0, exports.createRateLimiter)(config);
    return [ourLimiter, exports.tallyApiRateLimit];
};
exports.createCompositeRateLimiter = createCompositeRateLimiter;
const rateLimitErrorHandler = (err, req, res, next) => {
    if (err && err.status === 429) {
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: err.message || 'Too many requests, please try again later',
            retryAfter: err.retryAfter || 900,
            timestamp: new Date().toISOString(),
            path: req.path,
            ip: req.ip
        });
        return;
    }
    next(err);
};
exports.rateLimitErrorHandler = rateLimitErrorHandler;
const getRateLimitStatus = (req) => {
    return {
        ip: req.ip,
        path: req.path,
        tallyApiTokensRemaining: exports.tallyApiLimiter.getTokensRemaining(),
        tallyApiTimeUntilNextToken: exports.tallyApiLimiter.getTimeUntilNextToken(),
        headers: {
            rateLimit: req.get('X-RateLimit-Limit'),
            rateLimitRemaining: req.get('X-RateLimit-Remaining'),
            rateLimitReset: req.get('X-RateLimit-Reset')
        }
    };
};
exports.getRateLimitStatus = getRateLimitStatus;
//# sourceMappingURL=rateLimiter.js.map