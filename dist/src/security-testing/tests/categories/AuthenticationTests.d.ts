import { SecurityTest, SecurityTestCategory } from '../../types';
export declare class AuthenticationTests implements SecurityTestCategory {
    name: string;
    description: string;
    enabled: boolean;
    tests: SecurityTest[];
    private target;
    constructor(target: {
        baseUrl: string;
    });
}
//# sourceMappingURL=AuthenticationTests.d.ts.map