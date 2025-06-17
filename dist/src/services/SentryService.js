import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
export class SentryService {
    static initialize() {
        const dsn = process.env.SENTRY_DSN;
        if (dsn) {
            Sentry.init({
                dsn,
                tracesSampleRate: 1.0,
                profilesSampleRate: 1.0,
                integrations: [new ProfilingIntegration()],
            });
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
//# sourceMappingURL=SentryService.js.map