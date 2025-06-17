#!/usr/bin/env node

/**
 * Security Testing CLI
 * 
 * Command line interface for running security tests
 */

import { SecurityTestFramework } from './SecurityTestFramework';
import { DEFAULT_SECURITY_TEST_CONFIG } from './index';
import { TestSuite, SecurityTestConfig } from './types';

interface CLIArgs {
  suite?: TestSuite;
  target?: string;
  verbose?: boolean;
  help?: boolean;
}

async function main() {
  const args = parseArgs();
  
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  try {
    console.log('🔒 Starting Security Testing Framework...\n');
    
    const config: SecurityTestConfig = JSON.parse(JSON.stringify(DEFAULT_SECURITY_TEST_CONFIG));
    
    config.target.baseUrl = args.target || config.target.baseUrl;

    // Configure specific suite if specified
    if (args.suite) {
      config.suites = [args.suite];
      
      // Enable the specified suite
      switch (args.suite) {
        case 'owasp-zap':
          config.owasp.enabled = true;
          break;
        case 'snyk':
          config.snyk.enabled = true;
          break;
        case 'custom':
          config.custom.enabled = true;
          break;
      }
    } else {
      // Run all available suites
      config.suites = ['custom', 'owasp-zap', 'snyk'] as TestSuite[];
      config.owasp.enabled = true;
      config.snyk.enabled = true;
      config.custom.enabled = true;
    }

    const framework = new SecurityTestFramework(config);
    
    console.log(`📍 Target: ${config.target.baseUrl}`);
    console.log(`🧪 Test Suites: ${config.suites.join(', ')}`);
    console.log('');

    // Initialize framework
    const isValid = await framework.validateConfiguration();
    if (!isValid) {
      console.error('❌ Configuration validation failed');
      process.exit(1);
    }

    await framework.initialize();
    
    // Run tests
    const startTime = Date.now();
    const results = await framework.runAllTests();
    const duration = Date.now() - startTime;
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    // Print failed tests
    if (failed > 0) {
      console.log('\n🚨 Failed Tests:');
      console.log('================');
      
      results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`\n❌ ${result.name} (${result.severity})`);
          console.log(`   Suite: ${result.suite}`);
          console.log(`   Description: ${result.description}`);
          if (result.remediation) {
            console.log(`   Remediation: ${result.remediation}`);
          }
        });
    }
    
    console.log(`\n📁 Reports saved to: ${config.reporting.outputDir}`);
    
    await framework.cleanup();
    
    // Exit with error code if tests failed
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Security testing failed:', error);
    process.exit(1);
  }
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (!arg) continue;
    
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      args.verbose = true;
    } else if (arg.startsWith('--suite=')) {
      const value = arg.split('=')[1];
      if (value) {
        args.suite = value as TestSuite;
      }
    } else if (arg.startsWith('--target=')) {
      const value = arg.split('=')[1];
      if (value) {
        args.target = value;
      }
    } else if (arg === '--suite') {
      if (i + 1 < process.argv.length) {
        const value = process.argv[++i];
        if (value) {
          args.suite = value as TestSuite;
        }
      }
    } else if (arg === '--target') {
      if (i + 1 < process.argv.length) {
        const value = process.argv[++i];
        if (value) {
          args.target = value;
        }
      }
    }
  }
  
  return args;
}

function printHelp() {
  console.log(`
🔒 Security Testing Framework CLI

Usage: npm run security:test [options]

Options:
  --suite <suite>    Run specific test suite (custom|owasp-zap|snyk)
  --target <url>     Target URL to test (default: http://localhost:3000)
  --verbose, -v      Verbose output
  --help, -h         Show this help message

Examples:
  npm run security:test                           # Run all security tests
  npm run security:test -- --suite=custom        # Run only custom tests
  npm run security:test -- --target=http://example.com
  npm run security:owasp                         # Run OWASP ZAP tests
  npm run security:snyk                          # Run Snyk vulnerability scan
  npm run security:custom                        # Run custom security tests

Test Suites:
  custom     - Application-specific security tests
  owasp-zap  - OWASP ZAP web application security scanner
  snyk       - Snyk vulnerability scanner for dependencies and code

Reports:
  Reports are generated in multiple formats (JSON, HTML, CSV) and saved
  to the reports/security directory.
`);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled rejection:', reason);
  process.exit(1);
});

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
} 