import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
export class SentryService {
    static initialize() {
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
                }
            }
        }
        catch (error) {
            console.error('Error initializing Sentry:', error);
        }
    }
    static captureException(error, context) {
        Sentry.withScope(scope => {
            if (context) {
                scope.setContext("custom_context", context);
            }
            Sentry.captureException(error);
        });
    }
}
SentryService.isInitialized = false;
//# sourceMappingURL=SentryService.js.map