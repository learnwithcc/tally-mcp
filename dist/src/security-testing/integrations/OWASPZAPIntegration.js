import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import axios from 'axios';
import { Logger } from '../../utils/logger';
export class OWASPZAPIntegration {
    constructor(config) {
        this.name = 'OWASP ZAP';
        this.version = '2.14.0';
        this.configValid = false;
        this.config = config;
        this.logger = new Logger({ component: 'OWASPZAPIntegration' });
        this.baseUrl = `http://${config.host || 'localhost'}:${config.port || 8080}`;
    }
    async initialize() {
        this.logger.info('Initializing OWASP ZAP integration');
        if (!this.config.enabled) {
            this.logger.info('OWASP ZAP integration disabled');
            return;
        }
        try {
            const isRunning = await this.checkZAPRunning();
            if (!isRunning) {
                await this.startZAP();
            }
            this.zapClient = axios.create({
                baseURL: this.baseUrl,
                timeout: 30000,
                headers: {
                    'X-ZAP-API-Key': this.config.apiKey || ''
                }
            });
            await this.waitForZAPReady();
            this.configValid = true;
            this.logger.info('OWASP ZAP integration initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize OWASP ZAP integration', error);
            throw error;
        }
    }
    async checkAvailability() {
        try {
            if (!this.config.enabled) {
                return false;
            }
            if (this.config.zapPath) {
                try {
                    await fs.access(this.config.zapPath);
                }
                catch {
                    this.logger.warn(`ZAP binary not found at ${this.config.zapPath}`);
                    return false;
                }
            }
            return await this.checkZAPRunning() || await this.canStartZAP();
        }
        catch (error) {
            this.logger.error('Error checking OWASP ZAP availability', error);
            return false;
        }
    }
    async runScan(options) {
        this.logger.info('Starting OWASP ZAP security scan');
        if (!this.zapClient) {
            throw new Error('OWASP ZAP not initialized');
        }
        const scanOptions = {
            targetUrl: options?.targetUrl || this.getDefaultTarget(),
            scanType: options?.scanType || 'baseline',
            maxTime: options?.maxTime || this.config.maxScanTime || 300000,
            ...options
        };
        const results = [];
        const startTime = Date.now();
        try {
            if (scanOptions.scanType !== 'passive') {
                await this.runSpiderScan(scanOptions.targetUrl);
            }
            await this.runPassiveScan();
            if (scanOptions.scanType === 'active') {
                await this.runActiveScan(scanOptions.targetUrl);
            }
            const alerts = await this.getAlerts();
            for (const alert of alerts) {
                results.push(this.convertAlertToResult(alert, startTime));
            }
            this.logger.info(`OWASP ZAP scan completed. Found ${results.length} security issues`);
            return results;
        }
        catch (error) {
            this.logger.error('OWASP ZAP scan failed', error);
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
        this.logger.info('Cleaning up OWASP ZAP integration');
        try {
            if (this.zapProcess) {
                this.zapProcess.kill('SIGTERM');
                this.zapProcess = undefined;
            }
        }
        catch (error) {
            this.logger.error('Error cleaning up OWASP ZAP', error);
        }
    }
    async checkZAPRunning() {
        try {
            const response = await axios.get(`${this.baseUrl}/JSON/core/view/version/`, {
                timeout: 5000
            });
            return response.status === 200;
        }
        catch {
            return false;
        }
    }
    async canStartZAP() {
        if (!this.config.zapPath) {
            const commonPaths = [
                '/usr/share/zaproxy/zap.sh',
                '/opt/zaproxy/zap.sh',
                'zap.sh',
                'zap.exe'
            ];
            for (const zapPath of commonPaths) {
                try {
                    await fs.access(zapPath);
                    this.config.zapPath = zapPath;
                    return true;
                }
                catch {
                }
            }
            return false;
        }
        try {
            await fs.access(this.config.zapPath);
            return true;
        }
        catch {
            return false;
        }
    }
    async startZAP() {
        if (!this.config.zapPath) {
            throw new Error('ZAP path not configured');
        }
        this.logger.info(`Starting ZAP at ${this.config.zapPath}`);
        const zapArgs = [
            '-daemon',
            '-port', (this.config.port || 8080).toString(),
            '-host', this.config.host || 'localhost'
        ];
        if (this.config.apiKey) {
            zapArgs.push('-config', `api.key=${this.config.apiKey}`);
        }
        this.zapProcess = spawn(this.config.zapPath, zapArgs, {
            detached: true,
            stdio: 'pipe'
        });
        this.zapProcess.on('error', (error) => {
            this.logger.error('ZAP process error', error);
        });
        this.zapProcess.on('exit', (code) => {
            this.logger.info(`ZAP process exited with code ${code}`);
            this.zapProcess = undefined;
        });
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('ZAP startup timeout'));
            }, 30000);
            const checkStartup = setInterval(async () => {
                if (await this.checkZAPRunning()) {
                    clearInterval(checkStartup);
                    clearTimeout(timeout);
                    resolve(undefined);
                }
            }, 1000);
        });
    }
    async waitForZAPReady() {
        const maxRetries = 30;
        let retries = 0;
        while (retries < maxRetries) {
            try {
                await this.zapClient.get('/JSON/core/view/version/');
                return;
            }
            catch (error) {
                retries++;
                if (retries >= maxRetries) {
                    throw new Error('ZAP not ready after maximum retries');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    async runSpiderScan(targetUrl) {
        this.logger.info(`Starting spider scan on ${targetUrl}`);
        const response = await this.zapClient.get('/JSON/spider/action/scan/', {
            params: {
                url: targetUrl,
                recurse: 'true'
            }
        });
        const scanId = response.data.scan;
        while (true) {
            const statusResponse = await this.zapClient.get('/JSON/spider/view/status/', {
                params: { scanId }
            });
            const progress = parseInt(statusResponse.data.status);
            if (progress >= 100) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        this.logger.info('Spider scan completed');
    }
    async runPassiveScan() {
        this.logger.info('Running passive scan');
        while (true) {
            const response = await this.zapClient.get('/JSON/pscan/view/recordsToScan/');
            const recordsToScan = parseInt(response.data.recordsToScan);
            if (recordsToScan === 0) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        this.logger.info('Passive scan completed');
    }
    async runActiveScan(targetUrl) {
        this.logger.info(`Starting active scan on ${targetUrl}`);
        const response = await this.zapClient.get('/JSON/ascan/action/scan/', {
            params: {
                url: targetUrl,
                recurse: 'true'
            }
        });
        const scanId = response.data.scan;
        while (true) {
            const statusResponse = await this.zapClient.get('/JSON/ascan/view/status/', {
                params: { scanId }
            });
            const progress = parseInt(statusResponse.data.status);
            if (progress >= 100) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        this.logger.info('Active scan completed');
    }
    async getAlerts() {
        const response = await this.zapClient.get('/JSON/core/view/alerts/');
        return response.data.alerts || [];
    }
    convertAlertToResult(alert, startTime) {
        const severity = this.mapZAPRiskToSeverity(alert.risk);
        return {
            id: `zap-${alert.pluginId}-${alert.alert}`,
            name: alert.alert,
            suite: 'owasp-zap',
            status: 'failed',
            severity,
            description: alert.description,
            details: alert.solution,
            evidence: {
                type: 'request',
                content: JSON.stringify({
                    url: alert.url,
                    method: alert.method,
                    param: alert.param,
                    attack: alert.attack,
                    evidence: alert.evidence
                }),
                encoding: 'utf8',
                mimeType: 'application/json'
            },
            remediation: alert.solution,
            duration: Date.now() - startTime,
            timestamp: new Date(),
            metadata: {
                pluginId: alert.pluginId,
                cweid: alert.cweid,
                wascid: alert.wascid,
                reference: alert.reference,
                confidence: alert.confidence
            }
        };
    }
    mapZAPRiskToSeverity(risk) {
        switch (risk.toLowerCase()) {
            case 'high':
                return 'high';
            case 'medium':
                return 'medium';
            case 'low':
                return 'low';
            case 'informational':
                return 'low';
            default:
                return 'medium';
        }
    }
    getDefaultTarget() {
        return 'http://localhost:3000';
    }
}
//# sourceMappingURL=OWASPZAPIntegration.js.map