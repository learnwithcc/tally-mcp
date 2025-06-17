/**
 * Custom Security Tests
 * 
 * Implements custom security tests tailored to the Tally MCP application
 */

import { Logger, LogLevel } from '../../utils/logger';
import { 
  SecurityTestResult, 
  SecurityTestRunner, 
  CustomTestConfig, 
  SecurityTest,
  SecurityTestCategory,
  SecurityTestSeverity
} from '../types';
import { AuthenticationTests } from './categories/AuthenticationTests';
import { AuthorizationTests } from './categories/AuthorizationTests';
import { InputValidationTests } from './categories/InputValidationTests';
import { APISecurityTests } from './categories/APISecurityTests';
import { DataProtectionTests } from './categories/DataProtectionTests';
import { MCPServer, SERVER_CAPABILITIES } from '../../server';

export class CustomSecurityTests implements SecurityTestRunner {
  private logger: Logger;
  private config: CustomTestConfig;
  private testCategories: SecurityTestCategory[];
  private server: MCPServer;

  constructor(config: CustomTestConfig) {
    this.config = config;
    this.logger = new Logger({ component: 'CustomSecurityTests' });
    this.testCategories = [];
    this.server = new MCPServer({
      port: 3000,
      host: 'localhost',
      logger: {
        level: LogLevel.ERROR // Keep test logs clean
      },
      capabilities: SERVER_CAPABILITIES,
    });
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing custom security tests and starting server...');

    try {
      await this.server.initialize();
      this.logger.info('Server started for custom tests.');

      // Initialize test categories
      this.testCategories = [
        new AuthenticationTests(),
        new AuthorizationTests(),
        new InputValidationTests(), 
        new APISecurityTests(),
        new DataProtectionTests()
      ];

      // Filter enabled categories
      this.testCategories = this.testCategories.filter(category => category.enabled);

      this.logger.info(`Initialized ${this.testCategories.length} test categories`);
    } catch (error) {
      this.logger.error('Failed to initialize custom security tests', undefined, error as Error);
      throw error;
    }
  }

  async runAll(): Promise<SecurityTestResult[]> {
    this.logger.info('Running all custom security tests');

    const results: SecurityTestResult[] = [];
    const startTime = Date.now();

    try {
      for (const category of this.testCategories) {
        this.logger.info(`Running ${category.name} tests`);
        
        for (const test of category.tests) {
          try {
            const result = await this.runSingleTest(test);
            results.push(result);
          } catch (error) {
            this.logger.error(`Test ${test.id} failed`, undefined, error as Error);
            results.push(this.createFailedResult(test, error, startTime));
          }
        }
      }

      const duration = Date.now() - startTime;
      const passed = results.filter(r => r.status === 'passed').length;
      const failed = results.filter(r => r.status === 'failed').length;

      this.logger.info(`Custom tests completed in ${duration}ms. Passed: ${passed}, Failed: ${failed}`);
      return results;
    } catch (error) {
      this.logger.error('Custom security tests failed', undefined, error as Error);
      throw error;
    }
  }

  async runTest(testId: string): Promise<SecurityTestResult> {
    this.logger.info(`Running specific test: ${testId}`);

    const test = this.findTest(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    return await this.runSingleTest(test);
  }

  async checkAvailability(): Promise<boolean> {
    return this.config.enabled;
  }

  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up custom security tests and stopping server...');
    await this.server.shutdown();
    this.logger.info('Server stopped.');
  }

  private async runSingleTest(test: SecurityTest): Promise<SecurityTestResult> {
    const startTime = Date.now();
    
    try {
      const result = await test.execute();
      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      return this.createFailedResult(test, error, startTime);
    }
  }

  private createFailedResult(test: SecurityTest, error: any, startTime: number): SecurityTestResult {
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

  private findTest(testId: string): SecurityTest | undefined {
    for (const category of this.testCategories) {
      const test = category.tests.find(t => t.id === testId);
      if (test) {
        return test;
      }
    }
    return undefined;
  }

  /**
   * Get all available tests grouped by category
   */
  getTestCategories(): SecurityTestCategory[] {
    return this.testCategories;
  }

  /**
   * Get all tests as a flat array
   */
  getAllTests(): SecurityTest[] {
    return this.testCategories.flatMap(category => category.tests);
  }

  /**
   * Get tests by severity level
   */
  getTestsBySeverity(severity: SecurityTestSeverity): SecurityTest[] {
    return this.getAllTests().filter(test => test.severity === severity);
  }

  /**
   * Get tests by tags
   */
  getTestsByTags(tags: string[]): SecurityTest[] {
    return this.getAllTests().filter(test => 
      tags.some(tag => test.tags.includes(tag))
    );
  }
} 