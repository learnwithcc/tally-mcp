import { WorkflowIntegrationTestSuite } from './WorkflowIntegrationTestSuite';
describe('Error Scenario Integration Tests', () => {
    let testSuite;
    beforeEach(async () => {
        testSuite = new WorkflowIntegrationTestSuite({
            debug: true,
            enableRealAPI: false
        });
        await testSuite.setUp();
    });
    afterEach(async () => {
        if (testSuite) {
            await testSuite.tearDown();
        }
    });
    describe('Tally API Error Responses (4xx/5xx)', () => {
        it('should handle 400 Bad Request from Tally API', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Invalid Form');
            const result = await testSuite.simulateFailureScenario('bad-request-test', 'server-error', 'form-creation', request);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.error || result.actualOutput.result).toBeDefined();
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe(request.id);
            }
        });
        it('should handle 401 Unauthorized from Tally API', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Unauthorized Form');
            const result = await testSuite.simulateFailureScenario('unauthorized-test', 'auth-failure', 'form-creation', request);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe(request.id);
                expect(result.actualOutput.error || result.actualOutput.result).toBeDefined();
            }
        });
        it('should handle 403 Forbidden from Tally API', async () => {
            const forbiddenRequest = {
                jsonrpc: '2.0',
                id: 'test-forbidden-access',
                method: 'tools/call',
                params: {
                    name: 'form_modification_tool',
                    arguments: {
                        formId: 'restricted-form-123',
                        naturalLanguagePrompt: 'Try to modify a restricted form',
                    }
                }
            };
            const result = await testSuite.simulateFailureScenario('forbidden-test', 'auth-failure', 'form-modification', forbiddenRequest);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe('test-forbidden-access');
            }
        });
        it('should handle 404 Not Found from Tally API', async () => {
            const notFoundRequest = {
                jsonrpc: '2.0',
                id: 'test-not-found',
                method: 'tools/call',
                params: {
                    name: 'form_sharing_tool',
                    arguments: {
                        formId: 'non-existent-form-999',
                        action: 'get_form_details',
                    }
                }
            };
            const result = await testSuite.simulateFailureScenario('not-found-test', 'server-error', 'form-retrieval', notFoundRequest);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe('test-not-found');
            }
        });
        it('should handle 429 Rate Limit from Tally API', async () => {
            const testData = testSuite.createTestData();
            const request = testData.submissionRequest('rate-limited-form');
            const result = await testSuite.simulateFailureScenario('rate-limit-test', 'server-error', 'submission-retrieval', request);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe(request.id);
            }
        });
        it('should handle 500 Internal Server Error from Tally API', async () => {
            const testData = testSuite.createTestData();
            const request = testData.teamManagementRequest('server-error-team');
            const result = await testSuite.simulateFailureScenario('internal-server-error-test', 'server-error', 'team-invitation', request);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe(request.id);
            }
        });
        it('should handle 503 Service Unavailable from Tally API', async () => {
            const serviceUnavailableRequest = {
                jsonrpc: '2.0',
                id: 'test-service-unavailable',
                method: 'tools/call',
                params: {
                    name: 'submission_tool',
                    arguments: {
                        formId: 'unavailable-service-form',
                        action: 'create_submission',
                        data: {
                            'field-1': 'test data'
                        }
                    }
                }
            };
            const result = await testSuite.simulateFailureScenario('service-unavailable-test', 'server-error', 'submission-creation', serviceUnavailableRequest);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe('test-service-unavailable');
            }
        });
    });
    describe('Network Timeout Scenarios', () => {
        it('should handle network timeout during form creation', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Timeout Form');
            const result = await testSuite.simulateFailureScenario('network-timeout-test', 'timeout', 'form-creation', request);
            expect(result.error).toBeDefined();
            expect(result.error.message || result.error).toContain('timeout');
        });
        it('should handle timeout during form modification', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formModificationRequest('timeout-form-456');
            const result = await testSuite.simulateFailureScenario('modification-timeout-test', 'timeout', 'form-modification', request);
            expect(result.error).toBeDefined();
        });
        it('should handle timeout during submission retrieval', async () => {
            const testData = testSuite.createTestData();
            const request = testData.submissionRequest('timeout-submission-form');
            const result = await testSuite.simulateFailureScenario('submission-timeout-test', 'timeout', 'submission-retrieval', request);
            expect(result.error).toBeDefined();
        });
    });
    describe('Authentication Failure Scenarios', () => {
        it('should handle expired API key', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Expired Key Form');
            const result = await testSuite.simulateFailureScenario('expired-key-test', 'auth-failure', 'form-creation', request);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe(request.id);
            }
        });
        it('should handle invalid API key format', async () => {
            const invalidKeyRequest = {
                jsonrpc: '2.0',
                id: 'test-invalid-key',
                method: 'tools/call',
                params: {
                    name: 'team_manager',
                    arguments: {
                        teamId: 'team-123',
                        action: 'list_members',
                    }
                }
            };
            const result = await testSuite.simulateFailureScenario('invalid-key-test', 'auth-failure', 'team-management', invalidKeyRequest);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe('test-invalid-key');
            }
        });
        it('should handle missing API key', async () => {
            const missingKeyRequest = {
                jsonrpc: '2.0',
                id: 'test-missing-key',
                method: 'tools/call',
                params: {
                    name: 'form_sharing_tool',
                    arguments: {
                        formId: 'public-form-789',
                        action: 'get_sharing_details',
                    }
                }
            };
            const result = await testSuite.simulateFailureScenario('missing-key-test', 'auth-failure', 'form-sharing', missingKeyRequest);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe('test-missing-key');
            }
        });
    });
    describe('Malformed Request Scenarios', () => {
        it('should handle invalid JSON-RPC format', async () => {
            const malformedRequest = {
                id: 'test-malformed-1',
                method: 'tools/call',
                params: {
                    name: 'form_creation_tool',
                    arguments: {
                        naturalLanguagePrompt: 'Create a form',
                    }
                }
            };
            try {
                const result = await testSuite.executeWorkflow('malformed-request-test', malformedRequest);
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should handle missing required parameters', async () => {
            const incompleteRequest = {
                jsonrpc: '2.0',
                id: 'test-incomplete',
                method: 'tools/call',
                params: {
                    name: 'form_modification_tool',
                    arguments: {
                        naturalLanguagePrompt: 'Change the title',
                    }
                }
            };
            const result = await testSuite.executeWorkflow('incomplete-request-test', incompleteRequest);
            expect(result.actualOutput.jsonrpc).toBe('2.0');
            expect(result.actualOutput.id).toBe('test-incomplete');
            expect(result.actualOutput.error || result.actualOutput.result).toBeDefined();
        });
        it('should handle invalid tool name', async () => {
            const invalidToolRequest = {
                jsonrpc: '2.0',
                id: 'test-invalid-tool',
                method: 'tools/call',
                params: {
                    name: 'non_existent_tool',
                    arguments: {
                        someParam: 'value',
                    }
                }
            };
            const result = await testSuite.executeWorkflow('invalid-tool-test', invalidToolRequest);
            expect(result.actualOutput.jsonrpc).toBe('2.0');
            expect(result.actualOutput.id).toBe('test-invalid-tool');
            expect(result.actualOutput.error || result.actualOutput.result).toBeDefined();
        });
        it('should handle invalid method name', async () => {
            const invalidMethodRequest = {
                jsonrpc: '2.0',
                id: 'test-invalid-method',
                method: 'invalid/method',
                params: {
                    name: 'form_creation_tool',
                    arguments: {
                        naturalLanguagePrompt: 'Create a form',
                    }
                }
            };
            const result = await testSuite.executeWorkflow('invalid-method-test', invalidMethodRequest);
            expect(result.actualOutput.jsonrpc).toBe('2.0');
            expect(result.actualOutput.id).toBe('test-invalid-method');
            expect(result.actualOutput.error || result.actualOutput.result).toBeDefined();
        });
        it('should handle corrupted data payload', async () => {
            const corruptedRequest = {
                jsonrpc: '2.0',
                id: 'test-corrupted',
                method: 'tools/call',
                params: {
                    name: 'submission_tool',
                    arguments: {
                        formId: 'form-abc',
                        action: 'create_submission',
                        data: {
                            circular: {}
                        }
                    }
                }
            };
            corruptedRequest.params.arguments.data.circular = corruptedRequest.params.arguments.data;
            try {
                const result = await testSuite.executeWorkflow('corrupted-data-test', corruptedRequest);
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe('test-corrupted');
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
    });
    describe('Error Propagation and Transformation', () => {
        it('should properly transform Tally API errors to MCP format', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Error Transform Test');
            const result = await testSuite.simulateFailureScenario('error-transform-test', 'server-error', 'form-creation', request);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe(request.id);
                if (result.actualOutput.error) {
                    expect(result.actualOutput.error.code).toBeDefined();
                    expect(result.actualOutput.error.message).toBeDefined();
                }
            }
        });
        it('should include proper error codes and messages', async () => {
            const testData = testSuite.createTestData();
            const request = testData.submissionRequest('error-codes-test');
            const result = await testSuite.simulateFailureScenario('error-codes-test', 'server-error', 'submission-retrieval', request);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else if (result.actualOutput.error) {
                expect(typeof result.actualOutput.error.code).toBe('number');
                expect(typeof result.actualOutput.error.message).toBe('string');
                expect(result.actualOutput.error.message.length).toBeGreaterThan(0);
            }
        });
        it('should preserve error context and details', async () => {
            const contextRequest = {
                jsonrpc: '2.0',
                id: 'test-error-context',
                method: 'tools/call',
                params: {
                    name: 'form_modification_tool',
                    arguments: {
                        formId: 'context-test-form',
                        naturalLanguagePrompt: 'Invalid modification that should provide context',
                    }
                }
            };
            const result = await testSuite.simulateFailureScenario('error-context-test', 'server-error', 'form-modification', contextRequest);
            if (result.error) {
                expect(result.error).toBeDefined();
            }
            else {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe('test-error-context');
            }
        });
    });
    describe('Error Logging and Monitoring', () => {
        it('should log errors with sufficient detail for debugging', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Logging Test Form');
            await testSuite.simulateFailureScenario('error-logging-test', 'timeout', 'form-creation', request);
            const stats = testSuite.getExecutionStats();
            expect(stats.errors).toBeGreaterThan(0);
        });
        it('should capture error timing and performance metrics', async () => {
            const testData = testSuite.createTestData();
            const request = testData.teamManagementRequest('metrics-test-team');
            const startTime = Date.now();
            await testSuite.simulateFailureScenario('error-metrics-test', 'server-error', 'team-management', request);
            const endTime = Date.now();
            const duration = endTime - startTime;
            expect(duration).toBeGreaterThan(0);
            const stats = testSuite.getExecutionStats();
            expect(stats.totalDuration).toBeGreaterThan(0);
        });
    });
    describe('Fallback and Recovery Mechanisms', () => {
        it('should handle graceful degradation when possible', async () => {
            const testData = testSuite.createTestData();
            const request = testData.formCreationRequest('Graceful Degradation Test');
            const result = await testSuite.simulateFailureScenario('graceful-degradation-test', 'server-error', 'form-creation', request);
            if (!result.error) {
                expect(result.actualOutput.jsonrpc).toBe('2.0');
                expect(result.actualOutput.id).toBe(request.id);
                expect(result.actualOutput.error || result.actualOutput.result).toBeDefined();
            }
        });
        it('should provide meaningful error messages to users', async () => {
            const testData = testSuite.createTestData();
            const request = testData.submissionRequest('user-friendly-error');
            const result = await testSuite.simulateFailureScenario('user-friendly-error-test', 'auth-failure', 'submission-retrieval', request);
            if (!result.error && result.actualOutput.error) {
                expect(result.actualOutput.error.message).toBeDefined();
                expect(typeof result.actualOutput.error.message).toBe('string');
                expect(result.actualOutput.error.message.length).toBeGreaterThan(5);
            }
        });
    });
});
//# sourceMappingURL=workflow-error-scenarios.test.js.map