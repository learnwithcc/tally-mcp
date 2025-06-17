import { SecurityTestResult, SecurityTestIntegration, OWASPZAPConfig, SecurityScanOptions } from '../types';
export declare class OWASPZAPIntegration implements SecurityTestIntegration {
    readonly name = "OWASP ZAP";
    readonly version = "2.14.0";
    configValid: boolean;
    private logger;
    private config;
    private zapProcess;
    private zapClient?;
    private baseUrl;
    constructor(config: OWASPZAPConfig);
    initialize(): Promise<void>;
    checkAvailability(): Promise<boolean>;
    runScan(options?: SecurityScanOptions): Promise<SecurityTestResult[]>;
    runAll(): Promise<SecurityTestResult[]>;
    runTest(testId: string): Promise<SecurityTestResult>;
    cleanup(): Promise<void>;
    private checkZAPRunning;
    private canStartZAP;
    private startZAP;
    private waitForZAPReady;
    private runSpiderScan;
    private runPassiveScan;
    private runActiveScan;
    private getAlerts;
    private convertAlertToResult;
    private mapZAPRiskToSeverity;
    private getDefaultTarget;
}
//# sourceMappingURL=OWASPZAPIntegration.d.ts.map