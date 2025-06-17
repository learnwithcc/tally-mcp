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
    suites: string[];
    owasp: {
        enabled: boolean;
        port: number;
        host: string;
        scanTypes: string[];
        maxScanTime: number;
        reportFormats: string[];
    };
    snyk: {
        enabled: boolean;
        scanTypes: string[];
        severity: string[];
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
        formats: string[];
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