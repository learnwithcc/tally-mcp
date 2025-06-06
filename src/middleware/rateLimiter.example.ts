import express from 'express';
import {
  strictRateLimiter,
  standardRateLimiter,
  lenientRateLimiter,
  createCompositeRateLimiter,
  tallyApiRateLimit,
  rateLimitErrorHandler,
  getRateLimitStatus
} from './rateLimiter';

const app = express();

// Apply different rate limiters to different routes

// Very strict rate limiting for sensitive operations (10 requests per 15 minutes)
app.use('/api/admin', strictRateLimiter);

// Standard rate limiting for most API endpoints (100 requests per 15 minutes)
app.use('/api/forms', standardRateLimiter);

// Lenient rate limiting for read-only operations (1000 requests per 15 minutes)
app.use('/api/public', lenientRateLimiter);

// Composite rate limiting that includes both our limits and Tally API limits
app.use('/api/tally', ...createCompositeRateLimiter());

// Example routes
app.get('/api/admin/users', (req, res) => {
  res.json({ message: 'Admin endpoint - strictly rate limited' });
});

app.get('/api/forms/:id', (req, res) => {
  res.json({ message: 'Form endpoint - standard rate limited' });
});

app.get('/api/public/info', (req, res) => {
  res.json({ message: 'Public endpoint - lenient rate limited' });
});

// Tally API proxy endpoint with both our rate limiting and Tally API rate limiting
app.get('/api/tally/forms', (req, res) => {
  // This endpoint is protected by both our rate limiter and Tally API rate limiter
  res.json({ message: 'Tally API proxy - composite rate limited' });
});

// Rate limit status endpoint
app.get('/api/rate-limit-status', (req, res) => {
  const status = getRateLimitStatus(req);
  res.json(status);
});

// Health check endpoint (automatically skipped by rate limiters)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply rate limit error handler
app.use(rateLimitErrorHandler);

// General error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

export default app;

// Example usage:
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// }); 