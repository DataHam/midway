import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Tam-Tham website E2E testing
 * 
 * Usage:
 *   npx playwright test                    - Run all tests headless
 *   npx playwright test --headed           - Run tests with browser visible
 *   npx playwright test --ui               - Open Playwright UI mode
 *   npx playwright test --project=firefox  - Run only Firefox tests
 *   npx playwright test --reporter=html    - Generate HTML report
 *   npx playwright show-report             - Open HTML report
 */

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  
  // Test timeouts
  timeout: 30 * 1000, // 30s per test
  expect: {
    timeout: 5000,
  },
  fullTimeout: 60000, // 60s for entire test file
  
  // Retries for flaky tests
  retries: process.env.CI ? 2 : 1,
  
  // Parallel execution
  workers: process.env.CI ? 1 : undefined,
  quiet: !!process.env.CI,
  
  // Reporting
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  
  // Shared settings across all projects
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    
    // Collect trace on retry (for debugging)
    trace: 'on-first-retry',
    
    // Collect video on retry
    video: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Use all available action timeouts
    actionTimeout: 0,
    
    // Use all available navigation timeouts
    navigationTimeout: 30000,
  },
  
  // Projects for cross-browser testing
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile devices (optional)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  
  // Run tests in order of definition
  fullyParallel: true,
  
  // Fail fast in CI
  forbidOnly: !!process.env.CI,
  
  // Clean up test-results directory before each run
  outputDir: 'test-results/',
});
