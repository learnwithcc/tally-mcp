/**
 * Security Testing Framework
 * 
 * Main entry point for the security testing framework
 */

export { SecurityTestFramework } from './SecurityTestFramework';

// Types
export * from './types';

// Integrations
export { OWASPZAPIntegration } from './integrations/OWASPZAPIntegration';
export { SnykIntegration } from './integrations/SnykIntegration';

// Test runner
export { CustomSecurityTests } from './tests/CustomSecurityTests';

// Reporting
export { SecurityTestReporter } from './reporting/SecurityTestReporter';

// Default configuration
import securityTestingConfig from '../config/security-testing.config';
export const DEFAULT_SECURITY_TEST_CONFIG = securityTestingConfig;

/**
 * Quick setup function for basic security testing
 */
export async function createSecurityTestFramework(overrides?: any) {
  const { SecurityTestFramework } = await import('./SecurityTestFramework');
  
  const config = {
    ...DEFAULT_SECURITY_TEST_CONFIG,
    ...overrides
  };
  
  return new SecurityTestFramework(config);
}

/**
 * Run basic security tests with minimal configuration
 */
export async function runBasicSecurityTests(targetUrl?: string) {
  const framework = await createSecurityTestFramework({
    target: {
      baseUrl: targetUrl || 'http://localhost:3000'
    }
  });
  
  await framework.initialize();
  return await framework.runAllTests();
} 