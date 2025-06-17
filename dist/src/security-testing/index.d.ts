export { SecurityTestFramework } from './SecurityTestFramework';
export * from './types';
export { OWASPZAPIntegration } from './integrations/OWASPZAPIntegration';
export { SnykIntegration } from './integrations/SnykIntegration';
export { CustomSecurityTests } from './tests/CustomSecurityTests';
export { SecurityTestReporter } from './reporting/SecurityTestReporter';
export declare const DEFAULT_SECURITY_TEST_CONFIG: {
    target: {
        baseUrl: string;
        timeout: number;
    };
    suites: readonly ["custom"];
    owasp: {
        enabled: boolean;
        port: number;
        host: string;
        scanTypes: readonly ["baseline"];
        maxScanTime: number;
        reportFormats: readonly ["json"];
    };
    snyk: {
        enabled: boolean;
        scanTypes: readonly ["dependencies"];
        severity: readonly ["high", "critical"];
        failOnIssues: boolean;
    };
    custom: {
        enabled: boolean;
        parallel: boolean;
        maxConcurrency: number;
        timeout: number;
        retries: number;
    };
    reporting: {
        enabled: boolean;
        outputDir: string;
        formats: readonly ["json", "html"];
        includeEvidence: boolean;
        aggregateResults: boolean;
    };
    cicd: {
        enabled: boolean;
        breakBuildOnFailure: boolean;
        publishResults: boolean;
    };
};
export declare function createSecurityTestFramework(overrides?: any): Promise<import("./SecurityTestFramework").SecurityTestFramework>;
export declare function runBasicSecurityTests(targetUrl?: string): Promise<import("./types").SecurityTestResult[]>;
//# sourceMappingURL=index.d.ts.map