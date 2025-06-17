export { SecurityTestFramework } from './SecurityTestFramework';
export * from './types';
export { OWASPZAPIntegration } from './integrations/OWASPZAPIntegration';
export { SnykIntegration } from './integrations/SnykIntegration';
export { CustomSecurityTests } from './tests/CustomSecurityTests';
export { SecurityTestReporter } from './reporting/SecurityTestReporter';
export const DEFAULT_SECURITY_TEST_CONFIG = {
    target: {
        baseUrl: 'http://localhost:3000',
        timeout: 30000
    },
    suites: ['custom'],
    owasp: {
        enabled: false,
        port: 8080,
        host: 'localhost',
        scanTypes: ['baseline'],
        maxScanTime: 300000,
        reportFormats: ['json']
    },
    snyk: {
        enabled: false,
        scanTypes: ['dependencies'],
        severity: ['high', 'critical'],
        failOnIssues: false
    },
    custom: {
        enabled: true,
        parallel: false,
        maxConcurrency: 3,
        timeout: 10000,
        retries: 1
    },
    reporting: {
        enabled: true,
        outputDir: 'reports/security',
        formats: ['json', 'html'],
        includeEvidence: true,
        aggregateResults: true
    },
    cicd: {
        enabled: false,
        breakBuildOnFailure: false,
        publishResults: true
    }
};
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