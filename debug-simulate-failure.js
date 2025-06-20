// Debug script to understand simulateFailureScenario behavior
const { WorkflowIntegrationTestSuite } = require('./dist/__tests__/WorkflowIntegrationTestSuite');

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
    
    console.log('\n=== Testing server-error scenario ===');
    const serverErrorResult = await testSuite.simulateFailureScenario(
      'debug-server-error-test',
      'server-error',
      'form-creation',
      request
    );
    
    console.log('Server error result structure:', JSON.stringify(serverErrorResult, null, 2));
    console.log('result.error:', serverErrorResult.error);
    
    console.log('\n=== Testing auth-failure scenario ===');
    const authFailureResult = await testSuite.simulateFailureScenario(
      'debug-auth-failure-test',
      'auth-failure',
      'form-creation',
      request
    );
    
    console.log('Auth failure result structure:', JSON.stringify(authFailureResult, null, 2));
    console.log('result.error:', authFailureResult.error);
    
  } catch (error) {
    console.error('Debug script error:', error);
  } finally {
    await testSuite.tearDown();
  }
}

debugSimulateFailure();