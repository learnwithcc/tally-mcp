/**
 * Global teardown for E2E integration tests
 * Runs once after all tests to clean up the testing environment
 */

import { StagingTestUtils } from './staging-environment';
import fs from 'fs/promises';
import path from 'path';

async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting E2E test environment cleanup...');

  // Clean up test forms if enabled
  const cleanupEnabled = process.env.E2E_CLEANUP_AFTER_TESTS !== 'false';
  if (cleanupEnabled) {
    try {
      console.log('🗑️  Cleaning up test forms...');
      await StagingTestUtils.cleanupTestForms();
      console.log('✅ Test forms cleanup completed');
    } catch (error) {
      console.warn(`⚠️  Failed to clean up test forms: ${error}`);
    }
  } else {
    console.log('⏭️  Test form cleanup is disabled');
  }

  // Write teardown summary
  const artifactsDir = process.env.E2E_ARTIFACTS_DIR || 'test-results/e2e';
  const createdFormIds = StagingTestUtils.getCreatedFormIds();
  
  const teardownInfo = {
    timestamp: new Date().toISOString(),
    formsCreated: createdFormIds.length,
    formIds: createdFormIds,
    cleanupPerformed: cleanupEnabled,
    environment: {
      baseUrl: process.env.TALLY_BASE_URL || 'https://api.tally.so',
      browser: process.env.E2E_BROWSER || 'chromium'
    }
  };

  try {
    await fs.writeFile(
      path.join(artifactsDir, 'teardown-summary.json'),
      JSON.stringify(teardownInfo, null, 2)
    );
    console.log(`📊 Teardown summary written to ${path.join(artifactsDir, 'teardown-summary.json')}`);
  } catch (error) {
    console.warn(`⚠️  Failed to write teardown summary: ${error}`);
  }

  // Log test session summary
  console.log('📋 E2E Test Session Summary:');
  console.log(`   • Forms Created: ${createdFormIds.length}`);
  console.log(`   • Cleanup Performed: ${cleanupEnabled ? 'Yes' : 'No'}`);
  console.log(`   • Artifacts Directory: ${artifactsDir}`);

  console.log('✅ E2E test environment cleanup completed successfully!');
}

export default globalTeardown; 