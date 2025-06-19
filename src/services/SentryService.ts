import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export class SentryService {
  private static isInitialized = false;

  public static initialize(): void {
    try {
      if (!this.isInitialized) {
        const dsn = process.env.SENTRY_DSN;
        if (dsn) {
          Sentry.init({
            dsn,
            tracesSampleRate: 1.0,
            profilesSampleRate: 1.0,
            integrations: [nodeProfilingIntegration()],
          });
          this.isInitialized = true;
        }
      }
    } catch (error) {
      console.error('Error initializing Sentry:', error);
    }
  }

  // For testing purposes only
  public static resetForTesting(): void {
    this.isInitialized = false;
  }

  public static captureException(error: Error, context?: Record<string, unknown>): void {
    Sentry.withScope(scope => {
      if (context) {
        scope.setContext("custom_context", context);
      }
      Sentry.captureException(error);
    });
  }
} 