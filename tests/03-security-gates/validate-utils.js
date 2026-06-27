/**
 * Integration Verification Script
 * 
 * Runs all unit tests for security gate utilities and reports results.
 * Can be run independently: node tests/03-security-gates/validate-utils.js --test-all
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run all tests and report results
 */
function runAllTests() {
  const projectRoot = join(__dirname, '..', '..');

  console.log('Running all security gate utility tests...\n');
  console.log('='.repeat(60));

  try {
    execSync('npx vitest run', {
      stdio: 'inherit',
      cwd: projectRoot
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✓ All tests passed!');
    return 0;
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('\n✗ Some tests failed');
    return 1;
  }
}

/**
 * Show usage instructions
 */
function showHelp() {
  console.log(`
Security Gate Utilities - Integration Verification

Usage:
  node validate-utils.js [options]

Options:
  --test-all    Run all unit tests for security gate utilities
  --help        Show this help message

Examples:
  node validate-utils.js --test-all
  node validate-utils.js --help

Tests Included:
  - error-handler.test.js: Error code translation and messages
  - logger.test.js: IP anonymization and user agent truncation
  - rate-limiter.test.js: Cookie-based session rate limiting
  - turnstile-utils.test.js: Cloudflare Turnstile API validation
`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--test-all')) {
  const exitCode = runAllTests();
  process.exit(exitCode);
}

// Default: show help if no valid argument provided
showHelp();
process.exit(0);
