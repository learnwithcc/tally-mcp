import { SecurityTest, SecurityTestCategory } from '../../types';
export declare class DataProtectionTests implements SecurityTestCategory {
    name: string;
    description: string;
    enabled: boolean;
    tests: SecurityTest[];
    private target;
    constructor(target: {
        baseUrl: string;
    });
}
//# sourceMappingURL=DataProtectionTests.d.ts.map