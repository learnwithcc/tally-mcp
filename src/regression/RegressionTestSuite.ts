import { RegressionTestCase, TestResult } from './types';

export class RegressionTestSuite {
    private testCases: RegressionTestCase[] = [];

    public addTest(testCase: RegressionTestCase): void {
        this.testCases.push(testCase);
    }

    public async runAll(): Promise<TestResult[]> {
        const results: TestResult[] = [];
        for (const testCase of this.testCases) {
            const result = await this.runTest(testCase);
            results.push(result);
        }
        return results;
    }

    public async runTest(testCase: RegressionTestCase): Promise<TestResult> {
        const startTime = Date.now();
        try {
            await testCase.test();
            return {
                testCaseId: testCase.id,
                passed: true,
                duration: Date.now() - startTime,
            };
        } catch (error) {
            return {
                testCaseId: testCase.id,
                passed: false,
                message: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime,
            };
        }
    }

    public getTestCases(): RegressionTestCase[] {
        return this.testCases;
    }
} 