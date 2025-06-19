/**
 * Security Testing Framework Types
 */

export type TestSuite = 'custom' | 'owasp-zap' | 'snyk';

export type SecurityTestStatus = 'passed' | 'failed' | 'warning' | 'skipped';

export type SecurityTestSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityTestResult {
  id: string;
  name: string;
  suite: TestSuite;
  status: SecurityTestStatus;
  severity: SecurityTestSeverity;
  description: string;
  details?: string;
  evidence?: SecurityTestEvidence;
  remediation?: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SecurityTestEvidence {
  type: 'request' | 'response' | 'log' | 'screenshot' | 'file';
  content: string;
  encoding?: 'base64' | 'utf8';
  mimeType?: string;
  size?: number;
}

export interface SecurityTestConfig {
  target: {
    baseUrl: string;
    apiKey?: string;
    headers?: Record<string, string>;
    timeout?: number;
  };
  suites: TestSuite[];
  owasp: OWASPZAPConfig;
  snyk: SnykConfig;
  custom: CustomTestConfig;
  reporting: ReportingConfig;
  schedule?: ScheduleConfig;
  cicd?: CICDConfig;
}

export interface OWASPZAPConfig {
  enabled: boolean;
  zapPath?: string;
  port?: number;
  host?: string;
  apiKey?: string;
  policies?: string[];
  scanTypes?: ('passive' | 'active' | 'baseline')[];
  excludeUrls?: string[];
  includeUrls?: string[];
  maxScanTime?: number;
  reportFormats?: ('html' | 'xml' | 'json' | 'md')[];
}

export interface SnykConfig {
  enabled: boolean;
  token?: string;
  orgId?: string;
  projectPath?: string;
  scanTypes?: ('code' | 'dependencies' | 'container' | 'iac')[];
  severity?: SecurityTestSeverity[];
  excludePatterns?: string[];
  failOnIssues?: boolean;
  monitorProject?: boolean;
}

export interface CustomTestConfig {
  enabled: boolean;
  testPaths?: string[];
  parallel?: boolean;
  maxConcurrency?: number;
  timeout?: number;
  retries?: number;
  skipPatterns?: string[];
}

export interface ReportingConfig {
  enabled: boolean;
  outputDir?: string;
  formats?: ('json' | 'html' | 'xml' | 'csv' | 'junit')[];
  includeEvidence?: boolean;
  aggregateResults?: boolean;
  webhooks?: WebhookConfig[];
  notifications?: NotificationConfig[];
}

export interface WebhookConfig {
  url: string;
  headers?: Record<string, string>;
  events?: ('test-start' | 'test-complete' | 'test-failure')[];
  template?: string;
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'teams' | 'webhook';
  target: string;
  events?: ('test-start' | 'test-complete' | 'test-failure')[];
  conditions?: {
    minSeverity?: SecurityTestSeverity;
    maxFailures?: number;
  };
}

export interface ScheduleConfig {
  enabled: boolean;
  cron?: string;
  timezone?: string;
  nextRun?: Date;
  autoStart?: boolean;
}

export interface CICDConfig {
  enabled: boolean;
  platform?: 'github' | 'gitlab' | 'jenkins' | 'azure-devops' | 'generic';
  breakBuildOnFailure?: boolean;
  publishResults?: boolean;
  artifactPath?: string;
  integrationKey?: string;
}

export interface SecurityTestSummary {
  startTime: number;
  endTime: number;
  duration: number;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  skipped?: number;
  coverage?: {
    endpoints: number;
    vulnerabilities: Record<SecurityTestSeverity, number>;
  };
}

export interface SecurityTestMetrics {
  testExecutionTime: number;
  vulnerabilitiesFound: number;
  criticalIssues: number;
  highSeverityIssues: number;
  mediumSeverityIssues: number;
  lowSeverityIssues: number;
  falsePositives: number;
  coverage: number;
}

export interface SecurityTestReport {
  id: string;
  timestamp: Date;
  summary: SecurityTestSummary;
  results: SecurityTestResult[];
  metrics: SecurityTestMetrics;
  config: Partial<SecurityTestConfig>;
  environment: {
    platform: string;
    version: string;
    hostname: string;
    user: string;
  };
}

// Custom test interfaces for extensibility
export interface SecurityTest {
  id: string;
  name: string;
  description: string;
  severity: SecurityTestSeverity;
  category: string;
  tags: string[];
  execute(): Promise<SecurityTestResult>;
}

export interface SecurityTestCategory {
  name: string;
  description: string;
  tests: SecurityTest[];
  enabled: boolean;
}

export interface SecurityScanOptions {
  targetUrl: string;
  scanType?: 'passive' | 'active' | 'baseline';
  maxTime?: number;
  recursive?: boolean;
  excludeUrls?: string[];
  customHeaders?: Record<string, string>;
}

export interface VulnerabilityReport {
  id: string;
  title: string;
  description: string;
  severity: SecurityTestSeverity;
  cvss?: number;
  cve?: string;
  cwe?: string;
  solution?: string;
  references?: string[];
  affectedUrls?: string[];
  evidence?: SecurityTestEvidence[];
}

export interface SecurityTestRunner {
  initialize(): Promise<void>;
  runAll(): Promise<SecurityTestResult[]>;
  runTest(testId: string): Promise<SecurityTestResult>;
  cleanup(): Promise<void>;
  checkAvailability(): Promise<boolean>;
}

export interface SecurityTestIntegration extends SecurityTestRunner {
  name: string;
  version: string;
  configValid: boolean;
  runScan(options?: SecurityScanOptions): Promise<SecurityTestResult[]>;
} 