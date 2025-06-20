/**
 * @file Comprehensive tests for logging and monitoring validation
 * Ensures detailed logs and monitoring outputs are produced for debugging and performance analysis
 */

import { WorkflowIntegrationTestSuite } from './WorkflowIntegrationTestSuite';

describe('Logging and Monitoring Integration Tests', () => {
  let testSuite: WorkflowIntegrationTestSuite;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    testSuite = new WorkflowIntegrationTestSuite({
      debug: true, // Enable debug to capture console logs
      enableRealAPI: false
    });
    await testSuite.setUp();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    if (testSuite) {
      await testSuite.tearDown();
    }
  });

  describe('Workflow Execution Logging', () => {
    it('should produce detailed logs for successful workflow execution', async () => {
      const testData = testSuite.createTestData();
      const request = testData.formCreationRequest('Logging Test Form');

      await testSuite.executeWorkflow('logging-test-success', request);
      
      const stats = testSuite.getExecutionStats();
      expect(stats.totalLogs).toBeGreaterThan(0);
      expect(stats.errors).toBe(0);
      expect(stats.successful).toBeGreaterThan(0);

      // Check for key log entries
      const logs = (testSuite as any).executionLogs;
      expect(logs.some((log: any) => log.stage === 'start')).toBe(true);
      expect(logs.some((log: any) => log.stage === 'complete')).toBe(true);
      expect(logs.some((log: any) => log.stage === 'validation')).toBe(true);
      expect(logs.some((log: any) => log.workflow === 'logging-test-success')).toBe(true);
    });

    it('should produce detailed logs for failed workflow execution', async () => {
      const testData = testSuite.createTestData();
      const request = testData.formCreationRequest('Failed Logging Test');

      await testSuite.simulateFailureScenario(
        'logging-test-failure',
        'server-error',
        'form-creation',
        request
      );

      const stats = testSuite.getExecutionStats();
      expect(stats.totalLogs).toBeGreaterThan(0);
      expect(stats.errors).toBeGreaterThan(0);

      const logs = (testSuite as any).executionLogs;
      expect(logs.some((log: any) => log.stage === 'error' || log.stage === 'error-captured')).toBe(true);
      expect(logs.some((log: any) => log.workflow === 'logging-test-failure')).toBe(true);
      expect(logs.some((log: any) => log.data && log.data.error)).toBe(true);
    });

    it('should log data transformation stages correctly', async () => {
      const testData = testSuite.createTestData();
      const request = testData.formModificationRequest('log-transform-form');

      await testSuite.executeWorkflow(
        'log-transformation-test',
        request,
        ['mcp-request', 'form-retrieval', 'nlp-processing', 'tally-api-call', 'response-transformation']
      );

      const logs = (testSuite as any).executionLogs;
      const validationLog = logs.find((log: any) => log.stage === 'validation');
      
      expect(validationLog).toBeDefined();
      expect(validationLog.data.isValid).toBe(true);
    });

    it('should log performance metrics for each workflow', async () => {
      const testData = testSuite.createTestData();
      const request = testData.submissionRequest('log-perf-form');

      await testSuite.executeWorkflow('log-performance-test', request);

      const logs = (testSuite as any).executionLogs;
      const completeLog = logs.find((log: any) => log.stage === 'complete');
      
      expect(completeLog).toBeDefined();
      expect(completeLog.data.duration).toBeGreaterThan(0);
    });
  });

  describe('Monitoring Outputs Validation', () => {
    it('should capture and output execution logs when debug is enabled', async () => {
      const testData = testSuite.createTestData();
      const request = testData.formCreationRequest('Debug Output Test');
      
      await testSuite.executeWorkflow('debug-output-test', request);

      // Since debug is true, outputExecutionLogs will be called in tearDown.
      // We are spying on console.log to see if it's called with the logs.
      await testSuite.tearDown();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('=== Workflow Execution Logs ==='));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('debug-output-test:start'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('=== End Execution Logs ==='));
    });

    it('should not output execution logs when debug is disabled', async () => {
      // Re-initialize testSuite with debug: false
      consoleLogSpy.mockRestore();
      await testSuite.tearDown();

      testSuite = new WorkflowIntegrationTestSuite({ debug: false });
      await testSuite.setUp();
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const testData = testSuite.createTestData();
      const request = testData.formCreationRequest('No Debug Output');
      
      await testSuite.executeWorkflow('no-debug-output-test', request);
      await testSuite.tearDown();

      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('=== Workflow Execution Logs ==='));
    });

    it('should provide comprehensive execution statistics', async () => {
      const testData = testSuite.createTestData();

      // Run a mix of successful and failed workflows
      await testSuite.executeWorkflow('stats-success-1', testData.formCreationRequest('Stats 1'));
      await testSuite.executeWorkflow('stats-success-2', testData.formModificationRequest('stats-form-2'));
      await testSuite.simulateFailureScenario(
        'stats-failure-1',
        'timeout',
        'submission-retrieval',
        testData.submissionRequest('stats-form-3')
      );

      const stats = testSuite.getExecutionStats();
      
      expect(stats.totalLogs).toBeGreaterThan(0);
      expect(stats.uniqueWorkflows).toBe(3);
      expect(stats.errors).toBe(1);

      // The number of successful workflows should reflect only those that completed
      const successfulWorkflows = new Set(
        (testSuite as any).executionLogs
          .filter((log: any) => log.stage === 'complete')
          .map((log: any) => log.workflow)
      );
      expect(stats.successful).toBe(successfulWorkflows.size);
      
      expect(stats.totalDuration).toBeGreaterThan(0);
    });
  });

  describe('Log Content and Formatting', () => {
    it('should format logs with consistent ISO timestamps', async () => {
      const testData = testSuite.createTestData();
      await testSuite.executeWorkflow('timestamp-format-test', testData.formCreationRequest('Timestamp Test'));
      
      const logs = (testSuite as any).executionLogs;
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      
      logs.forEach((log: any) => {
        expect(log.timestamp).toMatch(timestampRegex);
      });
    });

    it('should include request and response data in logs where appropriate', async () => {
      const testData = testSuite.createTestData();
      const request = testData.teamManagementRequest('log-data-team');
      
      await testSuite.executeWorkflow('log-data-inclusion-test', request);

      const logs = (testSuite as any).executionLogs;
      const startLog = logs.find((log: any) => log.stage === 'start' && log.workflow === 'log-data-inclusion-test');
      const completeLog = logs.find((log: any) => log.stage === 'complete' && log.workflow === 'log-data-inclusion-test');
      
      expect(startLog).toBeDefined();
      expect(startLog.data.request).toEqual(request);
      
      expect(completeLog).toBeDefined();
      expect(completeLog.data.responseBody).toBeDefined();
    });

    it('should serialize error objects correctly in logs', async () => {
      const testData = testSuite.createTestData();
      await testSuite.simulateFailureScenario(
        'log-error-serialization-test',
        'server-error',
        'form-creation',
        testData.formCreationRequest('Error Serialization')
      );

      const logs = (testSuite as any).executionLogs;
      const errorLog = logs.find((log: any) => log.stage === 'error' && log.workflow === 'log-error-serialization-test');
      
      expect(errorLog).toBeDefined();
      expect(errorLog.data.error).toBeDefined();
      // Ensure the error is an object, not just a string
      expect(typeof errorLog.data.error).toBe('object');
    });
  });
}); 