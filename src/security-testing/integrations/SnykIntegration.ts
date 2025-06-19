/**
 * Snyk Integration
 * 
 * Integrates with Snyk for vulnerability scanning of dependencies and code
 */

import { spawn } from 'child_process';
// import { promises as fs } from 'fs';
// import path from 'path';
import { Logger } from '../../utils/logger';
import { 
  SecurityTestResult, 
  SecurityTestIntegration, 
  SnykConfig, 
  SecurityScanOptions,
  SecurityTestSeverity
} from '../types';

export class SnykIntegration implements SecurityTestIntegration {
  public readonly name = 'Snyk';
  public readonly version = '1.1295.0';
  public configValid = false;

  private logger: Logger;
  private config: SnykConfig;
  private projectPath: string;

  constructor(config: SnykConfig) {
    this.config = config;
    this.logger = new Logger({ component: 'SnykIntegration' });
    this.projectPath = config.projectPath || process.cwd();
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Snyk integration');

    if (!this.config.enabled) {
      this.logger.info('Snyk integration disabled');
      return;
    }

    try {
      // Check if Snyk CLI is available
      const isAvailable = await this.checkSnykCLI();
      if (!isAvailable) {
        throw new Error('Snyk CLI not found. Please install Snyk CLI.');
      }

      // Authenticate if token is provided
      if (this.config.token) {
        await this.authenticate();
      }

      this.configValid = true;
      this.logger.info('Snyk integration initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Snyk integration', undefined, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async checkAvailability(): Promise<boolean> {
    try {
      if (!this.config.enabled) {
        return false;
      }

      return await this.checkSnykCLI();
    } catch (error) {
      this.logger.error('Error checking Snyk availability', undefined, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  async runScan(_options?: SecurityScanOptions): Promise<SecurityTestResult[]> {
    this.logger.info('Starting Snyk vulnerability scan');

    if (!this.configValid) {
      throw new Error('Snyk integration not properly initialized');
    }

    const results: SecurityTestResult[] = [];
    const scanTypes = this.config.scanTypes || ['dependencies', 'code'];

    try {
      for (const scanType of scanTypes) {
        const scanResults = await this.runScanType(scanType);
        results.push(...scanResults);
      }

      this.logger.info(`Snyk scan completed. Found ${results.length} vulnerabilities`);
      return results;
    } catch (error) {
      this.logger.error('Snyk scan failed', undefined, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async runAll(): Promise<SecurityTestResult[]> {
    return await this.runScan();
  }

  async runTest(testId: string): Promise<SecurityTestResult> {
    // Snyk doesn't support individual test execution
    const results = await this.runAll();
    const result = results.find(r => r.id === testId);
    
    if (!result) {
      throw new Error(`Test ${testId} not found`);
    }

    return result;
  }

  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up Snyk integration');
    // Snyk doesn't require cleanup
  }

  private async checkSnykCLI(): Promise<boolean> {
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

  private async authenticate(): Promise<void> {
    this.logger.info('Authenticating with Snyk');

    return new Promise((resolve, reject) => {
      const authProcess = spawn('snyk', ['auth', this.config.token!], {
        stdio: 'pipe',
        cwd: this.projectPath
      });

      authProcess.on('exit', (code) => {
        if (code === 0) {
          this.logger.info('Snyk authentication successful');
          resolve();
        } else {
          reject(new Error(`Snyk authentication failed with code ${code}`));
        }
      });

      authProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async runScanType(scanType: string): Promise<SecurityTestResult[]> {
    this.logger.info(`Running Snyk ${scanType} scan`);

    const startTime = Date.now();
    const results: SecurityTestResult[] = [];

    try {
      const scanOutput = await this.executeScan(scanType);
      const vulnerabilities = this.parseScanOutput(scanOutput, scanType);

      for (const vuln of vulnerabilities) {
        results.push(this.convertVulnerabilityToResult(vuln, scanType, startTime));
      }

      return results;
    } catch (error) {
      this.logger.error(`Snyk ${scanType} scan failed`, undefined, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private async executeScan(scanType: string): Promise<string> {
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
        // Snyk returns 1 when vulnerabilities are found, which is expected
        if (code === 0 || code === 1) {
          resolve(stdout);
        } else {
          reject(new Error(`Snyk scan failed: ${stderr}`));
        }
      });

      scanProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  private buildScanArgs(scanType: string): string[] {
    const args: string[] = [];

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

    // Add common options
    args.push('--json');

    if (this.config.orgId) {
      args.push('--org', this.config.orgId);
    }

    if (this.config.severity && this.config.severity.length > 0) {
      args.push('--severity-threshold', this.config.severity[0]!);
    }

    return args;
  }

  private parseScanOutput(output: string, scanType: string): any[] {
    try {
      const jsonOutput = JSON.parse(output);

      if (scanType === 'dependencies') {
        if (Array.isArray(jsonOutput)) {
          return jsonOutput.flatMap(result => result.vulnerabilities || []);
        }
        return jsonOutput.vulnerabilities || [];
      }
      
      if (scanType === 'code' && jsonOutput.runs?.[0]?.results) {
        return jsonOutput.runs[0].results;
      }

      return [];
    } catch (error) {
      this.logger.error('Failed to parse Snyk output', undefined, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private convertVulnerabilityToResult(vuln: any, scanType: string, startTime: number): SecurityTestResult {
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

  private mapSnykSeverityToFramework(severity: string): SecurityTestSeverity {
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

  private formatVulnerabilityDetails(vuln: any, isCodeScan: boolean): string {
    if (isCodeScan) {
      return `${vuln.message?.text}\n\nLocation: ${vuln.locations?.[0]?.physicalLocation?.artifactLocation?.uri}:${vuln.locations?.[0]?.physicalLocation?.region?.startLine}`;
    } else {
      return `${vuln.description}\n\nPackage: ${vuln.packageName}@${vuln.version}\nIntroduced through: ${vuln.from?.join(' → ')}`;
    }
  }

  private getRemediation(vuln: any, isCodeScan: boolean): string {
    if (isCodeScan) {
      return vuln.help?.text || 'Review the code and apply security best practices';
    } else {
      return vuln.remediation?.upgrade || vuln.remediation?.patch || 'Update to a non-vulnerable version';
    }
  }
} 