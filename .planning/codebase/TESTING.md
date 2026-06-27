# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Runner:**
- **Vitest**: For unit testing (`vitest.config.js`).
- **Playwright**: For E2E testing (`playwright.config.ts`).

**Assertion Library:**
- `expect` from both Vitest and Playwright.

**Run Commands:**
```bash
npm run test           # Run Vitest unit tests
npm run test:e2e       # Run Playwright E2E tests
```

## Test File Organization

**Location:**
- Unit tests are located in `tests/[milestone-name]/` (e.g., `tests/03-security-gates/`).
- E2E tests are located in the root of `tests/`.

**Naming:**
- Unit: `*.test.js`
- E2E: `*.spec.ts`

## Test Structure

**Unit Tests (Vitest):**
```javascript
import { describe, it, expect } from 'vitest';
import { someFunction } from '../../src/api/shared/file.js';

describe('someFunction', () => {
  it('does something correctly', () => {
    expect(someFunction()).toBe(true);
  });
});
```

**E2E Tests (Playwright):**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('scenario', async ({ page }) => {
    await page.goto('/path');
    await expect(page.locator('#element')).toBeVisible();
  });
});
```

## Mocking

**Framework:** Vitest `vi`.

**Patterns:**
- Mocking global `fetch` for API testing.
- Example: `global.fetch = vi.fn().mockResolvedValue(mockResponse);` in `tests/03-security-gates/turnstile-utils.test.js`.

## Fixtures and Factories

**Test Fixtures:**
- Custom Playwright fixtures defined in `tests/fixtures.ts`.
- Includes navigation helpers like `navigateToVerifyDanny`.

**Location:**
- `tests/fixtures.ts`
- `tests/helpers/navigation.ts`

## Test Types

**Unit Tests:**
- Focus on utility functions in `src/api/shared/`.
- Isolated from external network (mocked fetch).

**E2E Tests:**
- Focus on UI interactions and integration with real/staging services.
- Verification of Turnstile widget presence and page navigation.
