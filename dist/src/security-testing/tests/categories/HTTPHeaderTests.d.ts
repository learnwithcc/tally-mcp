import { SecurityTest, SecurityTestCategory } from '../../types';
export declare class HTTPHeaderTests implements SecurityTestCategory {
    name: string;
    description: string;
    enabled: boolean;
    tests: SecurityTest[];
    private target;
    constructor(target: {
        baseUrl: string;
    });
}
//# sourceMappingURL=HTTPHeaderTests.d.ts.map