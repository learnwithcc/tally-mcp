import { SecurityTestResult, SecurityTestConfig, TestSuite } from './types';
export declare class SecurityTestFramework {
    private logger;
    private config;
    private owaspZap;
    private snyk;
    private customTests;
    private reporter;
    private server;
    constructor(config: SecurityTestConfig);
    runAllTests(): Promise<SecurityTestResult[]>;
    runTestSuite(suite: TestSuite): Promise<SecurityTestResult[]>;
    validateConfiguration(): Promise<boolean>;
    getStatus(): Promise<{
        ready: boolean;
        tools: Record<string, boolean>;
        lastRun?: Date;
        nextScheduledRun?: Date;
    }>;
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=SecurityTestFramework.d.ts.map