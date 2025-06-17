# Security Testing Framework

A comprehensive security testing framework for the Tally MCP server that integrates multiple security testing tools and provides automated security validation.

## Overview

The Security Testing Framework orchestrates security testing by integrating:

- **OWASP ZAP** - Web application security scanner
- **Snyk** - Vulnerability scanner for dependencies and code  
- **Custom Tests** - Application-specific security tests

## Features

### 🔍 Multi-Tool Integration
- OWASP ZAP for web application security scanning
- Snyk for dependency and code vulnerability scanning
- Custom security tests tailored to the application

### 📊 Comprehensive Reporting
- Multiple output formats: JSON, HTML, CSV, XML, JUnit
- Detailed vulnerability reports with evidence
- Metrics and compliance reporting
- CI/CD integration support

### ⚙️ Configurable Test Suites
- Passive, active, and baseline security scans
- Configurable scan depth and coverage
- Custom test categories and severity levels

### 🔧 CLI Integration
- Command-line interface for easy execution
- npm scripts for common testing scenarios
- Automated CI/CD pipeline integration

## Quick Start

### Basic Usage

```bash
# Run all security tests
npm run security:test

# Run specific test suite
npm run security:custom
npm run security:owasp  
npm run security:snyk

# Run with custom target
npm run security:test -- --target=http://localhost:8080
```

### Programmatic Usage

```typescript
import { SecurityTestFramework, DEFAULT_SECURITY_TEST_CONFIG } from './security-testing';

const config = {
  ...DEFAULT_SECURITY_TEST_CONFIG,
  target: { baseUrl: 'http://localhost:3000' },
  suites: ['custom', 'owasp-zap', 'snyk'],
  owasp: { enabled: true, scanTypes: ['baseline'] },
  snyk: { enabled: true, scanTypes: ['dependencies'] }
};

const framework = new SecurityTestFramework(config);
await framework.initialize();
const results = await framework.runAllTests();
```

## Configuration

### Security Test Config

```typescript
interface SecurityTestConfig {
  target: {
    baseUrl: string;           // Target application URL
    apiKey?: string;           // API key for authenticated testing
    headers?: Record<string, string>;
    timeout?: number;
  };
  suites: TestSuite[];         // Test suites to run
  owasp: OWASPZAPConfig;       // OWASP ZAP configuration
  snyk: SnykConfig;            // Snyk configuration  
  custom: CustomTestConfig;    // Custom tests configuration
  reporting: ReportingConfig;  // Report generation settings
  cicd?: CICDConfig;          // CI/CD integration settings
}
```

### OWASP ZAP Configuration

```typescript
{
  enabled: true,
  port: 8080,
  host: 'localhost',
  scanTypes: ['baseline', 'passive', 'active'],
  maxScanTime: 300000,
  excludeUrls: ['/admin/*'],
  reportFormats: ['json', 'html']
}
```

### Snyk Configuration

```typescript
{
  enabled: true,
  token: process.env.SNYK_TOKEN,
  scanTypes: ['dependencies', 'code', 'container'],
  severity: ['high', 'critical'],
  failOnIssues: false
}
```

## Test Suites

### Custom Security Tests

Application-specific security tests including:

- **Authentication Tests** - API key validation, token handling
- **Authorization Tests** - Access control and permissions
- **Input Validation Tests** - XSS, injection, sanitization
- **API Security Tests** - Endpoint security, rate limiting
- **Data Protection Tests** - Encryption, data handling

### OWASP ZAP Integration

Automated web application security scanning:

- **Spider Scan** - Discovers application structure
- **Passive Scan** - Analyzes traffic for vulnerabilities
- **Active Scan** - Actively tests for security issues
- **Baseline Scan** - Quick security assessment

### Snyk Integration

Vulnerability scanning for:

- **Dependencies** - Third-party package vulnerabilities
- **Code** - Static analysis for security issues
- **Container** - Docker image vulnerabilities
- **Infrastructure as Code** - Configuration vulnerabilities

## Reports

### Report Formats

- **JSON** - Machine-readable results for automation
- **HTML** - Human-readable web reports with visualizations
- **CSV** - Spreadsheet-compatible format
- **XML** - Structured data for parsing
- **JUnit** - CI/CD compatible test results

### Report Location

Reports are saved to `reports/security/` with timestamped filenames:
- `security-report-2024-01-15T10-30-00-000Z.html`
- `security-report-2024-01-15T10-30-00-000Z.json`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Security Tests
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      - run: npm start &
      - run: npm run security:test
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - uses: actions/upload-artifact@v2
        with:
          name: security-reports
          path: reports/security/
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Security Tests') {
            steps {
                sh 'npm install'
                sh 'npm run build'
                sh 'npm start &'
                sh 'npm run security:test'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/security/*'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports/security',
                        reportFiles: '*.html',
                        reportName: 'Security Test Report'
                    ])
                }
            }
        }
    }
}
```

## Prerequisites

### OWASP ZAP

Install OWASP ZAP for web application security testing:

```bash
# Ubuntu/Debian
sudo apt-get install zaproxy

# macOS with Homebrew
brew install zaproxy

# Or download from https://www.zaproxy.org/download/
```

### Snyk CLI

Install Snyk CLI for vulnerability scanning:

```bash
# npm
npm install -g snyk

# Or download from https://snyk.io/docs/snyk-cli/
```

## Environment Variables

Configure the following environment variables:

```bash
# Snyk authentication
SNYK_TOKEN=your_snyk_token_here

# OWASP ZAP API key (optional)
ZAP_API_KEY=your_zap_api_key

# Target configuration
SECURITY_TEST_TARGET=http://localhost:3000
```

## Extending the Framework

### Adding Custom Tests

Create custom security test categories:

```typescript
export class MyCustomTests implements SecurityTestCategory {
  name = 'My Custom Tests';
  description = 'Custom security tests for my application';
  enabled = true;
  tests: SecurityTest[] = [
    {
      id: 'my-test-1',
      name: 'Test Authentication',
      description: 'Verify authentication mechanisms',
      severity: 'high',
      category: 'authentication',
      tags: ['auth', 'api'],
      async execute(): Promise<SecurityTestResult> {
        // Test implementation
        return {
          id: 'my-test-1',
          name: 'Test Authentication',
          suite: 'custom',
          status: 'passed',
          severity: 'high',
          description: 'Authentication test passed',
          duration: 100,
          timestamp: new Date()
        };
      }
    }
  ];
}
```

### Custom Integrations

Implement the `SecurityTestIntegration` interface:

```typescript
export class MySecurityTool implements SecurityTestIntegration {
  name = 'My Security Tool';
  version = '1.0.0';
  configValid = false;

  async initialize(): Promise<void> { /* ... */ }
  async runScan(options?: SecurityScanOptions): Promise<SecurityTestResult[]> { /* ... */ }
  async checkAvailability(): Promise<boolean> { /* ... */ }
  async cleanup(): Promise<void> { /* ... */ }
}
```

## Troubleshooting

### Common Issues

1. **OWASP ZAP not starting**
   - Ensure ZAP is installed and in PATH
   - Check port conflicts (default: 8080)
   - Verify API key configuration

2. **Snyk authentication failed**
   - Set SNYK_TOKEN environment variable
   - Run `snyk auth` to authenticate
   - Check organization permissions

3. **Tests timing out**
   - Increase timeout values in configuration
   - Check target application availability
   - Review network connectivity

### Debug Mode

Enable verbose logging:

```bash
npm run security:test -- --verbose
```

Set log level in configuration:

```typescript
{
  logging: {
    level: 'debug'
  }
}
```

## Architecture

```
security-testing/
├── SecurityTestFramework.ts    # Main orchestrator
├── types.ts                    # Type definitions
├── integrations/
│   ├── OWASPZAPIntegration.ts # OWASP ZAP integration
│   └── SnykIntegration.ts     # Snyk integration
├── tests/
│   ├── CustomSecurityTests.ts # Custom test runner
│   └── categories/            # Test categories
├── reporting/
│   └── SecurityTestReporter.ts # Report generation
├── cli.ts                      # Command line interface
└── README.md                   # This documentation
```

## Contributing

1. Follow existing code patterns and TypeScript best practices
2. Add comprehensive tests for new features
3. Update documentation for configuration changes
4. Ensure backward compatibility when possible

## License

This security testing framework is part of the Tally MCP project and follows the same license terms. 