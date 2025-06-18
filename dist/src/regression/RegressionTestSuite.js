export class RegressionTestSuite {
    constructor() {
        this.testCases = [];
    }
    addTest(testCase) {
        this.testCases.push(testCase);
    }
    async runAll() {
        const results = [];
        for (const testCase of this.testCases) {
            const result = await this.runTest(testCase);
            results.push(result);
        }
        return results;
    }
    async runTest(testCase) {
        const startTime = Date.now();
        try {
            await testCase.test();
            return {
                testCaseId: testCase.id,
                passed: true,
                duration: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                testCaseId: testCase.id,
                passed: false,
                message: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime,
            };
        }
    }
    getTestCases() {
        return this.testCases;
    }
}
//# sourceMappingURL=RegressionTestSuite.js.map