import axios from 'axios';
import { apiKeyService } from '../../../services/api-key-service';
import { ApiKeyScope } from '../../../models/api-key';
export class InputValidationTests {
    constructor(target) {
        this.name = 'Input Validation';
        this.description = 'Tests for input validation';
        this.enabled = true;
        this.target = target;
        this.tests = [
            {
                id: 'INP-001',
                name: 'SQL Injection',
                description: 'Tests for SQL injection vulnerabilities in form creation.',
                category: 'Input Validation',
                severity: 'critical',
                tags: ['api', 'sqli'],
                execute: async () => {
                    const startTime = Date.now();
                    const payload = "'; SELECT * FROM users; --";
                    try {
                        const apiKey = await apiKeyService.createApiKey({
                            name: 'test-key-sqli',
                            scopes: [ApiKeyScope.ADMIN],
                        });
                        await axios.post(`${this.target.baseUrl}/mcp`, {
                            jsonrpc: '2.0',
                            method: 'form_creation_tool',
                            params: { formTitle: `test ${payload}` },
                            id: '1',
                        }, { headers: { 'x-api-key': apiKey.key } });
                        throw new Error('Server accepted a request with a SQL injection payload.');
                    }
                    catch (error) {
                        if (error.response && (error.response.status === 400 || error.response.status === 422)) {
                            return {
                                id: 'INP-001',
                                name: 'SQL Injection',
                                suite: 'custom',
                                status: 'passed',
                                severity: 'critical',
                                description: 'Correctly rejected a request with a SQL injection payload.',
                                duration: Date.now() - startTime,
                                timestamp: new Date(),
                                metadata: { category: 'Input Validation', tags: ['api', 'sqli'] }
                            };
                        }
                        return {
                            id: 'INP-001',
                            name: 'SQL Injection',
                            suite: 'custom',
                            status: 'failed',
                            severity: 'critical',
                            description: `Request with SQLi payload did not fail as expected: ${error.message}`,
                            duration: Date.now() - startTime,
                            timestamp: new Date(),
                            metadata: { category: 'Input Validation', tags: ['api', 'sqli'] }
                        };
                    }
                },
            },
            {
                id: 'INP-002',
                name: 'Cross-Site Scripting (XSS)',
                description: 'Tests for XSS vulnerabilities.',
                category: 'Input Validation',
                severity: 'high',
                tags: ['api', 'xss'],
                execute: async () => {
                    const startTime = Date.now();
                    const payload = '<script>alert("XSS")</script>';
                    try {
                        const apiKey = await apiKeyService.createApiKey({
                            name: 'test-key-xss',
                            scopes: [ApiKeyScope.ADMIN],
                        });
                        await axios.post(`${this.target.baseUrl}/mcp`, {
                            jsonrpc: '2.0',
                            method: 'form_creation_tool',
                            params: { formTitle: `test ${payload}` },
                            id: '1',
                        }, { headers: { 'x-api-key': apiKey.key } });
                        throw new Error('Server accepted a request with an XSS payload.');
                    }
                    catch (error) {
                        if (error.response && (error.response.status === 400 || error.response.status === 422)) {
                            return {
                                id: 'INP-002',
                                name: 'Cross-Site Scripting (XSS)',
                                suite: 'custom',
                                status: 'passed',
                                severity: 'high',
                                description: 'Correctly rejected a request with an XSS payload.',
                                duration: Date.now() - startTime,
                                timestamp: new Date(),
                                metadata: { category: 'Input Validation', tags: ['api', 'xss'] }
                            };
                        }
                        return {
                            id: 'INP-002',
                            name: 'Cross-Site Scripting (XSS)',
                            suite: 'custom',
                            status: 'failed',
                            severity: 'high',
                            description: `Request with XSS payload did not fail as expected: ${error.message}`,
                            duration: Date.now() - startTime,
                            timestamp: new Date(),
                            metadata: { category: 'Input Validation', tags: ['api', 'xss'] }
                        };
                    }
                },
            },
        ];
    }
}
//# sourceMappingURL=InputValidationTests.js.map