import { apiKeyService } from '../../../services/api-key-service';
import axios from 'axios';
import { ApiKeyScope } from '../../../models/api-key';
export class AuthenticationTests {
    constructor(target) {
        this.name = 'Authentication';
        this.description = 'Tests for authentication mechanisms';
        this.enabled = true;
        this.target = target;
        this.tests = [
            {
                id: 'AUTHN-001',
                name: 'Valid API Key',
                description: 'Ensures that a valid API key provides access to protected resources.',
                category: 'Authentication',
                severity: 'critical',
                tags: ['api', 'authn'],
                execute: async () => {
                    const startTime = Date.now();
                    try {
                        const apiKey = await apiKeyService.createApiKey({
                            name: 'test-key-valid',
                            scopes: [ApiKeyScope.ADMIN],
                        });
                        const response = await axios.post(`${this.target.baseUrl}/mcp`, {
                            jsonrpc: '2.0',
                            method: 'list_tools',
                            id: '1',
                        }, {
                            headers: { 'x-api-key': apiKey.key },
                        });
                        if (response.status === 200) {
                            return {
                                id: 'AUTHN-001',
                                name: 'Valid API Key',
                                suite: 'custom',
                                status: 'passed',
                                severity: 'critical',
                                description: 'Successfully accessed a protected endpoint with a valid API key.',
                                duration: Date.now() - startTime,
                                timestamp: new Date(),
                                metadata: {
                                    category: 'Authentication',
                                    tags: ['api', 'authn'],
                                }
                            };
                        }
                        throw new Error(`Expected status 200, but got ${response.status}`);
                    }
                    catch (error) {
                        return {
                            id: 'AUTHN-001',
                            name: 'Valid API Key',
                            suite: 'custom',
                            status: 'failed',
                            severity: 'critical',
                            description: `Failed to access protected endpoint with a valid key: ${error.message}`,
                            duration: Date.now() - startTime,
                            timestamp: new Date(),
                            metadata: {
                                category: 'Authentication',
                                tags: ['api', 'authn'],
                            }
                        };
                    }
                },
            },
            {
                id: 'AUTHN-002',
                name: 'Invalid API Key',
                description: 'Ensures that an invalid API key is rejected.',
                category: 'Authentication',
                severity: 'critical',
                tags: ['api', 'authn'],
                execute: async () => {
                    const startTime = Date.now();
                    try {
                        await axios.post(`${this.target.baseUrl}/mcp`, {
                            jsonrpc: '2.0',
                            method: 'list_tools',
                            id: '1',
                        }, {
                            headers: { 'x-api-key': 'invalid-api-key' },
                        });
                        throw new Error('Request succeeded with an invalid API key.');
                    }
                    catch (error) {
                        if (error.response && error.response.status === 401) {
                            return {
                                id: 'AUTHN-002',
                                name: 'Invalid API Key',
                                suite: 'custom',
                                status: 'passed',
                                severity: 'critical',
                                description: 'Correctly rejected a request with an invalid API key.',
                                duration: Date.now() - startTime,
                                timestamp: new Date(),
                                metadata: {
                                    category: 'Authentication',
                                    tags: ['api', 'authn'],
                                }
                            };
                        }
                        return {
                            id: 'AUTHN-002',
                            name: 'Invalid API Key',
                            suite: 'custom',
                            status: 'failed',
                            severity: 'critical',
                            description: `Request with invalid key did not fail as expected: ${error.message}`,
                            duration: Date.now() - startTime,
                            timestamp: new Date(),
                            metadata: {
                                category: 'Authentication',
                                tags: ['api', 'authn'],
                            }
                        };
                    }
                }
            },
            {
                id: 'AUTHN-003',
                name: 'Expired API Key',
                description: 'Ensures that an expired API key is rejected.',
                category: 'Authentication',
                severity: 'critical',
                tags: ['api', 'authn', 'expiration'],
                execute: async () => {
                    const startTime = Date.now();
                    try {
                        const apiKey = await apiKeyService.createApiKey({
                            name: 'test-key-expired',
                            scopes: [ApiKeyScope.ADMIN],
                            expiresAt: new Date(Date.now() - 1000),
                        });
                        await axios.post(`${this.target.baseUrl}/mcp`, {
                            jsonrpc: '2.0',
                            method: 'list_tools',
                            id: '1',
                        }, {
                            headers: { 'x-api-key': apiKey.key },
                        });
                        throw new Error('Request succeeded with an expired API key.');
                    }
                    catch (error) {
                        if (error.response && error.response.status === 401) {
                            return {
                                id: 'AUTHN-003',
                                name: 'Expired API Key',
                                suite: 'custom',
                                status: 'passed',
                                severity: 'critical',
                                description: 'Correctly rejected a request with an expired API key.',
                                duration: Date.now() - startTime,
                                timestamp: new Date(),
                                metadata: {
                                    category: 'Authentication',
                                    tags: ['api', 'authn', 'expiration'],
                                }
                            };
                        }
                        return {
                            id: 'AUTHN-003',
                            name: 'Expired API Key',
                            suite: 'custom',
                            status: 'failed',
                            severity: 'critical',
                            description: `Request with expired key did not fail as expected: ${error.message}`,
                            duration: Date.now() - startTime,
                            timestamp: new Date(),
                            metadata: {
                                category: 'Authentication',
                                tags: ['api', 'authn', 'expiration'],
                            }
                        };
                    }
                }
            }
        ];
    }
}
//# sourceMappingURL=AuthenticationTests.js.map