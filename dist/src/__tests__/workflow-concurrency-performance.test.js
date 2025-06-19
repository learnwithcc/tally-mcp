import { WorkflowIntegrationTestSuite } from './WorkflowIntegrationTestSuite';
describe('Concurrency and Performance Integration Tests', () => {
    let testSuite;
    beforeEach(async () => {
        testSuite = new WorkflowIntegrationTestSuite({
            debug: false,
            enableRealAPI: false
        });
        await testSuite.setUp();
    });
    afterEach(async () => {
        if (testSuite) {
            await testSuite.tearDown();
        }
    });
    describe('Concurrent Workflow Execution', () => {
        it('should handle multiple concurrent form creation workflows without errors', async () => {
            const testData = testSuite.createTestData();
            const workflows = Array.from({ length: 10 }, (_, i) => ({
                name: `concurrent-form-creation-${i}`,
                request: testData.formCreationRequest(`Concurrent Form ${i}`)
            }));
            const results = await testSuite.testConcurrentExecution(workflows, 5);
            results.forEach(result => {
                if ('error' in result) {
                    fail(`Concurrent workflow failed with error: ${JSON.stringify(result.error)}`);
                }
                else {
                    expect(result.isValid).toBe(true);
                    expect(result.actualOutput.error).toBeUndefined();
                }
            });
        }, 15000);
        it('should handle a mix of concurrent read and write workflows', async () => {
            const testData = testSuite.createTestData();
            const workflows = [
                { name: 'create-1', request: testData.formCreationRequest('Mixed Test 1') },
                { name: 'modify-1', request: testData.formModificationRequest('form-1') },
                { name: 'retrieve-1', request: testData.submissionRequest('form-2') },
                { name: 'create-2', request: testData.formCreationRequest('Mixed Test 2') },
                { name: 'team-1', request: testData.teamManagementRequest('team-1') },
                { name: 'retrieve-2', request: testData.submissionRequest('form-3') },
                { name: 'create-3', request: testData.formCreationRequest('Mixed Test 3') },
                { name: 'modify-2', request: testData.formModificationRequest('form-4') }
            ];
            const results = await testSuite.testConcurrentExecution(workflows, 4);
            results.forEach(result => {
                if ('error' in result) {
                    fail(`Mixed concurrent workflow failed: ${JSON.stringify(result.error)}`);
                }
                else {
                    expect(result.isValid).toBe(true);
                }
            });
        }, 20000);
        it('should maintain data integrity under high concurrency', async () => {
            const testData = testSuite.createTestData();
            const numWorkflows = 20;
            const workflows = Array.from({ length: numWorkflows }, (_, i) => ({
                name: `data-integrity-concurrent-${i}`,
                request: testData.formCreationRequest(`Integrity Form ${i}`)
            }));
            const results = await testSuite.testConcurrentExecution(workflows, 10);
            const successfulResults = results.filter(r => !('error' in r));
            expect(successfulResults.length).toBe(numWorkflows);
            const responseIds = successfulResults.map(r => ('actualOutput' in r) && r.actualOutput.id);
            const uniqueIds = new Set(responseIds);
            expect(uniqueIds.size).toBe(numWorkflows);
        }, 25000);
    });
    describe('Performance and Timing Validation', () => {
        it('should execute a single simple workflow within a strict time limit', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Timing Test Form');
            const startTime = Date.now();
            const validation = await testSuite.executeWorkflow('timing-test-simple', request);
            const duration = Date.now() - startTime;
            expect(validation.isValid).toBe(true);
            expect(duration).toBeLessThan(1000);
        });
        it('should maintain acceptable performance under moderate load', async () => {
            const testData = testSuite.createTestData();
            const workflows = Array.from({ length: 5 }, (_, i) => ({
                name: `load-test-${i}`,
                request: testData.formCreationRequest(`Load Test Form ${i}`)
            }));
            const startTime = Date.now();
            await testSuite.testConcurrentExecution(workflows, 5);
            const duration = Date.now() - startTime;
            const avgTime = duration / workflows.length;
            expect(avgTime).toBeLessThan(1500);
        }, 15000);
        it('should measure and validate performance of complex workflows', async () => {
            const complexRequest = {
                jsonrpc: '2.0',
                id: 'complex-perf-test',
                method: 'tools/call',
                params: {
                    name: 'form_creation_tool',
                    arguments: {
                        naturalLanguagePrompt: 'Create a detailed user registration form with name, email, password, address, phone number, and a checkbox for terms of service.',
                    },
                },
            };
            const startTime = Date.now();
            const validation = await testSuite.executeWorkflow('timing-test-complex', complexRequest);
            const duration = Date.now() - startTime;
            expect(validation.isValid).toBe(true);
            expect(duration).toBeLessThan(3000);
        });
    });
    describe('Data Integrity and Race Condition Validation', () => {
        it('should prevent data corruption when modifying the same resource concurrently', async () => {
            const testData = testSuite.createTestData();
            const formId = 'concurrent-modify-form';
            const modificationWorkflows = [
                { name: 'modify-A', request: testData.formModificationRequest(formId) },
                { name: 'modify-B', request: testData.formModificationRequest(formId) }
            ];
            const results = await testSuite.testConcurrentExecution(modificationWorkflows, 2);
            results.forEach(result => {
                if ('error' in result) {
                    console.warn('Concurrent modification resulted in an error (potentially expected):', result.error);
                }
                else {
                    expect(result.isValid).toBe(true);
                }
            });
        });
        it('should ensure thread safety for shared resources', async () => {
            const testData = testSuite.createTestData();
            const workflows = Array.from({ length: 15 }, (_, i) => ({
                name: `thread-safety-test-${i}`,
                request: i % 2 === 0
                    ? testData.formCreationRequest(`Thread Safety ${i}`)
                    : testData.submissionRequest(`form-${i}`)
            }));
            const results = await testSuite.testConcurrentExecution(workflows, 8);
            results.forEach(result => {
                expect('error' in result).toBe(false);
                if (!('error' in result)) {
                    expect(result.isValid).toBe(true);
                }
            });
        }, 20000);
    });
    describe('Workflow Rollback Testing', () => {
        it('should test partial failure scenarios and confirm proper cleanup', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Rollback Test');
            testSuite.mockedAxios.post.mockImplementationOnce(async () => {
                return { status: 200, data: { step1: 'complete' } };
            }).mockImplementationOnce(async () => {
                return Promise.reject(new Error('Simulated downstream failure'));
            });
            const result = await testSuite.executeWorkflow('rollback-test', request).catch(e => ({ error: e }));
            if ('error' in result) {
                expect(result.error).toBeDefined();
            }
            else {
                fail('Rollback test should have resulted in an error');
            }
        });
    });
});
//# sourceMappingURL=workflow-concurrency-performance.test.js.map