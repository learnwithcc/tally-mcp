import rateLimit from 'express-rate-limit';
import Redis from 'redis';
let redisClient = null;
export const initializeRedis = async (redisUrl) => {
    try {
        redisClient = Redis.createClient({
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
export const rateLimitConfigs = {
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
export const createRateLimiter = (config, keyPrefix = 'rl') => {
    const limiterConfig = {
        ...config,
        keyGenerator: (req) => `${keyPrefix}:${req.ip}:${req.path}`,
        skip: (req) => {
            return req.path === '/health' || req.path === '/metrics';
        }
    };
    return rateLimit(limiterConfig);
};
export const strictRateLimiter = createRateLimiter(rateLimitConfigs.strict, 'strict');
export const standardRateLimiter = createRateLimiter(rateLimitConfigs.standard, 'standard');
export const lenientRateLimiter = createRateLimiter(rateLimitConfigs.lenient, 'lenient');
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
export const tallyApiLimiter = new TallyApiRateLimiter(100, 1);
export const tallyApiRateLimit = (_req, res, next) => {
    if (!tallyApiLimiter.canMakeRequest()) {
        const waitTime = tallyApiLimiter.getTimeUntilNextToken();
        res.status(429).json({
            error: 'Tally API rate limit exceeded',
            message: 'Too many requests to Tally API, please try again later',
            retryAfter: Math.ceil(waitTime / 1000),
            tokensRemaining: tallyApiLimiter.getTokensRemaining()
        });
        return;
    }
    tallyApiLimiter.consumeToken();
    res.set({
        'X-Tally-RateLimit-Limit': '100',
        'X-Tally-RateLimit-Remaining': tallyApiLimiter.getTokensRemaining().toString(),
        'X-Tally-RateLimit-Reset': new Date(Date.now() + tallyApiLimiter.getTimeUntilNextToken()).toISOString()
    });
    next();
};
export const createCompositeRateLimiter = (config = rateLimitConfigs.standard) => {
    const ourLimiter = createRateLimiter(config);
    return [ourLimiter, tallyApiRateLimit];
};
export const rateLimitErrorHandler = (err, req, res, next) => {
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
export const getRateLimitStatus = (req) => {
    return {
        ip: req.ip,
        path: req.path,
        tallyApiTokensRemaining: tallyApiLimiter.getTokensRemaining(),
        tallyApiTimeUntilNextToken: tallyApiLimiter.getTimeUntilNextToken(),
        headers: {
            rateLimit: req.get('X-RateLimit-Limit'),
            rateLimitRemaining: req.get('X-RateLimit-Remaining'),
            rateLimitReset: req.get('X-RateLimit-Reset')
        }
    };
};
//# sourceMappingURL=rateLimiter.js.map