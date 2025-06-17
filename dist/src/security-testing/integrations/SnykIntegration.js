import { spawn } from 'child_process';
import { Logger } from '../../utils/logger';
export class SnykIntegration {
    constructor(config) {
        this.name = 'Snyk';
        this.version = '1.1295.0';
        this.configValid = false;
        this.config = config;
        this.logger = new Logger({ component: 'SnykIntegration' });
        this.projectPath = config.projectPath || process.cwd();
    }
    async initialize() {
        this.logger.info('Initializing Snyk integration');
        if (!this.config.enabled) {
            this.logger.info('Snyk integration disabled');
            return;
        }
        try {
            const isAvailable = await this.checkSnykCLI();
            if (!isAvailable) {
                throw new Error('Snyk CLI not found. Please install Snyk CLI.');
            }
            if (this.config.token) {
                await this.authenticate();
            }
            this.configValid = true;
            this.logger.info('Snyk integration initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Snyk integration', error);
            throw error;
        }
    }
    async checkAvailability() {
        try {
            if (!this.config.enabled) {
                return false;
            }
            return await this.checkSnykCLI();
        }
        catch (error) {
            this.logger.error('Error checking Snyk availability', error);
            return false;
        }
    }
    async runScan(options) {
        this.logger.info('Starting Snyk vulnerability scan');
        if (!this.configValid) {
            throw new Error('Snyk integration not properly initialized');
        }
        const results = [];
        const scanTypes = this.config.scanTypes || ['dependencies', 'code'];
        try {
            for (const scanType of scanTypes) {
                const scanResults = await this.runScanType(scanType);
                results.push(...scanResults);
            }
            this.logger.info(`Snyk scan completed. Found ${results.length} vulnerabilities`);
            return results;
        }
        catch (error) {
            this.logger.error('Snyk scan failed', error);
            throw error;
        }
    }
    async runAll() {
        return await this.runScan();
    }
    async runTest(testId) {
        const results = await this.runAll();
        const result = results.find(r => r.id === testId);
        if (!result) {
            throw new Error(`Test ${testId} not found`);
        }
        return result;
    }
    async cleanup() {
        this.logger.info('Cleaning up Snyk integration');
    }
    async checkSnykCLI() {
        return new Promise((resolve) => {
            const snykProcess = spawn('snyk', ['--version'], { stdio: 'pipe' });
            snykProcess.on('exit', (code) => {
                resolve(code === 0);
            });
            snykProcess.on('error', () => {
                resolve(false);
            });
        });
    }
    async authenticate() {
        this.logger.info('Authenticating with Snyk');
        return new Promise((resolve, reject) => {
            const authProcess = spawn('snyk', ['auth', this.config.token], {
                stdio: 'pipe',
                cwd: this.projectPath
            });
            authProcess.on('exit', (code) => {
                if (code === 0) {
                    this.logger.info('Snyk authentication successful');
                    resolve();
                }
                else {
                    reject(new Error(`Snyk authentication failed with code ${code}`));
                }
            });
            authProcess.on('error', (error) => {
                reject(error);
            });
        });
    }
    async runScanType(scanType) {
        this.logger.info(`Running Snyk ${scanType} scan`);
        const startTime = Date.now();
        const results = [];
        try {
            const scanOutput = await this.executeScan(scanType);
            const vulnerabilities = this.parseScanOutput(scanOutput, scanType);
            for (const vuln of vulnerabilities) {
                results.push(this.convertVulnerabilityToResult(vuln, scanType, startTime));
            }
            return results;
        }
        catch (error) {
            this.logger.error(`Snyk ${scanType} scan failed`, error);
            throw error;
        }
    }
    async executeScan(scanType) {
        const args = this.buildScanArgs(scanType);
        return new Promise((resolve, reject) => {
            const scanProcess = spawn('snyk', args, {
                stdio: 'pipe',
                cwd: this.projectPath
            });
            let stdout = '';
            let stderr = '';
            scanProcess.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            scanProcess.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            scanProcess.on('exit', (code) => {
                if (code === 0 || code === 1) {
                    resolve(stdout);
                }
                else {
                    reject(new Error(`Snyk scan failed: ${stderr}`));
                }
            });
            scanProcess.on('error', (error) => {
                reject(error);
            });
        });
    }
    buildScanArgs(scanType) {
        const args = [];
        switch (scanType) {
            case 'dependencies':
                args.push('test');
                break;
            case 'code':
                args.push('code', 'test');
                break;
            case 'container':
                args.push('container', 'test');
                break;
            case 'iac':
                args.push('iac', 'test');
                break;
            default:
                args.push('test');
        }
        args.push('--json');
        if (this.config.orgId) {
            args.push('--org', this.config.orgId);
        }
        if (this.config.severity && this.config.severity.length > 0) {
            args.push('--severity-threshold', this.config.severity[0]);
        }
        return args;
    }
    parseScanOutput(output, scanType) {
        try {
            const jsonOutput = JSON.parse(output);
            if (scanType === 'code') {
                return jsonOutput.runs?.[0]?.results || [];
            }
            else {
                return jsonOutput.vulnerabilities || [];
            }
        }
        catch (error) {
            this.logger.error('Failed to parse Snyk output', error);
            return [];
        }
    }
    convertVulnerabilityToResult(vuln, scanType, startTime) {
        const severity = this.mapSnykSeverityToFramework(vuln.severity);
        const isCodeScan = scanType === 'code';
        return {
            id: `snyk-${scanType}-${vuln.id || vuln.ruleId}`,
            name: isCodeScan ? vuln.message?.text : vuln.title,
            suite: 'snyk',
            status: 'failed',
            severity,
            description: isCodeScan ? vuln.message?.text : vuln.description,
            details: this.formatVulnerabilityDetails(vuln, isCodeScan),
            evidence: {
                type: 'file',
                content: JSON.stringify(vuln, null, 2),
                encoding: 'utf8',
                mimeType: 'application/json'
            },
            remediation: this.getRemediation(vuln, isCodeScan),
            duration: Date.now() - startTime,
            timestamp: new Date(),
            metadata: {
                scanType,
                packageName: vuln.packageName,
                version: vuln.version,
                cve: vuln.identifiers?.CVE || vuln.cve,
                cwe: vuln.identifiers?.CWE || vuln.cwe,
                cvssScore: vuln.cvssScore,
                ruleId: vuln.ruleId,
                exploitMaturity: vuln.exploitMaturity
            }
        };
    }
    mapSnykSeverityToFramework(severity) {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'critical';
            case 'high':
                return 'high';
            case 'medium':
                return 'medium';
            case 'low':
                return 'low';
            default:
                return 'medium';
        }
    }
    formatVulnerabilityDetails(vuln, isCodeScan) {
        if (isCodeScan) {
            return `${vuln.message?.text}\n\nLocation: ${vuln.locations?.[0]?.physicalLocation?.artifactLocation?.uri}:${vuln.locations?.[0]?.physicalLocation?.region?.startLine}`;
        }
        else {
            return `${vuln.description}\n\nPackage: ${vuln.packageName}@${vuln.version}\nIntroduced through: ${vuln.from?.join(' → ')}`;
        }
    }
    getRemediation(vuln, isCodeScan) {
        if (isCodeScan) {
            return vuln.help?.text || 'Review the code and apply security best practices';
        }
        else {
            return vuln.remediation?.upgrade || vuln.remediation?.patch || 'Update to a non-vulnerable version';
        }
    }
}
//# sourceMappingURL=SnykIntegration.js.map