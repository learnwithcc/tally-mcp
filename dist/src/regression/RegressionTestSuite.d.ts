import { RegressionTestCase, TestResult } from './types';
export declare class RegressionTestSuite {
    private testCases;
    addTest(testCase: RegressionTestCase): void;
    runAll(): Promise<TestResult[]>;
    runTest(testCase: RegressionTestCase): Promise<TestResult>;
    getTestCases(): RegressionTestCase[];
}
//# sourceMappingURL=RegressionTestSuite.d.ts.map