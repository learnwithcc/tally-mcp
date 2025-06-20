import * as Sentry from '@sentry/node';
import { SentryService } from '../SentryService';

jest.mock('@sentry/node', () => {
  const originalSentry = jest.requireActual('@sentry/node');
  return {
    ...originalSentry,
    init: jest.fn(),
    captureException: jest.fn(),
    withScope: jest.fn(callback => callback({ setContext: jest.fn() })),
  };
});

jest.mock('@sentry/profiling-node', () => ({
  nodeProfilingIntegration: jest.fn(() => ({ name: 'ProfilingIntegration' })),
}));

describe('SentryService', () => {
  beforeEach(() => {
    // Reset the service state before each test
    (SentryService as any).resetForTesting();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize Sentry if DSN is provided', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      SentryService.initialize();
      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        dsn: 'https://test@sentry.io/123',
      }));
    });

    it('should not initialize Sentry if DSN is not provided', () => {
      delete process.env.SENTRY_DSN;
      SentryService.initialize();
      expect(Sentry.init).not.toHaveBeenCalled();
    });
  });

  describe('captureException', () => {
    it('should capture an exception with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123' };
      SentryService.captureException(error, context);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
      expect(Sentry.withScope).toHaveBeenCalled();
    });
  });
}); 