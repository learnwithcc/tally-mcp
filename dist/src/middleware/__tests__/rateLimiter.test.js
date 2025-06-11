import request from 'supertest';
import express from 'express';
import { createRateLimiter, strictRateLimiter, standardRateLimiter, lenientRateLimiter, tallyApiLimiter, tallyApiRateLimit, createCompositeRateLimiter, rateLimitErrorHandler, getRateLimitStatus, rateLimitConfigs } from '../rateLimiter';
describe('Rate Limiter Middleware', () => {
    let app;
    beforeEach(() => {
        app = express();
        app.use(express.json());
        tallyApiLimiter.tokens = 100;
        tallyApiLimiter.lastRefill = Date.now();
    });
    describe('Basic Rate Limiting', () => {
        it('should allow requests within the limit', async () => {
            const rateLimiter = createRateLimiter({
                windowMs: 60000,
                max: 5,
                message: { error: 'Too many requests', retryAfter: '1 minute' },
                standardHeaders: true,
                legacyHeaders: false
            });
            app.use(rateLimiter);
            app.get('/test', (req, res) => {
                res.json({ success: true });
            });
            for (let i = 0; i < 5; i++) {
                const response = await request(app)
                    .get('/test')
                    .expect(200);
                expect(response.body).toEqual({ success: true });
                const limitHeader = response.headers['x-ratelimit-limit'] ||
                    response.headers['ratelimit-limit'];
                const remainingHeader = response.headers['x-ratelimit-remaining'] ||
                    response.headers['ratelimit-remaining'];
                expect(limitHeader).toBe('5');
                expect(remainingHeader).toBe((4 - i).toString());
            }
        });
        it('should block requests that exceed the limit', async () => {
            const rateLimiter = createRateLimiter({
                windowMs: 60000,
                max: 2,
                message: { error: 'Too many requests', retryAfter: '1 minute' },
                standardHeaders: true,
                legacyHeaders: false
            });
            app.use(rateLimiter);
            app.get('/test', (req, res) => {
                res.json({ success: true });
            });
            await request(app).get('/test').expect(200);
            await request(app).get('/test').expect(200);
            const response = await request(app)
                .get('/test')
                .expect(429);
            expect(response.body.error).toBe('Too many requests');
        });
        it('should skip rate limiting for health checks', async () => {
            const rateLimiter = createRateLimiter({
                windowMs: 60000,
                max: 1,
                message: { error: 'Too many requests', retryAfter: '1 minute' },
                standardHeaders: true,
                legacyHeaders: false
            });
            app.use(rateLimiter);
            app.get('/health', (req, res) => {
                res.json({ status: 'ok' });
            });
            app.get('/test', (req, res) => {
                res.json({ success: true });
            });
            await request(app).get('/health').expect(200);
            await request(app).get('/health').expect(200);
            await request(app).get('/health').expect(200);
            await request(app).get('/test').expect(200);
            await request(app).get('/test').expect(429);
        });
    });
    describe('Pre-configured Rate Limiters', () => {
        it('should apply strict rate limiting', async () => {
            app.use('/strict', strictRateLimiter);
            app.get('/strict/test', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/strict/test')
                .expect(200);
            const limitHeader = response.headers['x-ratelimit-limit'] ||
                response.headers['ratelimit-limit'];
            expect(limitHeader).toBe('10');
        });
        it('should apply standard rate limiting', async () => {
            app.use('/standard', standardRateLimiter);
            app.get('/standard/test', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/standard/test')
                .expect(200);
            const limitHeader = response.headers['x-ratelimit-limit'] ||
                response.headers['ratelimit-limit'];
            expect(limitHeader).toBe('100');
        });
        it('should apply lenient rate limiting', async () => {
            app.use('/lenient', lenientRateLimiter);
            app.get('/lenient/test', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/lenient/test')
                .expect(200);
            const limitHeader = response.headers['x-ratelimit-limit'] ||
                response.headers['ratelimit-limit'];
            expect(limitHeader).toBe('1000');
        });
    });
    describe('Tally API Rate Limiter', () => {
        it('should allow requests when tokens are available', async () => {
            app.use(tallyApiRateLimit);
            app.get('/tally', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/tally')
                .expect(200);
            expect(response.body).toEqual({ success: true });
            expect(response.headers['x-tally-ratelimit-limit']).toBe('100');
            expect(response.headers['x-tally-ratelimit-remaining']).toBe('99');
        });
        it('should block requests when no tokens are available', async () => {
            tallyApiLimiter.tokens = 0;
            app.use(tallyApiRateLimit);
            app.get('/tally', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/tally')
                .expect(429);
            expect(response.body.error).toBe('Tally API rate limit exceeded');
            expect(response.body.tokensRemaining).toBe(0);
            expect(response.body.retryAfter).toBeGreaterThan(0);
        });
        it('should refill tokens over time', async () => {
            tallyApiLimiter.tokens = 0;
            tallyApiLimiter.lastRefill = Date.now() - 2000;
            app.use(tallyApiRateLimit);
            app.get('/tally', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/tally')
                .expect(200);
            expect(response.body).toEqual({ success: true });
        });
    });
    describe('Composite Rate Limiter', () => {
        it('should apply both rate limiters', async () => {
            const compositeRateLimiters = createCompositeRateLimiter({
                windowMs: 60000,
                max: 5,
                message: { error: 'Too many requests', retryAfter: '1 minute' },
                standardHeaders: true,
                legacyHeaders: false
            });
            app.use('/composite', ...compositeRateLimiters);
            app.get('/composite/test', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/composite/test')
                .expect(200);
            expect(response.body).toEqual({ success: true });
            const limitHeader = response.headers['x-ratelimit-limit'] ||
                response.headers['ratelimit-limit'];
            expect(limitHeader).toBe('5');
            expect(response.headers['x-tally-ratelimit-limit']).toBe('100');
        });
        it('should be blocked by Tally API limiter when tokens exhausted', async () => {
            tallyApiLimiter.tokens = 0;
            const compositeRateLimiters = createCompositeRateLimiter({
                windowMs: 60000,
                max: 100,
                message: { error: 'Too many requests', retryAfter: '1 minute' },
                standardHeaders: true,
                legacyHeaders: false
            });
            app.use('/composite', ...compositeRateLimiters);
            app.get('/composite/test', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/composite/test')
                .expect(429);
            expect(response.body.error).toBe('Tally API rate limit exceeded');
        });
    });
    describe('Rate Limit Error Handler', () => {
        it('should handle rate limit errors', async () => {
            app.use((req, res, next) => {
                const error = new Error('Rate limit exceeded');
                error.status = 429;
                error.retryAfter = 600;
                next(error);
            });
            app.use(rateLimitErrorHandler);
            app.get('/test', (req, res) => {
                res.json({ success: true });
            });
            const response = await request(app)
                .get('/test')
                .expect(429);
            expect(response.body.error).toBe('Rate limit exceeded');
            expect(response.body.retryAfter).toBe(600);
            expect(response.body.path).toBe('/test');
            expect(response.body.timestamp).toBeDefined();
        });
        it('should pass through non-rate-limit errors', async () => {
            const mockNext = jest.fn();
            app.use((req, res, next) => {
                const error = new Error('Some other error');
                error.status = 500;
                next(error);
            });
            app.use(rateLimitErrorHandler);
            const mockError = new Error('Some other error');
            mockError.status = 500;
            const mockReq = {};
            const mockRes = {};
            rateLimitErrorHandler(mockError, mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });
    describe('Rate Limit Status Utility', () => {
        it('should return current rate limit status', () => {
            const mockReq = {
                ip: '127.0.0.1',
                path: '/test',
                get: jest.fn((header) => {
                    const headers = {
                        'X-RateLimit-Limit': '100',
                        'X-RateLimit-Remaining': '50',
                        'X-RateLimit-Reset': '1234567890'
                    };
                    return headers[header];
                })
            };
            const status = getRateLimitStatus(mockReq);
            expect(status).toEqual({
                ip: '127.0.0.1',
                path: '/test',
                tallyApiTokensRemaining: expect.any(Number),
                tallyApiTimeUntilNextToken: expect.any(Number),
                headers: {
                    rateLimit: '100',
                    rateLimitRemaining: '50',
                    rateLimitReset: '1234567890'
                }
            });
        });
    });
    describe('Token Bucket Algorithm', () => {
        it('should refill tokens at the correct rate', () => {
            const limiter = tallyApiLimiter;
            limiter.tokens = 50;
            limiter.lastRefill = Date.now() - 5000;
            const canMake = limiter.canMakeRequest();
            expect(canMake).toBe(true);
            expect(limiter.tokens).toBeGreaterThan(50);
        });
        it('should not exceed maximum tokens', () => {
            const limiter = tallyApiLimiter;
            limiter.tokens = 99;
            limiter.lastRefill = Date.now() - 10000;
            limiter.refillTokens();
            expect(limiter.tokens).toBe(100);
        });
        it('should calculate correct time until next token', () => {
            const limiter = tallyApiLimiter;
            limiter.tokens = 0;
            limiter.lastRefill = Date.now();
            const timeUntilNext = limiter.getTimeUntilNextToken();
            expect(timeUntilNext).toBe(1000);
        });
    });
});
describe('Rate Limit Configurations', () => {
    it('should have correct strict configuration', () => {
        expect(rateLimitConfigs.strict).toEqual({
            windowMs: 15 * 60 * 1000,
            max: 10,
            message: {
                error: 'Too many requests, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
    });
    it('should have correct standard configuration', () => {
        expect(rateLimitConfigs.standard).toEqual({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: {
                error: 'Too many requests, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
    });
    it('should have correct lenient configuration', () => {
        expect(rateLimitConfigs.lenient).toEqual({
            windowMs: 15 * 60 * 1000,
            max: 1000,
            message: {
                error: 'Too many requests, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
    });
});
//# sourceMappingURL=rateLimiter.test.js.map