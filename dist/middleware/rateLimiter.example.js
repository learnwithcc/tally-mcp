"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rateLimiter_1 = require("./rateLimiter");
const app = (0, express_1.default)();
app.use('/api/admin', rateLimiter_1.strictRateLimiter);
app.use('/api/forms', rateLimiter_1.standardRateLimiter);
app.use('/api/public', rateLimiter_1.lenientRateLimiter);
app.use('/api/tally', ...(0, rateLimiter_1.createCompositeRateLimiter)());
app.get('/api/admin/users', (req, res) => {
    res.json({ message: 'Admin endpoint - strictly rate limited' });
});
app.get('/api/forms/:id', (req, res) => {
    res.json({ message: 'Form endpoint - standard rate limited' });
});
app.get('/api/public/info', (req, res) => {
    res.json({ message: 'Public endpoint - lenient rate limited' });
});
app.get('/api/tally/forms', (req, res) => {
    res.json({ message: 'Tally API proxy - composite rate limited' });
});
app.get('/api/rate-limit-status', (req, res) => {
    const status = (0, rateLimiter_1.getRateLimitStatus)(req);
    res.json(status);
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(rateLimiter_1.rateLimitErrorHandler);
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong'
    });
});
exports.default = app;
//# sourceMappingURL=rateLimiter.example.js.map