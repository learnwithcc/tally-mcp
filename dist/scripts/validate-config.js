#!/usr/bin/env node
import { getWranglerConfig } from '../src/config/wrangler-config';
import { env } from '../src/config/env';
function validateAllConfigs() {
    console.log('🔍 Starting configuration validation...');
    try {
        console.log('Validating environment variables...');
        if (!env) {
            throw new Error('Environment variables could not be loaded.');
        }
        console.log('✅ Environment variables are valid.');
        console.log('Validating wrangler.toml...');
        getWranglerConfig();
        console.log('✅ wrangler.toml is valid.');
        console.log('\n🎉 All configurations are valid!');
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Configuration validation failed:');
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(error);
        }
        process.exit(1);
    }
}
validateAllConfigs();
//# sourceMappingURL=validate-config.js.map