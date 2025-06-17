export class InputValidationTests {
    constructor() {
        this.name = 'Input Validation';
        this.description = 'Tests for input validation';
        this.enabled = true;
        this.tests = [
            {
                id: 'INP-001',
                name: 'SQL Injection',
                description: 'Tests for SQL injection vulnerabilities.',
                category: 'Input Validation',
                severity: 'critical',
                tags: ['api', 'sqli'],
                execute: async () => {
                    return {
                        id: 'INP-001',
                        name: 'SQL Injection',
                        suite: 'custom',
                        status: 'skipped',
                        severity: 'critical',
                        description: 'This test is not yet implemented.',
                        duration: 0,
                        timestamp: new Date(),
                        metadata: {
                            category: 'Input Validation',
                            tags: ['api', 'sqli'],
                        }
                    };
                },
            },
        ];
    }
}
//# sourceMappingURL=InputValidationTests.js.map