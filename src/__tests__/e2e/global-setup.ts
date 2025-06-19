/**
 * Global setup for E2E integration tests
 * Runs once before all tests to prepare the testing environment
 */

import { validateStagingEnvironment } from './staging-environment';
import fs from 'fs/promises';
import path from 'path';

async function globalSetup(): Promise<void> {
  console.log('🚀 Starting E2E test environment setup...');

  // Validate environment variables
  if (!validateStagingEnvironment()) {
    throw new Error('❌ Staging environment validation failed. Please check your environment variables.');
  }

  // Create test artifacts directory
  const artifactsDir = process.env.E2E_ARTIFACTS_DIR || 'test-results/e2e';
  try {
    await fs.mkdir(artifactsDir, { recursive: true });
    console.log(`✅ Created artifacts directory: ${artifactsDir}`);
  } catch (error) {
    console.warn(`⚠️  Failed to create artifacts directory: ${error}`);
  }

  // Create logs directory
  const logFile = process.env.E2E_LOG_FILE || 'test-results/e2e/e2e-tests.log';
  const logDir = path.dirname(logFile);
  try {
    await fs.mkdir(logDir, { recursive: true });
    console.log(`✅ Created logs directory: ${logDir}`);
  } catch (error) {
    console.warn(`⚠️  Failed to create logs directory: ${error}`);
  }

  // Log environment configuration
  console.log('📋 E2E Test Configuration:');
  console.log(`   • API Base URL: ${process.env.TALLY_BASE_URL || 'https://api.tally.so'}`);
  console.log(`   • Browser: ${process.env.E2E_BROWSER || 'chromium'}`);
  console.log(`   • Headless: ${process.env.E2E_HEADLESS || 'true'}`);
  console.log(`   • Viewport: ${process.env.E2E_VIEWPORT_WIDTH || 1280}x${process.env.E2E_VIEWPORT_HEIGHT || 720}`);
  console.log(`   • API Timeout: ${process.env.E2E_API_TIMEOUT || 30000}ms`);
  console.log(`   • Rate Limit Delay: ${process.env.E2E_RATE_LIMIT_DELAY || 1000}ms`);
  console.log(`   • Max Forms Per Run: ${process.env.E2E_MAX_FORMS_PER_RUN || 50}`);
  console.log(`   • Cleanup After Tests: ${process.env.E2E_CLEANUP_AFTER_TESTS || 'true'}`);

  // Write setup timestamp
  const setupInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      baseUrl: process.env.TALLY_BASE_URL || 'https://api.tally.so',
      browser: process.env.E2E_BROWSER || 'chromium',
      headless: process.env.E2E_HEADLESS || 'true',
      viewport: {
        width: parseInt(process.env.E2E_VIEWPORT_WIDTH || '1280'),
        height: parseInt(process.env.E2E_VIEWPORT_HEIGHT || '720')
      }
    }
  };

  try {
    await fs.writeFile(
      path.join(artifactsDir, 'setup-info.json'),
      JSON.stringify(setupInfo, null, 2)
    );
  } catch (error) {
    console.warn(`⚠️  Failed to write setup info: ${error}`);
  }

  console.log('✅ E2E test environment setup completed successfully!');
}

export default globalSetup; 