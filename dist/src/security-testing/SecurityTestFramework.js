import { Logger } from '../utils/logger';
import { OWASPZAPIntegration } from './integrations/OWASPZAPIntegration';
import { SnykIntegration } from './integrations/SnykIntegration';
import { CustomSecurityTests } from './tests/CustomSecurityTests';
import { SecurityTestReporter } from './reporting/SecurityTestReporter';
export class SecurityTestFramework {
    constructor(config) {
        this.config = config;
        this.logger = new Logger({ component: 'SecurityTestFramework' });
        this.owaspZap = new OWASPZAPIntegration(config.owasp);
        this.snyk = new SnykIntegration(config.snyk);
        this.customTests = new CustomSecurityTests(config.custom);
        this.reporter = new SecurityTestReporter(config.reporting);
    }
    async runAllTests() {
        this.logger.info('Starting comprehensive security test suite');
        const results = [];
        const startTime = Date.now();
        try {
            if (this.config.suites.includes('custom')) {
                this.logger.info('Running custom security tests');
                const customResults = await this.customTests.runAll();
                results.push(...customResults);
            }
            if (this.config.suites.includes('owasp-zap')) {
                this.logger.info('Running OWASP ZAP security scan');
                const zapResults = await this.owaspZap.runScan();
                results.push(...zapResults);
            }
            if (this.config.suites.includes('snyk')) {
                this.logger.info('Running Snyk vulnerability scan');
                const snykResults = await this.snyk.runScan();
                results.push(...snykResults);
            }
            const endTime = Date.now();
            const duration = endTime - startTime;
            this.logger.info(`Security test suite completed in ${duration}ms`);
            await this.reporter.generateReport(results, {
                startTime,
                endTime,
                duration,
                totalTests: results.length,
                passed: results.filter(r => r.status === 'passed').length,
                failed: results.filter(r => r.status === 'failed').length,
                warnings: results.filter(r => r.status === 'warning').length
            });
            return results;
        }
        catch (error) {
            this.logger.error('Security test suite failed', undefined, error);
            throw error;
        }
    }
    async runTestSuite(suite) {
        this.logger.info(`Running ${suite} test suite`);
        switch (suite) {
            case 'custom':
                return await this.customTests.runAll();
            case 'owasp-zap':
                return await this.owaspZap.runScan();
            case 'snyk':
                return await this.snyk.runScan();
            default:
                throw new Error(`Unknown test suite: ${suite}`);
        }
    }
    async validateConfiguration() {
        this.logger.info('Validating security test framework configuration');
        try {
            await this.owaspZap.checkAvailability();
            await this.snyk.checkAvailability();
            if (!this.config.target?.baseUrl) {
                throw new Error('Target base URL not configured');
            }
            if (!this.config.suites || this.config.suites.length === 0) {
                throw new Error('No test suites configured');
            }
            this.logger.info('Security test framework configuration validated successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Configuration validation failed', undefined, error);
            return false;
        }
    }
    async getStatus() {
        return {
            ready: await this.validateConfiguration(),
            tools: {
                'owasp-zap': await this.owaspZap.checkAvailability(),
                'snyk': await this.snyk.checkAvailability(),
                'custom-tests': true
            },
            lastRun: this.reporter.getLastRunTime(),
            nextScheduledRun: this.config.schedule?.nextRun
        };
    }
    async initialize() {
        this.logger.info('Initializing Security Test Framework');
        try {
            await this.owaspZap.initialize();
            await this.snyk.initialize();
            await this.customTests.initialize();
            await this.reporter.initialize();
            this.logger.info('Security Test Framework initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Security Test Framework', undefined, error);
            throw error;
        }
    }
    async cleanup() {
        this.logger.info('Cleaning up Security Test Framework');
        try {
            await this.owaspZap.cleanup();
            await this.snyk.cleanup();
            await this.customTests.cleanup();
            await this.reporter.cleanup();
            this.logger.info('Security Test Framework cleanup completed');
        }
        catch (error) {
            this.logger.error('Failed to cleanup Security Test Framework', undefined, error);
        }
    }
}
//# sourceMappingURL=SecurityTestFramework.js.map