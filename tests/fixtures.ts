import { test as base, Page } from '@playwright/test';
import { navigateToVerifyDanny, navigateToVerifyHelen, waitForTurnstileWidget, waitForSubmitButtonEnabled } from './helpers/navigation';

/**
 * Extended test fixtures for verification gate tests
 */

export interface TestFixtures {
  // Navigation helpers
  navigateToVerifyDanny: typeof navigateToVerifyDanny;
  navigateToVerifyHelen: typeof navigateToVerifyHelen;
  
  // Wait helpers
  waitForTurnstileWidget: typeof waitForTurnstileWidget;
  waitForSubmitButtonEnabled: typeof waitForSubmitButtonEnabled;
}

export const test = base.extend<TestFixtures>({
  navigateToVerifyDanny: async ({ page }, use) => {
    await use(navigateToVerifyDanny);
  },
  
  navigateToVerifyHelen: async ({ page }, use) => {
    await use(navigateToVerifyHelen);
  },
  
  waitForTurnstileWidget: async ({ page }, use) => {
    await use(waitForTurnstileWidget);
  },
  
  waitForSubmitButtonEnabled: async ({ page }, use) => {
    await use(waitForSubmitButtonEnabled);
  },
});

export { expect } from '@playwright/test';
