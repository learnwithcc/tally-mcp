import { SecurityTest, SecurityTestCategory } from '../../types';
export declare class AuthorizationTests implements SecurityTestCategory {
    name: string;
    description: string;
    enabled: boolean;
    tests: SecurityTest[];
    private target;
    constructor(target: {
        baseUrl: string;
    });
}
//# sourceMappingURL=AuthorizationTests.d.ts.map