export { SecurityTestFramework } from './SecurityTestFramework';
export * from './types';
export { OWASPZAPIntegration } from './integrations/OWASPZAPIntegration';
export { SnykIntegration } from './integrations/SnykIntegration';
export { CustomSecurityTests } from './tests/CustomSecurityTests';
export { SecurityTestReporter } from './reporting/SecurityTestReporter';
export declare const DEFAULT_SECURITY_TEST_CONFIG: import("./types").SecurityTestConfig;
export declare function createSecurityTestFramework(overrides?: any): Promise<import("./SecurityTestFramework").SecurityTestFramework>;
export declare function runBasicSecurityTests(targetUrl?: string): Promise<import("./types").SecurityTestResult[]>;
//# sourceMappingURL=index.d.ts.map