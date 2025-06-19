import { SecurityTest, SecurityTestCategory } from '../../types';
export declare class InputValidationTests implements SecurityTestCategory {
    name: string;
    description: string;
    enabled: boolean;
    tests: SecurityTest[];
    private target;
    constructor(target: {
        baseUrl: string;
    });
}
//# sourceMappingURL=InputValidationTests.d.ts.map