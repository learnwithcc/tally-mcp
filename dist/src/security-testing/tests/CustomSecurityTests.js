import { Logger } from '../../utils/logger';
import { AuthenticationTests } from './categories/AuthenticationTests';
import { AuthorizationTests } from './categories/AuthorizationTests';
import { InputValidationTests } from './categories/InputValidationTests';
import { APISecurityTests } from './categories/APISecurityTests';
import { DataProtectionTests } from './categories/DataProtectionTests';
import { HTTPHeaderTests } from './categories/HTTPHeaderTests';
export class CustomSecurityTests {
    constructor(config, target) {
        this.config = config;
        this.target = target;
        this.logger = new Logger({ component: 'CustomSecurityTests' });
        this.testCategories = [];
    }
    async initialize() {
        this.logger.info('Initializing custom security tests...');
        try {
            this.testCategories = [
                new AuthenticationTests(this.target),
                new AuthorizationTests(this.target),
                new InputValidationTests(this.target),
                new APISecurityTests(this.target),
                new DataProtectionTests(this.target),
                new HTTPHeaderTests(this.target)
            ];
            this.testCategories = this.testCategories.filter(category => category.enabled);
            this.logger.info(`Initialized ${this.testCategories.length} test categories`);
        }
        catch (error) {
            this.logger.error('Failed to initialize custom security tests', undefined, error);
            throw error;
        }
    }
    async runAll() {
        this.logger.info('Running all custom security tests');
        const results = [];
        const startTime = Date.now();
        try {
            for (const category of this.testCategories) {
                this.logger.info(`Running ${category.name} tests`);
                for (const test of category.tests) {
                    try {
                        const result = await this.runSingleTest(test);
                        results.push(result);
                    }
                    catch (error) {
                        this.logger.error(`Test ${test.id} failed`, undefined, error);
                        results.push(this.createFailedResult(test, error, startTime));
                    }
                }
            }
            const duration = Date.now() - startTime;
            const passed = results.filter(r => r.status === 'passed').length;
            const failed = results.filter(r => r.status === 'failed').length;
            this.logger.info(`Custom tests completed in ${duration}ms. Passed: ${passed}, Failed: ${failed}`);
            return results;
        }
        catch (error) {
            this.logger.error('Custom security tests failed', undefined, error);
            throw error;
        }
    }
    async runTest(testId) {
        this.logger.info(`Running specific test: ${testId}`);
        const test = this.findTest(testId);
        if (!test) {
            throw new Error(`Test ${testId} not found`);
        }
        return await this.runSingleTest(test);
    }
    async checkAvailability() {
        return this.config.enabled;
    }
    async cleanup() {
        this.logger.info('Cleaning up custom security tests...');
    }
    async runSingleTest(test) {
        const startTime = Date.now();
        try {
            const result = await test.execute();
            result.duration = Date.now() - startTime;
            return result;
        }
        catch (error) {
            return this.createFailedResult(test, error, startTime);
        }
    }
    createFailedResult(test, error, startTime) {
        return {
            id: test.id,
            name: test.name,
            suite: 'custom',
            status: 'failed',
            severity: test.severity,
            description: test.description,
            details: `Test execution failed: ${error?.message || 'Unknown error'}`,
            evidence: {
                type: 'log',
                content: error?.stack || error?.toString() || 'No error details available',
                encoding: 'utf8',
                mimeType: 'text/plain'
            },
            remediation: 'Review test implementation and fix any issues',
            duration: Date.now() - startTime,
            timestamp: new Date(),
            metadata: {
                category: test.category,
                tags: test.tags,
                error: error?.message
            }
        };
    }
    findTest(testId) {
        for (const category of this.testCategories) {
            const test = category.tests.find(t => t.id === testId);
            if (test) {
                return test;
            }
        }
        return undefined;
    }
    getTestCategories() {
        return this.testCategories;
    }
    getAllTests() {
        return this.testCategories.flatMap(category => category.tests);
    }
    getTestsBySeverity(severity) {
        return this.getAllTests().filter(test => test.severity === severity);
    }
    getTestsByTags(tags) {
        return this.getAllTests().filter(test => tags.some(tag => test.tags.includes(tag)));
    }
}
//# sourceMappingURL=CustomSecurityTests.js.map