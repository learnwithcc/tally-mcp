// Debug script to understand simulateFailureScenario behavior
import { WorkflowIntegrationTestSuite } from './src/__tests__/WorkflowIntegrationTestSuite';

async function debugSimulateFailure() {
  const testSuite = new WorkflowIntegrationTestSuite({ debug: true });
  
  try {
    await testSuite.setUp();
    
    const testData = testSuite.createTestData();
    const request = testData.formCreationRequest('Debug Test Form');
    
    console.log('=== Testing timeout scenario ===');
    const timeoutResult = await testSuite.simulateFailureScenario(
      'debug-timeout-test',
      'timeout',
      'form-creation',
      request
    );
    
    console.log('Timeout result structure:', JSON.stringify(timeoutResult, null, 2));
    console.log('result.error:', timeoutResult.error);
    console.log('typeof result.error:', typeof timeoutResult.error);
    console.log('result keys:', Object.keys(timeoutResult));
    
  } catch (error) {
    console.error('Debug script error:', error);
  } finally {
    await testSuite.tearDown();
  }
}

debugSimulateFailure();