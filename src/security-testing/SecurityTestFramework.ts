/**
 * Security Testing Framework
 * 
 * This framework orchestrates security testing by integrating custom tests
 * with third-party security tools like OWASP ZAP and Snyk.
 */

import { Logger } from '../utils/logger';
import { SecurityTestResult, SecurityTestConfig, TestSuite } from './types';
import { OWASPZAPIntegration } from './integrations/OWASPZAPIntegration';
import { SnykIntegration } from './integrations/SnykIntegration';
import { CustomSecurityTests } from './tests/CustomSecurityTests';
import { SecurityTestReporter } from './reporting/SecurityTestReporter';

export class SecurityTestFramework {
  private logger: Logger;
  private config: SecurityTestConfig;
  private owaspZap: OWASPZAPIntegration;
  private snyk: SnykIntegration;
  private customTests: CustomSecurityTests;
  private reporter: SecurityTestReporter;

  constructor(config: SecurityTestConfig) {
    this.config = config;
    this.logger = new Logger({ component: 'SecurityTestFramework' });
    this.owaspZap = new OWASPZAPIntegration(config.owasp);
    this.snyk = new SnykIntegration(config.snyk);
    this.customTests = new CustomSecurityTests(config.custom);
    this.reporter = new SecurityTestReporter(config.reporting);
  }

  /**
   * Run all security test suites
   */
  async runAllTests(): Promise<SecurityTestResult[]> {
    this.logger.info('Starting comprehensive security test suite');
    
    const results: SecurityTestResult[] = [];
    const startTime = Date.now();

    try {
      // Run custom security tests first
      if (this.config.suites.includes('custom')) {
        this.logger.info('Running custom security tests');
        const customResults = await this.customTests.runAll();
        results.push(...customResults);
      }

      // Run OWASP ZAP security scan
      if (this.config.suites.includes('owasp-zap')) {
        this.logger.info('Running OWASP ZAP security scan');
        const zapResults = await this.owaspZap.runScan();
        results.push(...zapResults);
      }

      // Run Snyk vulnerability scan
      if (this.config.suites.includes('snyk')) {
        this.logger.info('Running Snyk vulnerability scan');
        const snykResults = await this.snyk.runScan();
        results.push(...snykResults);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.logger.info(`Security test suite completed in ${duration}ms`);
      
      // Generate comprehensive report
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
    } catch (error) {
      this.logger.error('Security test suite failed', undefined, error as Error);
      throw error;
    }
  }

  /**
   * Run specific test suite
   */
  async runTestSuite(suite: TestSuite): Promise<SecurityTestResult[]> {
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

  /**
   * Validate framework configuration
   */
  async validateConfiguration(): Promise<boolean> {
    this.logger.info('Validating security test framework configuration');

    try {
      // Check if required tools are available
      await this.owaspZap.checkAvailability();
      await this.snyk.checkAvailability();
      
      // Validate configuration
      if (!this.config.target?.baseUrl) {
        throw new Error('Target base URL not configured');
      }

      if (!this.config.suites || this.config.suites.length === 0) {
        throw new Error('No test suites configured');
      }

      this.logger.info('Security test framework configuration validated successfully');
      return true;
    } catch (error) {
      this.logger.error('Configuration validation failed', undefined, error as Error);
      return false;
    }
  }

  /**
   * Get framework status and health
   */
  async getStatus(): Promise<{
    ready: boolean;
    tools: Record<string, boolean>;
    lastRun?: Date;
    nextScheduledRun?: Date;
  }> {
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

  /**
   * Initialize the framework
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Security Test Framework');
    
    try {
      await this.owaspZap.initialize();
      await this.snyk.initialize();
      await this.customTests.initialize();
      await this.reporter.initialize();
      
      this.logger.info('Security Test Framework initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Security Test Framework', undefined, error as Error);
      throw error;
    }
  }

  /**
   * Cleanup framework resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up Security Test Framework');
    
    try {
      await this.owaspZap.cleanup();
      await this.snyk.cleanup();
      await this.customTests.cleanup();
      await this.reporter.cleanup();
      
      this.logger.info('Security Test Framework cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup Security Test Framework', undefined, error as Error);
    }
  }
} 