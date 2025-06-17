import { SecurityTestResult, SecurityTestRunner, CustomTestConfig, SecurityTest, SecurityTestCategory, SecurityTestSeverity } from '../types';
export declare class CustomSecurityTests implements SecurityTestRunner {
    private logger;
    private config;
    private testCategories;
    constructor(config: CustomTestConfig);
    initialize(): Promise<void>;
    runAll(): Promise<SecurityTestResult[]>;
    runTest(testId: string): Promise<SecurityTestResult>;
    checkAvailability(): Promise<boolean>;
    cleanup(): Promise<void>;
    private runSingleTest;
    private createFailedResult;
    private findTest;
    getTestCategories(): SecurityTestCategory[];
    getAllTests(): SecurityTest[];
    getTestsBySeverity(severity: SecurityTestSeverity): SecurityTest[];
    getTestsByTags(tags: string[]): SecurityTest[];
}
//# sourceMappingURL=CustomSecurityTests.d.ts.map