#!/usr/bin/env node

import { getWranglerConfig } from '../src/config/wrangler-config';
import { env } from '../src/config/env';

/**
 * A script to validate all critical configurations for the Tally MCP server.
 * This should be run during CI/CD and before local development sessions.
 */
function validateAllConfigs(): void {
  console.log('🔍 Starting configuration validation...');

  try {
    // 1. Validate environment variables
    console.log('Validating environment variables...');
    // The `env` object from `src/config/env.ts` automatically validates on import.
    // If it fails, it will throw an error and the script will exit.
    // We reference it here to ensure it's loaded and validated.
    if (!env) {
      throw new Error('Environment variables could not be loaded.');
    }
    console.log('✅ Environment variables are valid.');

    // 2. Validate wrangler.toml
    console.log('Validating wrangler.toml...');
    getWranglerConfig();
    console.log('✅ wrangler.toml is valid.');

    console.log('\n🎉 All configurations are valid!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Configuration validation failed:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

validateAllConfigs(); 