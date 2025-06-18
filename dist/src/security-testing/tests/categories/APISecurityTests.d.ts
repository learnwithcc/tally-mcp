import { SecurityTest, SecurityTestCategory } from '../../types';
export declare class APISecurityTests implements SecurityTestCategory {
    name: string;
    description: string;
    enabled: boolean;
    tests: SecurityTest[];
    private target;
    constructor(target: {
        baseUrl: string;
    });
}
//# sourceMappingURL=APISecurityTests.d.ts.map