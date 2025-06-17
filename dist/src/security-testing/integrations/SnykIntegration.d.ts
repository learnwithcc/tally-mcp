import { SecurityTestResult, SecurityTestIntegration, SnykConfig, SecurityScanOptions } from '../types';
export declare class SnykIntegration implements SecurityTestIntegration {
    readonly name = "Snyk";
    readonly version = "1.1295.0";
    configValid: boolean;
    private logger;
    private config;
    private projectPath;
    constructor(config: SnykConfig);
    initialize(): Promise<void>;
    checkAvailability(): Promise<boolean>;
    runScan(_options?: SecurityScanOptions): Promise<SecurityTestResult[]>;
    runAll(): Promise<SecurityTestResult[]>;
    runTest(testId: string): Promise<SecurityTestResult>;
    cleanup(): Promise<void>;
    private checkSnykCLI;
    private authenticate;
    private runScanType;
    private executeScan;
    private buildScanArgs;
    private parseScanOutput;
    private convertVulnerabilityToResult;
    private mapSnykSeverityToFramework;
    private formatVulnerabilityDetails;
    private getRemediation;
}
//# sourceMappingURL=SnykIntegration.d.ts.map