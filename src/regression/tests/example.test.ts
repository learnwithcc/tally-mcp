import { RegressionTestCase, Severity } from '../types';

export const exampleRegressionTest: RegressionTestCase = {
    id: 'EXAMPLE-001',
    description: 'This is an example regression test.',
    severity: Severity.LOW,
    component: 'Example',
    reproductionSteps: [
        'Step 1: Do something.',
        'Step 2: Do something else.',
    ],
    expectedBehavior: 'Something should happen.',
    test: async () => {
        // This is where the actual test logic would go.
        // For this example, we'll just simulate a passing test.
        console.log('Running example regression test...');
        if (false) { // Simulate a failure condition
            throw new Error('Example test failed!');
        }
    },
}; 