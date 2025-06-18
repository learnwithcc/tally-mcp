export declare enum Severity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export interface RegressionTestCase {
    id: string;
    description: string;
    severity: Severity;
    component: string;
    reproductionSteps: string[];
    expectedBehavior: string;
    test: () => Promise<void>;
}
export interface TestResult {
    testCaseId: string;
    passed: boolean;
    message?: string;
    duration: number;
}
//# sourceMappingURL=types.d.ts.map