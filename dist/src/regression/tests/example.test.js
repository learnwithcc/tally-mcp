import { Severity } from '../types';
export const exampleRegressionTest = {
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
        console.log('Running example regression test...');
        if (false) {
            throw new Error('Example test failed!');
        }
    },
};
//# sourceMappingURL=example.test.js.map