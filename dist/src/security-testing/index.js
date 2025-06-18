export { SecurityTestFramework } from './SecurityTestFramework';
export * from './types';
export { OWASPZAPIntegration } from './integrations/OWASPZAPIntegration';
export { SnykIntegration } from './integrations/SnykIntegration';
export { CustomSecurityTests } from './tests/CustomSecurityTests';
export { SecurityTestReporter } from './reporting/SecurityTestReporter';
import securityTestingConfig from '../config/security-testing.config';
export const DEFAULT_SECURITY_TEST_CONFIG = securityTestingConfig;
export async function createSecurityTestFramework(overrides) {
    const { SecurityTestFramework } = await import('./SecurityTestFramework');
    const config = {
        ...DEFAULT_SECURITY_TEST_CONFIG,
        ...overrides
    };
    return new SecurityTestFramework(config);
}
export async function runBasicSecurityTests(targetUrl) {
    const framework = await createSecurityTestFramework({
        target: {
            baseUrl: targetUrl || 'http://localhost:3000'
        }
    });
    await framework.initialize();
    return await framework.runAllTests();
}
//# sourceMappingURL=index.js.map