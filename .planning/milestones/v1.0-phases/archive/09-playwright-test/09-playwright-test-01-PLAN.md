---
phase: 09-playwright-test
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - playwright.config.ts
  - tests/
  - .gitignore
autonomous: true
requirements:
  - TEST-01
  - TEST-02
  - TEST-03
---

<objective>
Install and configure Playwright for end-to-end testing of verification flows.

Purpose: Set up automated E2E testing infrastructure to test Turnstile verification, API validation, and redirect logic. This enables reliable testing without manual browser interaction.

Output: Playwright installed with browsers, test directory structure, base configuration, and initial test for verification flow.
</objective>

<execution_context>
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

# Current State
- Project uses Vitest for unit tests (package.json has "test": "vitest run")
- No E2E testing infrastructure exists
- Need to install Playwright with browsers for cross-browser testing
- Tests should work locally and in CI/CD (GitHub Actions)

# Requirements
- TEST-01: Install Playwright with Chromium, Firefox, WebKit
- TEST-02: Configure Playwright test directory structure
- TEST-03: Create base test setup with fixtures
- TEST-04: Write verification flow test
- TEST-05: Add test configuration for local and CI/CD
</context>

<tasks>

<task type="auto">
  <name>Install Playwright dependencies</name>
  <files>package.json</files>
  <behavior>
    - Test 1: npm install playwright --save-dev succeeds
    - Test 2: npx playwright install installs all browsers
    - Test 3: Playwright version is latest stable
  </behavior>
  <action>
    1. Install Playwright as dev dependency:
       npm install -D @playwright/test
    
    2. Install browsers (Chromium, Firefox, WebKit):
       npx playwright install
    
    3. Install system dependencies for browsers:
       npx playwright install-deps
    
    4. Update package.json test script:
       "test": "playwright test"
    
    5. Add Playwright to gitignore for browser binaries:
       - node_modules/.cache/playwright
  </action>
  <verify>
    <automated>npx playwright --version</automated>
  </verify>
  <done>Playwright installed with all browsers, test script updated</done>
</task>

<task type="auto">
  <name>Create Playwright configuration</name>
  <files>playwright.config.ts</files>
  <behavior>
    - Test 1: playwright test runs without errors
    - Test 2: Configuration includes all three browsers
    - Test 3: CI mode configured for GitHub Actions
  </behavior>
  <action>
    Create playwright.config.ts with:
    
    1. Playwright version: Latest
    2. Test directory: tests/
    3. Output directory: test-results/
    4. Reporter: html, json (for CI)
    5. Projects array:
       - chromium (default)
       - firefox
       - webkit
    6. Use baseURL for local testing (http://localhost:8080)
    7. CI mode: true when running in GitHub Actions
    8. Timeout: 30s per test, 60s for entire suite
    9. Retries: 1 retry on failure
    
    Example structure:
    ```typescript
    import { defineConfig, devices } from '@playwright/test';
    
    export default defineConfig({
      testDir: './tests',
      timeout: 60000,
      retries: 1,
      reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }]],
      projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],
      use: {
        baseURL: process.env.BASE_URL || 'http://localhost:8080',
        trace: 'on-first-retry',
      },
    });
    ```
  </action>
  <verify>
    <automated>npx playwright test --list</automated>
  </verify>
  <done>Playwright configuration file created with multi-browser support</done>
</task>

<task type="auto">
  <name>Create test directory structure and base test</name>
  <files>tests/</files>
  <action>
    Create test directory structure:
    
    1. tests/
       - tests/
       - tests/verification.spec.ts
       - tests/fixtures.ts
       - tests/helpers/
         - helpers/navigation.ts
         - helpers/turnstile.ts
    
    2. Create base test file (tests/verification.spec.ts):
       - Test: Turnstile widget loads
       - Test: Verify button is enabled after widget loads
       - Test: Invalid token shows error modal
       - Test: Valid token triggers redirect (skip for now, needs real sitekey)
    
    3. Create fixtures (tests/fixtures.ts):
       - Custom fixtures for test setup
       - Helper functions for common actions
    
    4. Create helper functions:
       - navigation.ts: Helper to navigate to verify pages
       - turnstile.ts: Helper to interact with Turnstile widget
  </action>
  <verify>
    <automated>npx playwright test --list</automated>
  </verify>
  <done>Test directory created with base test file and helpers</done>
</task>

</tasks>

<verification>
1. Run test list:
   npx playwright test --list

2. Run tests in headless mode:
   npx playwright test --headed

3. Run tests in all browsers:
   npx playwright test --project=chromium --project=firefox --project=webkit

4. Generate HTML report:
   npx playwright show-report
</verification>

<success_criteria>
- [ ] Playwright installed as dev dependency
- [ ] All three browsers installed (chromium, firefox, webkit)
- [ ] playwright.config.ts created with proper configuration
- [ ] tests/ directory structure created
- [ ] Base verification test file created
- [ ] Test script in package.json updated
- [ ] Tests can run locally and in CI/CD
</success_criteria>

<output>
After completion, create `.planning/phases/09-playwright-test/09-playwright-test-01-SUMMARY.md`
</output>
