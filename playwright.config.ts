import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env.e2e for E2E testing
dotenv.config({ path: '.env.e2e' });

/**
 * Playwright configuration for end-to-end testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/__tests__/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential execution to avoid API rate limits
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1, // Single worker to avoid rate limiting
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/e2e/playwright-report' }],
    ['junit', { outputFile: 'test-results/e2e/junit-results.xml' }],
    ['json', { outputFile: 'test-results/e2e/test-results.json' }],
    ['line']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://tally.so',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: process.env.E2E_SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    
    /* Record video on failure */
    video: process.env.E2E_RECORD_VIDEO === 'true' ? 'retain-on-failure' : 'off',
    
    /* Timeouts */
    actionTimeout: parseInt(process.env.E2E_API_TIMEOUT || '30000'),
    navigationTimeout: parseInt(process.env.E2E_NAVIGATION_TIMEOUT || '15000'),
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: {
          width: parseInt(process.env.E2E_VIEWPORT_WIDTH || '1280'),
          height: parseInt(process.env.E2E_VIEWPORT_HEIGHT || '720')
        },
        userAgent: 'TallyMCP-E2E-Tests/1.0 (Playwright)'
      },
    },

    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },

  /* Global setup and teardown */
  globalSetup: require.resolve('./src/__tests__/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./src/__tests__/e2e/global-teardown.ts'),

  /* Output directory for test artifacts */
  outputDir: 'test-results/e2e/artifacts',

  /* Timeout for each test */
  timeout: 60000, // 60 seconds per test

  /* Expect timeout for assertions */
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },

  /* Test metadata */
  metadata: {
    'test-type': 'e2e-integration',
    'target-platform': 'tally.so',
    'test-scope': 'form-creation-workflow'
  }
}); 