export enum Severity {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export interface RegressionTestCase {
    id: string; // e.g., 'BUG-123'
    description: string;
    severity: Severity;
    component: string;
    reproductionSteps: string[];
    expectedBehavior: string;
    // The actual test function
    test: () => Promise<void>;
}

export interface TestResult {
    testCaseId: string;
    passed: boolean;
    message?: string;
    duration: number;
} 