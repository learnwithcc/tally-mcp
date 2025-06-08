import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import Redis from 'redis';

// Redis client for distributed rate limiting
let redisClient: Redis.RedisClientType | null = null;

// Initialize Redis client (optional - falls back to memory store)
export const initializeRedis = async (redisUrl?: string): Promise<void> => {
  try {
    redisClient = Redis.createClient({
      url: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => {
      console.warn('Redis rate limiter error:', err);
      // Don't throw - fallback to memory store
    });
    
    await redisClient.connect();
    console.log('Redis rate limiter initialized');
  } catch (error) {
    console.warn('Redis initialization failed, using memory store for rate limiting:', error);
    redisClient = null;
  }
};

// Note: Redis store implementation removed for compatibility with express-rate-limit v7
// Memory store is used by default, which is suitable for single-instance deployments
// For distributed deployments, consider using a compatible Redis store package

// Rate limiting configurations for different endpoint types
export const rateLimitConfigs = {
  // Very strict for sensitive operations
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Standard for most API endpoints
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Lenient for read-only operations
  lenient: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  }
};

// Create rate limiter with optional Redis store
export const createRateLimiter = (config: typeof rateLimitConfigs.standard, keyPrefix = 'rl') => {
  const limiterConfig = {
    ...config,
    keyGenerator: (req: Request) => `${keyPrefix}:${req.ip}:${req.path}`,
    // Note: Redis store implementation removed for compatibility with express-rate-limit v7
    // Falls back to memory store, which is suitable for single-instance deployments
    skip: (req: Request) => {
      // Skip rate limiting for health checks and internal endpoints
      return req.path === '/health' || req.path === '/metrics';
    }
  };
  
  return rateLimit(limiterConfig);
};

// Pre-configured rate limiters
export const strictRateLimiter = createRateLimiter(rateLimitConfigs.strict, 'strict');
export const standardRateLimiter = createRateLimiter(rateLimitConfigs.standard, 'standard');
export const lenientRateLimiter = createRateLimiter(rateLimitConfigs.lenient, 'lenient');

// Tally API rate limiting - token bucket implementation
class TallyApiRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  
  constructor(maxTokens = 100, refillRate = 1) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }
  
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // convert to seconds
    const tokensToAdd = Math.floor(timePassed * this.refillRate);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
  
  canMakeRequest(): boolean {
    this.refillTokens();
    return this.tokens > 0;
  }
  
  consumeToken(): boolean {
    this.refillTokens();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
  
  getTokensRemaining(): number {
    this.refillTokens();
    return this.tokens;
  }
  
  getTimeUntilNextToken(): number {
    if (this.tokens > 0) return 0;
    return Math.ceil(1000 / this.refillRate); // milliseconds until next token
  }
}

// Global Tally API rate limiter instance
export const tallyApiLimiter = new TallyApiRateLimiter(100, 1); // 100 tokens, 1 per second

// Middleware to check Tally API rate limit before making requests
export const tallyApiRateLimit = (_req: Request, res: Response, next: NextFunction): void => {
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
  
  // Consume token and proceed
  tallyApiLimiter.consumeToken();
  
  // Add rate limit info to response headers
  res.set({
    'X-Tally-RateLimit-Limit': '100',
    'X-Tally-RateLimit-Remaining': tallyApiLimiter.getTokensRemaining().toString(),
    'X-Tally-RateLimit-Reset': new Date(Date.now() + tallyApiLimiter.getTimeUntilNextToken()).toISOString()
  });
  
  next();
};

// Composite middleware that applies both our rate limiting and Tally API limiting
export const createCompositeRateLimiter = (config: typeof rateLimitConfigs.standard = rateLimitConfigs.standard) => {
  const ourLimiter = createRateLimiter(config);
  
  return [ourLimiter, tallyApiRateLimit];
};

// Enhanced error handler for rate limiting
export const rateLimitErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err && err.status === 429) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: err.message || 'Too many requests, please try again later',
      retryAfter: err.retryAfter || 900, // 15 minutes default
      timestamp: new Date().toISOString(),
      path: req.path,
      ip: req.ip
    });
    return;
  }
  
  next(err);
};

// Utility to get current rate limit status
export const getRateLimitStatus = (req: Request): object => {
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