const securityTestingConfig = {
    target: {
        baseUrl: 'http://localhost:3001',
    },
    suites: ['custom'],
    custom: {
        enabled: true,
        testPaths: ['src/security-testing/tests/categories'],
    },
    reporting: {
        enabled: true,
        outputDir: 'reports/security',
        formats: ['json', 'html'],
    },
    owasp: {
        enabled: true,
        zapPath: '/usr/local/bin/zap.sh',
        port: 8080,
        host: 'localhost',
        scanTypes: ['baseline'],
        reportFormats: ['html', 'json'],
    },
    snyk: {
        enabled: true,
        token: 'YOUR_SNYK_TOKEN',
        scanTypes: ['dependencies', 'code'],
        severity: ['high', 'critical'],
    },
};
export default securityTestingConfig;
//# sourceMappingURL=security-testing.config.js.map