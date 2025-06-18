import axios from 'axios';
export class APISecurityTests {
    constructor(target) {
        this.name = 'API Security';
        this.description = 'Tests for general API security';
        this.enabled = true;
        this.target = target;
        this.tests = [
            {
                id: 'API-001',
                name: 'Rate Limiting',
                description: 'Tests for rate limiting on API endpoints.',
                category: 'API Security',
                severity: 'high',
                tags: ['api', 'rate-limiting'],
                execute: async () => {
                    const startTime = Date.now();
                    try {
                        const requests = [];
                        for (let i = 0; i < 150; i++) {
                            requests.push(axios.post(`${this.target.baseUrl}/mcp`, {
                                jsonrpc: '2.0',
                                method: 'health_check',
                                id: i + 1
                            }));
                        }
                        await Promise.all(requests);
                        throw new Error('Rate limiting is not enforced. All 150 requests succeeded.');
                    }
                    catch (error) {
                        if (axios.isAxiosError(error) && error.response?.status === 429) {
                            return {
                                id: 'API-001',
                                name: 'Rate Limiting',
                                suite: 'custom',
                                status: 'passed',
                                severity: 'high',
                                description: 'Rate limiting is enforced correctly, received a 429 response.',
                                duration: Date.now() - startTime,
                                timestamp: new Date(),
                                metadata: { category: 'API Security', tags: ['api', 'rate-limiting'] }
                            };
                        }
                        return {
                            id: 'API-001',
                            name: 'Rate Limiting',
                            suite: 'custom',
                            status: 'failed',
                            severity: 'high',
                            description: `Rate limiting test failed unexpectedly. Expected a 429 response, but got: ${error.message}`,
                            duration: Date.now() - startTime,
                            timestamp: new Date(),
                            metadata: { category: 'API Security', tags: ['api', 'rate-limiting'] }
                        };
                    }
                },
            },
        ];
    }
}
//# sourceMappingURL=APISecurityTests.js.map